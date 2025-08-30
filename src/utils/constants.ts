// Design system constants
export const colors = {
  // Primary Thai boxing colors
  primary: '#DC2626', // Bold red
  secondary: '#FFFFFF', // Pure white
  accent: '#F59E0B', // Gold accents
  
  // Background colors
  background: '#111827', // Dark background
  surface: '#1F2937', // Card backgrounds
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

export const typography = {
  // Headers
  h1: { fontSize: 32, fontWeight: 'bold' as const, color: colors.textPrimary },
  h2: { fontSize: 24, fontWeight: '600' as const, color: colors.textPrimary },
  h3: { fontSize: 20, fontWeight: '600' as const, color: colors.textPrimary },
  
  // Body text
  body: { fontSize: 16, fontWeight: 'normal' as const, color: colors.textPrimary },
  caption: { fontSize: 14, fontWeight: 'normal' as const, color: colors.textSecondary },
  
  // Special
  timer: { fontSize: 48, fontWeight: 'bold' as const, color: colors.primary }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// App constants
export const APP_CONFIG = {
  NAME: 'Nak Muay Trainer',
  TAGLINE: 'Train Muay Thai anywhere 🥊',
  DEFAULT_TIMER_CONFIG: {
    rounds: 3,
    roundDuration: 180, // 3 minutes
    restDuration: 60, // 1 minute
    bellEnabled: true
  },
  MAX_SESSION_HISTORY: 30
};

// Storage keys
export const STORAGE_KEYS = {
  USER_PROGRESS: 'userProgress',
  TIMER_CONFIG: 'timerConfig',
  APP_PREFERENCES: 'appPreferences'
};