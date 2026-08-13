import { API_BASE, fetchWithRetry, parseJsonResponse } from './http';

// ─── Auth helpers ─────────────────────────────────────────────────────────────
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

// ─── Interfaces ───────────────────────────────────────────────────────────────
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

// ─── API Functions ────────────────────────────────────────────────────────────
export async function fetchPath(): Promise<Unit[]> {
  return authJson<Unit[]>(`${API_BASE}/path/`);
}

export async function fetchSkillLesson(skillId: number): Promise<Lesson> {
  return authJson<Lesson>(`${API_BASE}/skills/${skillId}/lesson/`);
}

export async function submitLessonResult(lessonId: number, score: number, heartsLost: number) {
  return authJson(`${API_BASE}/lessons/${lessonId}/complete/`, {
    method: 'POST',
    body: JSON.stringify({ score, hearts_lost: heartsLost }),
  });
}

export async function fetchUserStats(): Promise<UserStats> {
  return authJson<UserStats>(`${API_BASE}/user/stats/`);
}

export async function refillHearts() {
  return authJson(`${API_BASE}/user/hearts/refill/`, { method: 'POST' });
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return authJson<LeaderboardEntry[]>(`${API_BASE}/leaderboard/`);
}

export async function fetchProfile(): Promise<ProfileData> {
  return authJson<ProfileData>(`${API_BASE}/user/profile/`);
}
