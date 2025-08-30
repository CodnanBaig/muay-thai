import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { AppState } from 'react-native';
import { TimerConfig, TimerSession } from '../types';
import { TimerService, StorageService } from '../services';
import { useProgress } from './ProgressContext';

interface TimerContextType {
  timerConfig: TimerConfig;
  currentSession: TimerSession | null;
  isLoading: boolean;
  updateTimerConfig: (config: Partial<TimerConfig>) => Promise<void>;
  startSession: () => void;
  pauseSession: () => void;
  resetSession: () => void;
  stopSession: () => void;
  isSessionActive: boolean;
  isSessionComplete: boolean;
  sessionProgress: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const { updateProgress } = useProgress();
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({
    rounds: 3,
    roundDuration: 180,
    restDuration: 60,
    bellEnabled: true
  });
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Load timer config on mount
  useEffect(() => {
    loadTimerConfig();
    initializeTimerService();

    // Handle app state changes for background timer
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      clearTimer();
    };
  }, []);

  // Start/stop timer interval based on session state
  useEffect(() => {
    if (currentSession?.state.isActive) {
      startTimer();
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [currentSession?.state.isActive]);

  const loadTimerConfig = async () => {
    try {
      setIsLoading(true);
      const config = await StorageService.getTimerConfig();
      setTimerConfig(config);
    } catch (error) {
      console.error('Error loading timer config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTimerService = async () => {
    try {
      await TimerService.initialize();
    } catch (error) {
      console.error('Error initializing timer service:', error);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground - sync timer
      syncBackgroundTimer();
    }
    appStateRef.current = nextAppState;
  };

  const syncBackgroundTimer = () => {
    if (!currentSession?.state.isActive) return;

    // Calculate time elapsed while app was in background
    // For now, we'll keep the timer running in foreground only
    // In a production app, you'd want to calculate elapsed time and update accordingly
  };

  const startTimer = () => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setCurrentSession(prev => {
        if (!prev) return null;
        return TimerService.tickTimer(prev);
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateTimerConfig = async (configUpdates: Partial<TimerConfig>) => {
    try {
      const newConfig = { ...timerConfig, ...configUpdates };
      setTimerConfig(newConfig);
      await StorageService.saveTimerConfig(newConfig);
    } catch (error) {
      console.error('Error updating timer config:', error);
      throw error;
    }
  };

  const startSession = () => {
    if (!currentSession) {
      // Create new session
      const newSession = TimerService.createSession(timerConfig);
      const startedSession = TimerService.startTimer(newSession);
      setCurrentSession(startedSession);
    } else {
      // Resume existing session
      const resumedSession = TimerService.startTimer(currentSession);
      setCurrentSession(resumedSession);
    }
  };

  const pauseSession = () => {
    if (currentSession) {
      const pausedSession = TimerService.pauseTimer(currentSession);
      setCurrentSession(pausedSession);
    }
  };

  const resetSession = () => {
    if (currentSession) {
      const resetSession = TimerService.resetTimer(currentSession);
      setCurrentSession(resetSession);
    }
  };

  const stopSession = () => {
    clearTimer();
    setCurrentSession(null);
  };

  // Check if session is complete and handle completion
  useEffect(() => {
    if (currentSession && TimerService.isSessionComplete(currentSession)) {
      handleSessionCompletion();
    }
  }, [currentSession]);

  const handleSessionCompletion = async () => {
    if (!currentSession) return;

    try {
      // Record session in progress
      const sessionRecord = {
        id: currentSession.id,
        date: new Date().toISOString(),
        type: 'timer' as const,
        duration: currentSession.totalDuration || Math.round(
          (Date.now() - currentSession.startTime.getTime()) / (1000 * 60)
        ),
        details: {
          rounds: currentSession.config.rounds,
          roundDuration: currentSession.config.roundDuration,
          restDuration: currentSession.config.restDuration,
          completed: true
        }
      };

      await updateProgress(sessionRecord);
    } catch (error) {
      console.error('Error recording completed session:', error);
    }
  };

  const isSessionActive = currentSession?.state.isActive || false;
  const isSessionComplete = currentSession ? TimerService.isSessionComplete(currentSession) : false;
  const sessionProgress = currentSession ? TimerService.getSessionProgress(currentSession) : 0;

  const value: TimerContextType = {
    timerConfig,
    currentSession,
    isLoading,
    updateTimerConfig,
    startSession,
    pauseSession,
    resetSession,
    stopSession,
    isSessionActive,
    isSessionComplete,
    sessionProgress
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};