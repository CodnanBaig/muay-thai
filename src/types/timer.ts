export interface TimerConfig {
  rounds: number;
  roundDuration: number; // seconds
  restDuration: number; // seconds
  bellEnabled: boolean;
}

export interface TimerState {
  currentRound: number;
  timeRemaining: number;
  isActive: boolean;
  isResting: boolean;
}

export interface TimerSession {
  id: string;
  config: TimerConfig;
  state: TimerState;
  startTime: Date;
  endTime?: Date;
  totalDuration: number; // minutes
}

export interface StoredTimerConfig extends TimerConfig {
  lastUsed: string;
}