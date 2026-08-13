import { API_BASE, fetchWithRetry, parseJsonResponse, startBackendWake } from './http';
import { readStaleCache, writeCache } from './cache';

function getUserId(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem('duo_user');
    if (!raw) return undefined;
    const user = JSON.parse(raw) as { id?: number };
    return user.id;
  } catch {
    return undefined;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('duo_access') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('duo_access');
  localStorage.removeItem('duo_refresh');
  localStorage.removeItem('duo_user');
}

async function authFetch(url: string, options: RequestInit = {}) {
  void startBackendWake();

  const res = await fetchWithRetry(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
    cache: 'no-store',
  });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  return res;
}

async function authJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await authFetch(url, options);
  const data = await parseJsonResponse<T>(res);
  if (!res.ok) {
    throw new Error('Request failed');
  }
  return data;
}

export interface Skill {
  id: number;
  title: string;
  icon: string;
  order: number;
  total_crowns: number;
  is_unlocked: boolean;
  is_completed: boolean;
  completed_lessons: number;
  current_crown: number;
  total_lessons: number;
  lesson?: Lesson | null;
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  order: number;
  hex_color: string;
  skills: Skill[];
}

export interface Exercise {
  id: number;
  type: 'multiple_choice' | 'translate' | 'match_pairs' | 'fill_blank' | 'type_answer';
  prompt: string;
  order: number;
  content: Record<string, unknown>;
}

export interface Lesson {
  id: number;
  title: string;
  order: number;
  xp_reward: number;
  exercises: Exercise[];
}

export interface UserStats {
  username: string;
  xp: number;
  streak: number;
  last_active_date: string | null;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_xp_goal: number;
  daily_xp_today: number;
}

export interface DashboardData {
  path: Unit[];
  stats: UserStats;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  weekly_xp: number;
  league: string;
  rank: number;
}

/** Re-sort by weekly XP and assign ranks from position (fixes stale cached ranks). */
export function normalizeLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.weekly_xp - a.weekly_xp || a.id - b.id);
  return sorted.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    league: 'Gold',
  }));
}

function resolveLeaderboardRank(username: string, profileLb?: ProfileData['leaderboard']): number {
  if (profileLb?.rank && profileLb.rank > 0) return profileLb.rank;
  const entries = readStaleCache<LeaderboardEntry[]>('duo_leaderboard', getUserId());
  if (!entries?.length) return 0;
  const normalized = normalizeLeaderboardEntries(entries);
  const idx = normalized.findIndex((e) => e.username === username);
  return idx >= 0 ? idx + 1 : 0;
}

export function enrichProfile(profile: ProfileData): ProfileData {
  const entries = readStaleCache<LeaderboardEntry[]>('duo_leaderboard', getUserId());
  const normalized = entries?.length ? normalizeLeaderboardEntries(entries) : [];
  const entry = normalized.find((e) => e.username === profile.username);
  const rank = resolveLeaderboardRank(profile.username, profile.leaderboard);

  return {
    ...profile,
    leaderboard: {
      rank: rank || profile.leaderboard?.rank || 0,
      weekly_xp: profile.leaderboard?.weekly_xp ?? entry?.weekly_xp ?? 0,
      league: profile.leaderboard?.league ?? entry?.league ?? 'Gold',
    },
  };
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  max_progress: number;
  is_unlocked: boolean;
  current_progress: number;
}

export interface ProfileData {
  username: string;
  date_joined: string;
  stats: UserStats;
  achievements: Achievement[];
  leaderboard: {
    rank: number;
    weekly_xp: number;
    league: string;
  };
}

export interface LessonCompletionResult {
  xp_gained: number;
  new_total_xp: number;
  streak: number;
  hearts: number;
  skill_completed: boolean;
  completed_lessons: number;
  current_crown: number;
  next_skill_unlocked_id: number | null;
  streak_increased: boolean;
  leaderboard_rank: number;
  weekly_xp: number;
  league: string;
}

