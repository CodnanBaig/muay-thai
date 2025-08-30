import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../utils/constants';
import { TimerService } from '../../services';

interface TimerDisplayProps {
  seconds: number;
  isWarning?: boolean;
  isResting?: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  seconds,
  isWarning = false,
  isResting = false
}) => {
  const formattedTime = TimerService.formatTime(seconds);
  
  const getTimerColor = () => {
    if (isWarning && seconds <= 10) {
      return colors.warning;
    }
    if (isResting) {
      return colors.accent;
    }
    return colors.primary;
  };

  const getLabel = () => {
    if (isResting) {
      return 'REST';
    }
    return 'ROUND';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: getTimerColor() }]}>
        {getLabel()}
      </Text>
      <Text 
        style={[
          styles.time, 
          { color: getTimerColor() }
        ]}
        testID="timer-display"
      >
        {formattedTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  label: {
    ...typography.h3,
    marginBottom: spacing.md,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});