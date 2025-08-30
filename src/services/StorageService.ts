import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, TimerConfig, AppPreferences, StoredTimerConfig } from '../types';
import { STORAGE_KEYS, APP_CONFIG } from '../utils/constants';

export class StorageService {
  // Progress-related methods
  static async getProgress(): Promise<UserProgress> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (stored) {
        return JSON.parse(stored);
      }
      // Return default progress if none exists
      return {
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: '',
        sessionHistory: []
      };
    } catch (error) {
      console.error('Error loading progress:', error);
      throw error;
    }
  }

  static async saveProgress(progress: UserProgress): Promise<void> {
    try {
      // Keep only the last 30 sessions to prevent storage bloat
      const trimmedProgress = {
        ...progress,
        sessionHistory: progress.sessionHistory.slice(-APP_CONFIG.MAX_SESSION_HISTORY)
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROGRESS,
        JSON.stringify(trimmedProgress)
      );
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  // Timer configuration methods
  static async getTimerConfig(): Promise<TimerConfig> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_CONFIG);
      if (stored) {
        const storedConfig: StoredTimerConfig = JSON.parse(stored);
        // Return only the TimerConfig part, excluding timestamp
        return {
          rounds: storedConfig.rounds,
          roundDuration: storedConfig.roundDuration,
          restDuration: storedConfig.restDuration,
          bellEnabled: storedConfig.bellEnabled
        };
      }
      // Return default config if none exists
      return APP_CONFIG.DEFAULT_TIMER_CONFIG;
    } catch (error) {
      console.error('Error loading timer config:', error);
      throw error;
    }
  }

  static async saveTimerConfig(config: TimerConfig): Promise<void> {
    try {
      const storedConfig: StoredTimerConfig = {
        ...config,
        lastUsed: new Date().toISOString()
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.TIMER_CONFIG,
        JSON.stringify(storedConfig)
      );
    } catch (error) {
      console.error('Error saving timer config:', error);
      throw error;
    }
  }

  // App preferences methods
  static async getAppPreferences(): Promise<AppPreferences> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_PREFERENCES);
      if (stored) {
        return JSON.parse(stored);
      }
      // Return default preferences if none exist
      return {
        hasCompletedOnboarding: false,
        soundEnabled: true,
        notificationsEnabled: true,
        preferredDifficulty: 'Beginner'
      };
    } catch (error) {
      console.error('Error loading app preferences:', error);
      throw error;
    }
  }

  static async saveAppPreferences(preferences: AppPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving app preferences:', error);
      throw error;
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROGRESS,
        STORAGE_KEYS.TIMER_CONFIG,
        STORAGE_KEYS.APP_PREFERENCES
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  static async exportData(): Promise<string> {
    try {
      const [progress, timerConfig, preferences] = await Promise.all([
        this.getProgress(),
        this.getTimerConfig(),
        this.getAppPreferences()
      ]);

      const exportData = {
        progress,
        timerConfig,
        preferences,
        exportDate: new Date().toISOString()
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  static async importData(dataString: string): Promise<void> {
    try {
      const importData = JSON.parse(dataString);
      
      if (importData.progress) {
        await this.saveProgress(importData.progress);
      }
      if (importData.timerConfig) {
        await this.saveTimerConfig(importData.timerConfig);
      }
      if (importData.preferences) {
        await this.saveAppPreferences(importData.preferences);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}