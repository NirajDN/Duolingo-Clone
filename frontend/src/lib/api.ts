import { API_BASE, fetchWithRetry, parseJsonResponse, warmBackendBriefly, startBackendWake } from './http';
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
  await warmBackendBriefly();

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
}

function cacheDashboard(data: DashboardData, userId?: number) {
  writeCache('duo_dashboard', data, userId);
  writeCache('duo_path', data.path, userId);
  writeCache('duo_stats', data.stats, userId);
}

export function getCachedDashboard(): DashboardData | null {
  const userId = getUserId();
  const dashboard = readStaleCache<DashboardData>('duo_dashboard', userId);
  if (dashboard?.path?.length) return dashboard;

  const path = readStaleCache<Unit[]>('duo_path', userId);
  const stats = readStaleCache<UserStats>('duo_stats', userId);
  if (path?.length && stats) return { path, stats };
  return null;
}

export function getCachedPath(): Unit[] | null {
  return getCachedDashboard()?.path ?? readStaleCache<Unit[]>('duo_path', getUserId());
}

export function getCachedStats(): UserStats | null {
  return getCachedDashboard()?.stats ?? readStaleCache<UserStats>('duo_stats', getUserId());
}

async function refreshDashboard(userId?: number): Promise<DashboardData> {
  const data = await authJson<DashboardData>(`${API_BASE}/dashboard/`);
  cacheDashboard(data, userId ?? getUserId());
  return data;
}

export async function fetchDashboard(): Promise<DashboardData> {
  const userId = getUserId();
  const stale = readStaleCache<DashboardData>('duo_dashboard', userId);
  if (stale?.path?.length) {
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

export async function fetchSkillLesson(skillId: number): Promise<Lesson> {
  return authJson<Lesson>(`${API_BASE}/skills/${skillId}/lesson/`);
}

export async function submitLessonResult(lessonId: number, score: number, heartsLost: number) {
  const result = await authJson(`${API_BASE}/lessons/${lessonId}/complete/`, {
    method: 'POST',
    body: JSON.stringify({ score, hearts_lost: heartsLost }),
  });
  invalidateUserCache();
  return result;
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
  return authJson<LeaderboardEntry[]>(`${API_BASE}/leaderboard/`);
}

export async function fetchProfile(): Promise<ProfileData> {
  return authJson<ProfileData>(`${API_BASE}/user/profile/`);
}

export function invalidateUserCache() {
  const userId = getUserId();
  if (!userId || typeof window === 'undefined') return;
  localStorage.removeItem(`duo_dashboard_${userId}`);
  localStorage.removeItem(`duo_path_${userId}`);
  localStorage.removeItem(`duo_stats_${userId}`);
}
