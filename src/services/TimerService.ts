import { Audio } from 'expo-av';
import { TimerConfig, TimerState, TimerSession } from '../types';
import { StorageService } from './StorageService';

export class TimerService {
  private static sound: Audio.Sound | null = null;
  private static isInitialized = false;

  // Initialize audio
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // Create a new timer session
  static createSession(config: TimerConfig): TimerSession {
    const session: TimerSession = {
      id: Date.now().toString(),
      config,
      state: {
        currentRound: 1,
        timeRemaining: config.roundDuration,
        isActive: false,
        isResting: false,
      },
      startTime: new Date(),
      totalDuration: 0
    };

    return session;
  }

  // Start or resume timer
  static startTimer(session: TimerSession): TimerSession {
    const updatedSession = {
      ...session,
      state: {
        ...session.state,
        isActive: true,
      }
    };

    // Play bell sound if enabled
    if (session.config.bellEnabled) {
      this.playBellSound();
    }

    return updatedSession;
  }

  // Pause timer
  static pauseTimer(session: TimerSession): TimerSession {
    return {
      ...session,
      state: {
        ...session.state,
        isActive: false,
      }
    };
  }

  // Reset timer to initial state
  static resetTimer(session: TimerSession): TimerSession {
    return {
      ...session,
      state: {
        currentRound: 1,
        timeRemaining: session.config.roundDuration,
        isActive: false,
        isResting: false,
      },
      startTime: new Date(),
    };
  }

  // Tick timer (reduce time by 1 second)
  static tickTimer(session: TimerSession): TimerSession {
    if (!session.state.isActive) {
      return session;
    }

    const newTimeRemaining = session.state.timeRemaining - 1;

    // Time is up for current phase
    if (newTimeRemaining <= 0) {
      return this.handlePhaseTransition(session);
    }

    // Just update time
    return {
      ...session,
      state: {
        ...session.state,
        timeRemaining: newTimeRemaining,
      }
    };
  }

  // Handle transition between rounds and rest periods
  private static handlePhaseTransition(session: TimerSession): TimerSession {
    const { state, config } = session;

    // If we're in a rest period, move to next round
    if (state.isResting) {
      const nextRound = state.currentRound + 1;
      
      // Check if we've completed all rounds
      if (nextRound > config.rounds) {
        return this.completeSession(session);
      }

      // Start next round
      const updatedSession = {
        ...session,
        state: {
          currentRound: nextRound,
          timeRemaining: config.roundDuration,
          isActive: true,
          isResting: false,
        }
      };

      // Play bell for round start
      if (config.bellEnabled) {
        this.playBellSound();
      }

      return updatedSession;
    } else {
      // Round finished, start rest period
      const updatedSession = {
        ...session,
        state: {
          ...state,
          timeRemaining: config.restDuration,
          isResting: true,
        }
      };

      // Play bell for rest start
      if (config.bellEnabled) {
        this.playBellSound();
      }

      return updatedSession;
    }
  }

  // Complete the timer session
  private static completeSession(session: TimerSession): TimerSession {
    const completedSession = {
      ...session,
      state: {
        ...session.state,
        isActive: false,
        timeRemaining: 0,
      },
      endTime: new Date(),
    };

    // Calculate total duration
    const durationMs = completedSession.endTime.getTime() - session.startTime.getTime();
    completedSession.totalDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes

    // Play completion bell
    if (session.config.bellEnabled) {
      this.playBellSound();
    }

    // Record session in progress
    this.recordTimerSession(completedSession);

    return completedSession;
  }

  // Record completed timer session
  private static async recordTimerSession(session: TimerSession): Promise<void> {
    try {
      const progress = await StorageService.getProgress();
      
      const sessionRecord = {
        id: session.id,
        date: session.endTime?.toISOString() || new Date().toISOString(),
        type: 'timer' as const,
        duration: session.totalDuration,
        details: {
          rounds: session.config.rounds,
          roundDuration: session.config.roundDuration,
          restDuration: session.config.restDuration,
          completed: true
        }
      };

      // Add to session history
      progress.sessionHistory.push(sessionRecord);
      progress.totalSessions += 1;
      progress.lastSessionDate = sessionRecord.date;

      // Update streak (import ProgressService to avoid circular dependency)
      const ProgressService = await import('./ProgressService');
      progress.currentStreak = ProgressService.ProgressService.calculateStreak(progress.sessionHistory);
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }

      await StorageService.saveProgress(progress);
    } catch (error) {
      console.error('Error recording timer session:', error);
    }
  }

  // Play bell sound
  static async playBellSound(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Check if sound is enabled in preferences
      const preferences = await StorageService.getAppPreferences();
      if (!preferences.soundEnabled) {
        return;
      }

      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Note: In a real app, you would load the actual bell.mp3 file
      // For now, we'll use a placeholder approach
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../assets/sounds/bell.mp3')
      // );
      
      // For demonstration, we'll log instead of playing actual sound
      console.log('🔔 Bell sound played!');
      
      // this.sound = sound;
      // await sound.playAsync();
    } catch (error) {
      console.error('Error playing bell sound:', error);
    }
  }

  // Get formatted time display
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Check if session is complete
  static isSessionComplete(session: TimerSession): boolean {
    return session.state.currentRound > session.config.rounds && 
           !session.state.isActive;
  }

  // Get session progress percentage
  static getSessionProgress(session: TimerSession): number {
    const totalTime = (session.config.roundDuration + session.config.restDuration) * session.config.rounds;
    const completedRounds = session.state.currentRound - 1;
    const completedTime = completedRounds * (session.config.roundDuration + session.config.restDuration);
    
    let currentPhaseTime = 0;
    if (session.state.isResting) {
      currentPhaseTime = session.config.roundDuration + (session.config.restDuration - session.state.timeRemaining);
    } else {
      currentPhaseTime = session.config.roundDuration - session.state.timeRemaining;
    }

    const totalElapsed = completedTime + currentPhaseTime;
    return Math.min(100, (totalElapsed / totalTime) * 100);
  }

  // Clean up resources
  static async cleanup(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Error cleaning up timer service:', error);
    }
  }
}