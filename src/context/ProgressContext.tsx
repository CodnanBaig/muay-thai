import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProgress, SessionRecord } from '../types';
import { ProgressService, StorageService } from '../services';

interface ProgressContextType {
  userProgress: UserProgress;
  isLoading: boolean;
  updateProgress: (session: SessionRecord) => Promise<void>;
  resetProgress: () => Promise<void>;
  getStreak: () => number;
  refreshProgress: () => Promise<void>;
  getMotivationalMessage: () => Promise<string>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: '',
    sessionHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const progress = await StorageService.getProgress();
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (session: SessionRecord) => {
    try {
      // Update local state immediately for UI responsiveness
      const updatedProgress = {
        ...userProgress,
        sessionHistory: [...userProgress.sessionHistory, session],
        totalSessions: userProgress.totalSessions + 1,
        lastSessionDate: session.date
      };

      // Calculate new streak
      updatedProgress.currentStreak = ProgressService.calculateStreak(updatedProgress.sessionHistory);
      if (updatedProgress.currentStreak > updatedProgress.longestStreak) {
        updatedProgress.longestStreak = updatedProgress.currentStreak;
      }

      setUserProgress(updatedProgress);

      // Persist to storage
      await StorageService.saveProgress(updatedProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
      // Reload from storage if update fails
      await loadProgress();
      throw error;
    }
  };

  const resetProgress = async () => {
    try {
      await ProgressService.resetProgress();
      await loadProgress();
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  };

  const getStreak = (): number => {
    return userProgress.currentStreak;
  };

  const refreshProgress = async () => {
    await loadProgress();
  };

  const getMotivationalMessage = async (): Promise<string> => {
    try {
      return await ProgressService.getMotivationalMessage();
    } catch (error) {
      console.error('Error getting motivational message:', error);
      return "Train hard, fight easy! 🥊";
    }
  };

  const value: ProgressContextType = {
    userProgress,
    isLoading,
    updateProgress,
    resetProgress,
    getStreak,
    refreshProgress,
    getMotivationalMessage
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};