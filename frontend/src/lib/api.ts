const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
  content: any;
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

export async function fetchPath(): Promise<Unit[]> {
  const res = await fetch(`${API_BASE}/path/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch learning path');
  return res.json();
}

export async function fetchSkillLesson(skillId: number): Promise<Lesson> {
  const res = await fetch(`${API_BASE}/skills/${skillId}/lesson/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch lesson');
  return res.json();
}

export async function submitLessonResult(lessonId: number, score: number, heartsLost: number) {
  const res = await fetch(`${API_BASE}/lessons/${lessonId}/complete/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, hearts_lost: heartsLost }),
  });
  if (!res.ok) throw new Error('Failed to submit lesson result');
  return res.json();
}

export async function fetchUserStats(): Promise<UserStats> {
  const res = await fetch(`${API_BASE}/user/stats/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user stats');
  return res.json();
}

export async function refillHearts() {
  const res = await fetch(`${API_BASE}/user/hearts/refill/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to refill hearts');
  return res.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/leaderboard/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch(`${API_BASE}/user/profile/`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}