export interface LessonCompleteHighlight {
  skillId: number;
  nextSkillId: number | null;
  streakIncreased: boolean;
  xpGained: number;
}

const LESSON_COMPLETE_KEY = 'duo_lesson_complete';
const LESSON_STAGE_KEY = 'duo_lesson_stage';

function lessonCacheKey(skillId: number) {
  return `duo_lesson_${skillId}`;
}

function cacheDashboard(data: DashboardData, userId?: number) {
  writeCache('duo_dashboard', data, userId);
  writeCache('duo_path', data.path, userId);
  writeCache('duo_stats', data.stats, userId);
  cacheLessonsFromPath(data.path, userId);
}

function cacheLessonsFromPath(path: Unit[], userId?: number) {
  const uid = userId ?? getUserId();
  for (const unit of path) {
    for (const skill of unit.skills) {
      if (skill.is_unlocked && skill.lesson?.exercises?.length) {
        writeCache(lessonCacheKey(skill.id), skill.lesson, uid);
      }
    }
  }
}

export function cacheSkillLesson(skillId: number, lesson: Lesson, userId?: number) {
  writeCache(lessonCacheKey(skillId), lesson, userId ?? getUserId());
}

export function getCachedDashboard(): DashboardData | null {
  const userId = getUserId();
  const dashboard = readStaleCache<DashboardData>('duo_dashboard', userId);
  if (dashboard?.path?.length) return dashboard;

  const path = readStaleCache<Unit[]>('duo_path', userId);
  const stats = readStaleCache<UserStats>('duo_stats', userId);
  if (path?.length && stats) {
    cacheLessonsFromPath(path, userId);
    return { path, stats };
  }
  return null;
}

export function getCachedPath(): Unit[] | null {
  return getCachedDashboard()?.path ?? readStaleCache<Unit[]>('duo_path', getUserId());
}

export function getCachedStats(): UserStats | null {
  return getCachedDashboard()?.stats ?? readStaleCache<UserStats>('duo_stats', getUserId());
}

export function applyLessonCompletionToCache(
  skillId: number,
  result: LessonCompletionResult
) {
  const cached = getCachedDashboard();
  if (!cached) return;

  const stats: UserStats = {
    ...cached.stats,
    xp: result.new_total_xp,
    streak: result.streak,
    hearts: result.hearts,
    daily_xp_today: cached.stats.daily_xp_today + result.xp_gained,
  };

  const path = cached.path.map((unit) => ({
    ...unit,
    skills: unit.skills.map((skill) => {
      if (skill.id === skillId) {
        return {
          ...skill,
          completed_lessons: result.completed_lessons,
          current_crown: result.current_crown,
          is_completed: result.skill_completed,
        };
      }
      if (result.next_skill_unlocked_id && skill.id === result.next_skill_unlocked_id) {
        return { ...skill, is_unlocked: true };
      }
      return skill;
    }),
  }));

  cacheDashboard({ path, stats });
}

function findSkillInPath(path: Unit[], skillId: number): { skill: Skill; unit: Unit } | null {
  for (const unit of path) {
    const skill = unit.skills.find((s) => s.id === skillId);
    if (skill) return { skill, unit };
  }
  return null;
}

function predictNextSkillId(path: Unit[], skillId: number): number | null {
  for (let uIdx = 0; uIdx < path.length; uIdx += 1) {
    const unit = path[uIdx];
    const sIdx = unit.skills.findIndex((s) => s.id === skillId);
    if (sIdx < 0) continue;
    if (sIdx + 1 < unit.skills.length) return unit.skills[sIdx + 1].id;
    if (uIdx + 1 < path.length) {
      const nextUnit = path[uIdx + 1];
      if (nextUnit.skills.length > 0) return nextUnit.skills[0].id;
    }
    return null;
  }
  return null;
}

