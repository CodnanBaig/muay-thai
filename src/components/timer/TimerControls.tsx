import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../common';
import { spacing } from '../../utils/constants';

interface TimerControlsProps {
  isActive: boolean;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isActive,
  isComplete,
  onStart,
  onPause,
  onReset,
  onStop,
  disabled = false
}) => {
  if (isComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Button
            title="New Session"
            onPress={onReset}
            style={styles.button}
            disabled={disabled}
          />
          <Button
            title="Done"
            onPress={onStop}
            variant="secondary"
            style={styles.button}
            disabled={disabled}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button
          title={isActive ? "Pause" : "Start"}
          onPress={isActive ? onPause : onStart}
          style={styles.button}
          disabled={disabled}
        />
        <Button
          title="Reset"
          onPress={onReset}
          variant="secondary"
          style={styles.button}
          disabled={disabled}
        />
      </View>
      <Button
        title="Stop"
        onPress={onStop}
        variant="danger"
        size="small"
        style={styles.stopButton}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  stopButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
});