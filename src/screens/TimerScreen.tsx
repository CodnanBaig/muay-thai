import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Modal, TouchableOpacity } from 'react-native';
import { TimerScreenProps } from '../types';
import { TimerDisplay, TimerControls, RoundIndicator } from '../components/timer';
import { Button, Card, LoadingSpinner } from '../components/common';
import { useTimer } from '../context';
import { colors, typography, spacing } from '../utils/constants';

export const TimerScreen: React.FC<TimerScreenProps> = () => {
  const {
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
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);
  const [tempConfig, setTempConfig] = useState(timerConfig);

  const handleConfigChange = (field: keyof typeof timerConfig, value: number | boolean) => {
    setTempConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfig = async () => {
    try {
      await updateTimerConfig(tempConfig);
      setShowSettings(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save timer settings');
    }
  };

  const cancelConfig = () => {
    setTempConfig(timerConfig);
    setShowSettings(false);
  };

  const handleStopSession = () => {
    if (isSessionActive) {
      Alert.alert(
        'Stop Training?',
        'Your current session will be lost. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Stop', style: 'destructive', onPress: stopSession }
        ]
      );
    } else {
      stopSession();
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading timer..." />;
  }

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Timer Settings</Text>
          <TouchableOpacity onPress={cancelConfig}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Card>
            <Text style={styles.settingLabel}>Rounds</Text>
            <View style={styles.settingRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.settingOption,
                    tempConfig.rounds === value && styles.selectedOption
                  ]}
                  onPress={() => handleConfigChange('rounds', value)}
                >
                  <Text style={[
                    styles.settingOptionText,
                    tempConfig.rounds === value && styles.selectedOptionText
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card>
            <Text style={styles.settingLabel}>Round Duration (minutes)</Text>
            <View style={styles.settingRow}>
              {[1, 2, 3, 4, 5].map((minutes) => {
                const seconds = minutes * 60;
                return (
                  <TouchableOpacity
                    key={seconds}
                    style={[
                      styles.settingOption,
                      tempConfig.roundDuration === seconds && styles.selectedOption
                    ]}
                    onPress={() => handleConfigChange('roundDuration', seconds)}
                  >
                    <Text style={[
                      styles.settingOptionText,
                      tempConfig.roundDuration === seconds && styles.selectedOptionText
                    ]}>
                      {minutes}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text style={styles.settingLabel}>Rest Duration (seconds)</Text>
            <View style={styles.settingRow}>
              {[30, 60, 90, 120].map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  style={[
                    styles.settingOption,
                    tempConfig.restDuration === seconds && styles.selectedOption
                  ]}
                  onPress={() => handleConfigChange('restDuration', seconds)}
                >
                  <Text style={[
                    styles.settingOptionText,
                    tempConfig.restDuration === seconds && styles.selectedOptionText
                  ]}>
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card>
            <TouchableOpacity
              style={styles.settingToggle}
              onPress={() => handleConfigChange('bellEnabled', !tempConfig.bellEnabled)}
            >
              <Text style={styles.settingLabel}>Bell Sound</Text>
              <View style={[
                styles.toggle,
                tempConfig.bellEnabled && styles.toggleActive
              ]}>
                <Text style={styles.toggleText}>
                  {tempConfig.bellEnabled ? '🔔' : '🔕'}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            title="Save Settings"
            onPress={saveConfig}
            style={styles.modalButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Settings Button */}
      <View style={styles.header}>
        <Button
          title="⚙️ Settings"
          onPress={() => setShowSettings(true)}
          variant="secondary"
          size="small"
          disabled={isSessionActive}
        />
      </View>

      {/* Timer Display */}
      <View style={styles.timerSection}>
        {currentSession ? (
          <>
            <RoundIndicator
              currentRound={currentSession.state.currentRound}
              totalRounds={currentSession.config.rounds}
              isResting={currentSession.state.isResting}
              sessionProgress={sessionProgress}
            />
            <TimerDisplay
              seconds={currentSession.state.timeRemaining}
              isWarning={currentSession.state.timeRemaining <= 10}
              isResting={currentSession.state.isResting}
            />
          </>
        ) : (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Ready to Train? 🥊</Text>
            <Card style={styles.configPreview}>
              <Text style={styles.configText}>
                {timerConfig.rounds} rounds × {Math.floor(timerConfig.roundDuration / 60)} minutes
              </Text>
              <Text style={styles.configSubtext}>
                {timerConfig.restDuration}s rest between rounds
              </Text>
              <Text style={styles.configSubtext}>
                Bell sound: {timerConfig.bellEnabled ? 'On 🔔' : 'Off 🔕'}
              </Text>
            </Card>
            <TimerDisplay
              seconds={timerConfig.roundDuration}
              isWarning={false}
              isResting={false}
            />
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsSection}>
        <TimerControls
          isActive={isSessionActive}
          isComplete={isSessionComplete}
          onStart={startSession}
          onPause={pauseSession}
          onReset={resetSession}
          onStop={handleStopSession}
        />
      </View>

      {/* Completion Message */}
      {isSessionComplete && (
        <Card style={styles.completionCard}>
          <Text style={styles.completionTitle}>Session Complete! 🎉</Text>
          <Text style={styles.completionText}>
            Great job completing your {currentSession?.config.rounds}-round training session!
          </Text>
        </Card>
      )}

      {renderSettingsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'flex-end',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  previewSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  previewTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  configPreview: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  configText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  configSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  controlsSection: {
    paddingBottom: spacing.lg,
  },
  completionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  completionTitle: {
    ...typography.h3,
    color: colors.success,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  completionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  cancelButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalFooter: {
    padding: spacing.lg,
  },
  modalButton: {
    marginTop: spacing.md,
  },
  settingLabel: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  settingOption: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary + '30',
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  settingOptionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.textPrimary,
  },
  settingToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary + '30',
  },
  toggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 20,
  },
});