/** Instant UI values while the server saves in the background. */
export function buildOptimisticLessonResult(
  skillId: number,
  lesson: Lesson,
  heartsLost: number
): LessonCompletionResult | null {
  const cached = getCachedDashboard();
  if (!cached) return null;

  const located = findSkillInPath(cached.path, skillId);
  if (!located) return null;

  const { skill } = located;
  const completedLessons = skill.completed_lessons + 1;
  const lessonsDone = completedLessons >= skill.total_lessons;
  const nextCrown = lessonsDone
    ? Math.min(skill.total_crowns, skill.current_crown + 1)
    : skill.current_crown;
  const skillCompleted = lessonsDone && nextCrown >= skill.total_crowns;
  const xpGained = lesson.xp_reward || 10;
  const today = new Date().toISOString().slice(0, 10);
  const lastActive = cached.stats.last_active_date;
  let streak = cached.stats.streak;
  let streakIncreased = false;

  if (!lastActive) {
    streak = 1;
    streakIncreased = true;
  } else if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    streak = lastActive === yesterdayStr ? streak + 1 : 1;
    streakIncreased = true;
  }

  return {
    xp_gained: xpGained,
    new_total_xp: cached.stats.xp + xpGained,
    streak,
    hearts: Math.max(0, cached.stats.hearts - heartsLost),
    skill_completed: skillCompleted,
    completed_lessons: completedLessons,
    current_crown: nextCrown,
    next_skill_unlocked_id: predictNextSkillId(cached.path, skillId),
    streak_increased: streakIncreased,
    leaderboard_rank: 0,
    weekly_xp: 0,
    league: 'Gold',
  };
}

export function stageOptimisticLessonCompletion(
  skillId: number,
  lesson: Lesson,
  heartsLost: number
): LessonCompletionResult | null {
  const optimistic = buildOptimisticLessonResult(skillId, lesson, heartsLost);
  if (!optimistic) return null;

  applyLessonCompletionToCache(skillId, optimistic);
  setLessonCompleteHighlight({
    skillId,
    nextSkillId: optimistic.next_skill_unlocked_id,
    streakIncreased: optimistic.streak_increased,
    xpGained: optimistic.xp_gained,
  });
  return optimistic;
}

export function setLessonCompleteHighlight(highlight: LessonCompleteHighlight) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(LESSON_COMPLETE_KEY, JSON.stringify(highlight));
  } catch {
    /* ignore */
  }
}

export function consumeLessonCompleteHighlight(): LessonCompleteHighlight | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LESSON_COMPLETE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(LESSON_COMPLETE_KEY);
    return JSON.parse(raw) as LessonCompleteHighlight;
  } catch {
    return null;
  }
}

export function syncDashboardFromCache(): DashboardData | null {
  const cached = getCachedDashboard();
  return cached;
}

async function refreshDashboard(userId?: number): Promise<DashboardData> {
  const data = await authJson<DashboardData>(`${API_BASE}/dashboard/`);
  cacheDashboard(data, userId ?? getUserId());
  prefetchSecondaryPages(userId);
  return data;
}

async function fetchWithStaleCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  userId?: number
): Promise<T> {
  const stale = readStaleCache<T>(cacheKey, userId ?? getUserId());
  if (stale) {
    void fetcher()
      .then((data) => writeCache(cacheKey, data, userId ?? getUserId()))
      .catch(() => {});
    return stale;
  }

  try {
    const data = await fetcher();
    writeCache(cacheKey, data, userId ?? getUserId());
    return data;
  } catch (err) {
    const fallback = readStaleCache<T>(cacheKey, userId ?? getUserId());
    if (fallback) return fallback;
    throw err;
  }
}

async function refreshLeaderboard(userId?: number): Promise<LeaderboardEntry[]> {
  const data = await authJson<LeaderboardEntry[]>(`${API_BASE}/leaderboard/`);
  const normalized = normalizeLeaderboardEntries(data);
  writeCache('duo_leaderboard', normalized, userId ?? getUserId());
  return normalized;
}

