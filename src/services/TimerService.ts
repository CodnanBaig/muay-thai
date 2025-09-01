import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { TimerConfig, TimerState, TimerSession } from '../types';
import { StorageService } from './StorageService';

export class TimerService {
  private static player: any = null;
  private static isInitialized = false;

  // Initialize audio
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
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

      // For web platform, use Web Audio API to generate a bell sound
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a bell-like sound using oscillators
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Set frequencies for a bell-like sound
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
        
        // Connect nodes
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set volume and envelope
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        // Play the sound
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.8);
        oscillator2.stop(audioContext.currentTime + 0.8);
        
        console.log('🔔 Bell sound played!');
      } else {
        // For mobile platforms, you would use expo-audio with an actual sound file
        // const player = createAudioPlayer(require('../../assets/sounds/bell.mp3'));
        // await player.play();
        console.log('🔔 Bell sound played! (Mobile platform)');
      }
      
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
      if (this.player) {
        await this.player.remove();
        this.player = null;
      }
    } catch (error) {
      console.error('Error cleaning up timer service:', error);
    }
  }
}