import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../utils/constants';
import { ProgressBar } from '../common';

interface RoundIndicatorProps {
  currentRound: number;
  totalRounds: number;
  isResting: boolean;
  sessionProgress: number;
}

export const RoundIndicator: React.FC<RoundIndicatorProps> = ({
  currentRound,
  totalRounds,
  isResting,
  sessionProgress
}) => {
  const renderRoundDots = () => {
    const dots = [];
    for (let i = 1; i <= totalRounds; i++) {
      const isActive = i === currentRound;
      const isCompleted = i < currentRound;
      
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            isActive && styles.activeDot,
            isCompleted && styles.completedDot
          ]}
        />
      );
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roundText}>
          Round {currentRound} of {totalRounds}
        </Text>
        {isResting && (
          <Text style={styles.restingText}>
            Rest Period
          </Text>
        )}
      </View>
      
      <View style={styles.dotsContainer}>
        {renderRoundDots()}
      </View>
      
      <ProgressBar
        progress={sessionProgress}
        height={6}
        showPercentage={false}
        style={styles.progressBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roundText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  restingText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  activeDot: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  completedDot: {
    backgroundColor: colors.success,
  },
  progressBar: {
    width: '100%',
    maxWidth: 300,
  },
});