async function refreshProfile(userId?: number): Promise<ProfileData> {
  const data = await authJson<ProfileData>(`${API_BASE}/user/profile/`);
  const enriched = enrichProfile(data);
  writeCache('duo_profile', enriched, userId ?? getUserId());
  writeCache('duo_stats', enriched.stats, userId ?? getUserId());
  return enriched;
}

export function getCachedLeaderboard(): LeaderboardEntry[] | null {
  const cached = readStaleCache<LeaderboardEntry[]>('duo_leaderboard', getUserId());
  return cached?.length ? normalizeLeaderboardEntries(cached) : null;
}

export function getCachedProfile(): ProfileData | null {
  const cached = readStaleCache<ProfileData>('duo_profile', getUserId());
  return cached ? enrichProfile(cached) : null;
}

export function prefetchLeaderboard(userId?: number) {
  void startBackendWake();
  void refreshLeaderboard(userId ?? getUserId()).catch(() => {});
}

export function prefetchProfile(userId?: number) {
  void startBackendWake();
  void refreshProfile(userId ?? getUserId()).catch(() => {});
}

export function prefetchSecondaryPages(userId?: number) {
  prefetchLeaderboard(userId);
  prefetchProfile(userId);
  prefetchUnlockedLessons();
}

export function stageSkillLesson(skillId: number, lesson: Lesson) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(LESSON_STAGE_KEY, JSON.stringify({ skillId, lesson }));
    cacheSkillLesson(skillId, lesson);
  } catch {
    /* ignore */
  }
}

function readStagedSkillLesson(skillId: number, consume = false): Lesson | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LESSON_STAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { skillId: number; lesson: Lesson };
    if (parsed.skillId !== skillId || !parsed.lesson?.exercises?.length) return null;
    if (consume) sessionStorage.removeItem(LESSON_STAGE_KEY);
    return parsed.lesson;
  } catch {
    return null;
  }
}

export function resolveSkillLesson(skillId: number): Lesson | null {
  const staged = readStagedSkillLesson(skillId, true);
  if (staged) return staged;
  return getCachedSkillLesson(skillId);
}

export function getCachedSkillLesson(skillId: number): Lesson | null {
  return readStaleCache<Lesson>(lessonCacheKey(skillId), getUserId());
}

async function refreshSkillLesson(skillId: number): Promise<Lesson> {
  const data = await authJson<Lesson>(`${API_BASE}/skills/${skillId}/lesson/`);
  writeCache(lessonCacheKey(skillId), data, getUserId());
  return data;
}

export function prefetchSkillLesson(skillId: number) {
  void startBackendWake();
  void refreshSkillLesson(skillId).catch(() => {});
}

export function prefetchUnlockedLessons() {
  const path = getCachedPath();
  if (!path) return;
  for (const unit of path) {
    for (const skill of unit.skills) {
      if (skill.is_unlocked) {
        if (skill.lesson?.exercises?.length) {
          cacheSkillLesson(skill.id, skill.lesson);
        } else {
          prefetchSkillLesson(skill.id);
        }
      }
    }
  }
}

export async function fetchSkillLesson(skillId: number): Promise<Lesson> {
  const cached = getCachedSkillLesson(skillId);
  if (cached?.exercises?.length) {
    void refreshSkillLesson(skillId).catch(() => {});
    return cached;
  }
  return fetchWithStaleCache(lessonCacheKey(skillId), () => refreshSkillLesson(skillId));
}

export function invalidateSkillLessonCache(skillId: number) {
  const userId = getUserId();
  if (!userId || typeof window === 'undefined') return;
  localStorage.removeItem(`${lessonCacheKey(skillId)}_${userId}`);
}

