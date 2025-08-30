export interface SessionRecord {
  id: string;
  date: string;
  type: 'combo' | 'timer' | 'mixed';
  duration: number; // minutes
  details: any;
}

export interface UserProgress {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
  sessionHistory: SessionRecord[];
}

export interface StoredProgress extends UserProgress {
  // Additional stored data
}

export interface WeeklyStats {
  week: string;
  totalSessions: number;
  totalDuration: number;
  averageSessionLength: number;
}

export interface MonthlyStats {
  month: string;
  totalSessions: number;
  totalDuration: number;
  averageSessionLength: number;
  streakDays: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: string;
  target: number;
  current: number;
  type: 'sessions' | 'streak' | 'duration';
}

export interface AppPreferences {
  hasCompletedOnboarding: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  preferredDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}