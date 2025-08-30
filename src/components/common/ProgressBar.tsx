import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../utils/constants';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = colors.surface,
  progressColor = colors.primary,
  showPercentage = false,
  style
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, style]}>
      <View 
        style={[
          styles.track, 
          { 
            height, 
            backgroundColor 
          }
        ]}
      >
        <View 
          style={[
            styles.fill, 
            { 
              height, 
              backgroundColor: progressColor,
              width: `${clampedProgress}%` 
            }
          ]} 
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  percentage: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});