export async function fetchDashboard(): Promise<DashboardData> {
  const userId = getUserId();
  const stale = readStaleCache<DashboardData>('duo_dashboard', userId);
  if (stale?.path?.length) {
    const missingEmbeddedLessons = stale.path.some((unit) =>
      unit.skills.some((skill) => skill.is_unlocked && !skill.lesson?.exercises?.length)
    );
    if (missingEmbeddedLessons) {
      try {
        return await refreshDashboard(userId);
      } catch (err) {
        void refreshDashboard(userId).catch(() => {});
        return stale;
      }
    }
    void refreshDashboard(userId).catch(() => {});
    return stale;
  }

  try {
    return await refreshDashboard(userId);
  } catch (err) {
    const fallback = getCachedDashboard();
    if (fallback) return fallback;
    throw err;
  }
}

export function prefetchDashboard(userId?: number) {
  void startBackendWake();
  void refreshDashboard(userId ?? getUserId()).catch(() => {});
}

export async function fetchPath(): Promise<Unit[]> {
  const data = await fetchDashboard();
  return data.path;
}

export async function submitLessonResult(
  lessonId: number,
  score: number,
  heartsLost: number,
  skillId?: number
): Promise<LessonCompletionResult> {
  const result = await authJson<LessonCompletionResult>(
    `${API_BASE}/lessons/${lessonId}/complete/`,
    {
      method: 'POST',
      body: JSON.stringify({ score, hearts_lost: heartsLost }),
    }
  );

  if (skillId) {
    applyLessonCompletionToCache(skillId, result);
    setLessonCompleteHighlight({
      skillId,
      nextSkillId: result.next_skill_unlocked_id,
      streakIncreased: result.streak_increased,
      xpGained: result.xp_gained,
    });
  }

  void refreshDashboard().catch(() => {});
  invalidateLeaderboardCache();
  invalidateProfileCache();
  void refreshLeaderboard().catch(() => {});
  void refreshProfile().catch(() => {});
  return result;
}

/** Fire-and-forget save; reconciles cache when the server responds. */
export function submitLessonResultInBackground(
  lessonId: number,
  score: number,
  heartsLost: number,
  skillId: number,
  onResult?: (result: LessonCompletionResult) => void
) {
  void submitLessonResult(lessonId, score, heartsLost, skillId)
    .then((result) => onResult?.(result))
    .catch((err) => console.error('Background lesson save failed:', err));
}

export async function fetchUserStats(): Promise<UserStats> {
  const data = await fetchDashboard();
  return data.stats;
}

export async function refillHearts() {
  const result = await authJson(`${API_BASE}/user/hearts/refill/`, { method: 'POST' });
  invalidateUserCache();
  return result;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await fetchWithStaleCache('duo_leaderboard', () => refreshLeaderboard());
  return normalizeLeaderboardEntries(data);
}

export async function fetchProfile(): Promise<ProfileData> {
  const userId = getUserId();
  const stale = readStaleCache<ProfileData>('duo_profile', userId);
  const enrichedStale = stale ? enrichProfile(stale) : null;

  if (!enrichedStale?.leaderboard?.rank) {
    try {
      return await refreshProfile(userId);
    } catch (err) {
      if (enrichedStale) return enrichedStale;
      throw err;
    }
  }

  void refreshProfile(userId).catch(() => {});
  return enrichedStale;
}

export function invalidateProfileCache() {
  const userId = getUserId();
  if (!userId || typeof window === 'undefined') return;
  localStorage.removeItem(`duo_profile_${userId}`);
}

export function invalidateLeaderboardCache() {
  const userId = getUserId();
  if (!userId || typeof window === 'undefined') return;
  localStorage.removeItem(`duo_leaderboard_${userId}`);
}

export function invalidateUserCache() {
  const userId = getUserId();
  if (!userId || typeof window === 'undefined') return;
  localStorage.removeItem(`duo_dashboard_${userId}`);
  localStorage.removeItem(`duo_path_${userId}`);
  localStorage.removeItem(`duo_stats_${userId}`);
  invalidateLeaderboardCache();
  invalidateProfileCache();
}
