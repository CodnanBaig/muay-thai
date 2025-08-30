import { SessionRecord, UserProgress, WeeklyStats, MonthlyStats, Milestone } from '../types';
import { StorageService } from './StorageService';
import { daysBetween, getTodayDateString, isToday } from '../utils/dateHelpers';

export class ProgressService {
  // Record a new session
  static async recordSession(session: SessionRecord): Promise<void> {
    try {
      const progress = await StorageService.getProgress();
      
      // Add to session history
      progress.sessionHistory.push(session);
      progress.totalSessions += 1;
      progress.lastSessionDate = session.date;

      // Update streak
      progress.currentStreak = this.calculateStreak(progress.sessionHistory);
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }

      await StorageService.saveProgress(progress);
    } catch (error) {
      console.error('Error recording session:', error);
      throw error;
    }
  }

  // Calculate current streak based on session history
  static calculateStreak(sessions: SessionRecord[]): number {
    if (sessions.length === 0) return 0;

    // Sort sessions by date (newest first)
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get unique dates (in case of multiple sessions per day)
    const uniqueDates = [...new Set(
      sortedSessions.map(session => session.date.split('T')[0])
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (uniqueDates.length === 0) return 0;

    const today = getTodayDateString();
    let streak = 0;
    let currentDate = today;

    // Check if we trained today or yesterday (streak can continue from yesterday)
    let startIndex = 0;
    if (uniqueDates[0] === today) {
      streak = 1;
      startIndex = 1;
      currentDate = this.getPreviousDay(today);
    } else if (uniqueDates[0] === this.getPreviousDay(today)) {
      streak = 1;
      startIndex = 1;
      currentDate = this.getPreviousDay(uniqueDates[0]);
    } else {
      // No recent training, streak is 0
      return 0;
    }

    // Count consecutive days backwards
    for (let i = startIndex; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === currentDate) {
        streak++;
        currentDate = this.getPreviousDay(currentDate);
      } else {
        break;
      }
    }

    return streak;
  }

  // Get weekly statistics
  static async getWeeklyStats(): Promise<WeeklyStats[]> {
    try {
      const progress = await StorageService.getProgress();
      const sessions = progress.sessionHistory;
      
      // Group sessions by week
      const weeklyData: { [key: string]: SessionRecord[] } = {};
      
      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const weekStart = this.getWeekStart(sessionDate);
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(session);
      });

      // Calculate stats for each week
      const weeklyStats: WeeklyStats[] = Object.entries(weeklyData).map(([week, weekSessions]) => {
        const totalSessions = weekSessions.length;
        const totalDuration = weekSessions.reduce((sum, session) => sum + session.duration, 0);
        const averageSessionLength = totalSessions > 0 ? totalDuration / totalSessions : 0;

        return {
          week,
          totalSessions,
          totalDuration,
          averageSessionLength: Math.round(averageSessionLength)
        };
      });

      // Sort by week (newest first)
      return weeklyStats.sort((a, b) => b.week.localeCompare(a.week));
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return [];
    }
  }

  // Get monthly statistics
  static async getMonthlyStats(): Promise<MonthlyStats[]> {
    try {
      const progress = await StorageService.getProgress();
      const sessions = progress.sessionHistory;
      
      // Group sessions by month
      const monthlyData: { [key: string]: SessionRecord[] } = {};
      
      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const monthKey = `${sessionDate.getFullYear()}-${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(session);
      });

      // Calculate stats for each month
      const monthlyStats: MonthlyStats[] = Object.entries(monthlyData).map(([month, monthSessions]) => {
        const totalSessions = monthSessions.length;
        const totalDuration = monthSessions.reduce((sum, session) => sum + session.duration, 0);
        const averageSessionLength = totalSessions > 0 ? totalDuration / totalSessions : 0;
        
        // Calculate training days in month
        const uniqueDays = new Set(
          monthSessions.map(session => session.date.split('T')[0])
        );
        const streakDays = uniqueDays.size;

        return {
          month,
          totalSessions,
          totalDuration,
          averageSessionLength: Math.round(averageSessionLength),
          streakDays
        };
      });

      // Sort by month (newest first)
      return monthlyStats.sort((a, b) => b.month.localeCompare(a.month));
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      return [];
    }
  }

  // Get achievements/milestones
  static async getMilestones(): Promise<Milestone[]> {
    try {
      const progress = await StorageService.getProgress();
      
      const milestones: Milestone[] = [
        {
          id: 'first_session',
          title: 'First Training 🥊',
          description: 'Complete your first training session',
          achieved: progress.totalSessions >= 1,
          achievedDate: progress.totalSessions >= 1 ? progress.sessionHistory[0]?.date : undefined,
          target: 1,
          current: progress.totalSessions,
          type: 'sessions'
        },
        {
          id: 'ten_sessions',
          title: 'Dedicated Fighter 💪',
          description: 'Complete 10 training sessions',
          achieved: progress.totalSessions >= 10,
          achievedDate: progress.totalSessions >= 10 ? progress.sessionHistory[9]?.date : undefined,
          target: 10,
          current: progress.totalSessions,
          type: 'sessions'
        },
        {
          id: 'fifty_sessions',
          title: 'Nak Muay Warrior 🏆',
          description: 'Complete 50 training sessions',
          achieved: progress.totalSessions >= 50,
          target: 50,
          current: progress.totalSessions,
          type: 'sessions'
        },
        {
          id: 'first_streak',
          title: 'Consistency Champion 🔥',
          description: 'Maintain a 3-day training streak',
          achieved: progress.currentStreak >= 3 || progress.longestStreak >= 3,
          target: 3,
          current: Math.max(progress.currentStreak, progress.longestStreak),
          type: 'streak'
        },
        {
          id: 'week_streak',
          title: 'Weekly Warrior 📅',
          description: 'Maintain a 7-day training streak',
          achieved: progress.longestStreak >= 7,
          target: 7,
          current: progress.longestStreak,
          type: 'streak'
        },
        {
          id: 'total_duration',
          title: 'Time Master ⏰',
          description: 'Complete 10 hours of training',
          achieved: this.getTotalDuration(progress.sessionHistory) >= 600, // 10 hours in minutes
          target: 600,
          current: this.getTotalDuration(progress.sessionHistory),
          type: 'duration'
        }
      ];

      return milestones;
    } catch (error) {
      console.error('Error getting milestones:', error);
      return [];
    }
  }

  // Reset progress (for testing or user request)
  static async resetProgress(): Promise<void> {
    try {
      const defaultProgress: UserProgress = {
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: '',
        sessionHistory: []
      };
      
      await StorageService.saveProgress(defaultProgress);
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }

  // Get motivational message based on progress
  static async getMotivationalMessage(): Promise<string> {
    try {
      const progress = await StorageService.getProgress();
      
      if (progress.totalSessions === 0) {
        return "Ready to start your Muay Thai journey? 🥊";
      }
      
      if (progress.currentStreak === 0 && progress.totalSessions > 0) {
        return "Time to get back on track! Every champion faces setbacks 💪";
      }
      
      if (progress.currentStreak >= 7) {
        return `Amazing ${progress.currentStreak}-day streak! You're on fire! 🔥`;
      }
      
      if (progress.currentStreak >= 3) {
        return `Great ${progress.currentStreak}-day streak! Keep the momentum going! ⚡`;
      }
      
      if (progress.totalSessions >= 50) {
        return "You're becoming a true Nak Muay! Keep training! 🏆";
      }
      
      if (progress.totalSessions >= 10) {
        return "You're showing real dedication! Keep it up! 💪";
      }
      
      return "Great progress! Every session makes you stronger! 🥊";
    } catch (error) {
      console.error('Error getting motivational message:', error);
      return "Train hard, fight easy! 🥊";
    }
  }

  // Private helper methods
  private static getPreviousDay(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  private static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  private static getTotalDuration(sessions: SessionRecord[]): number {
    return sessions.reduce((total, session) => total + session.duration, 0);
  }
}