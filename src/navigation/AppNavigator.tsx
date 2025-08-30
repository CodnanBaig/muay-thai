import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { TabNavigator } from './TabNavigator';
import { ProgressProvider, TimerProvider } from '../context';
import { ComboService } from '../services';
import { colors } from '../utils/constants';

export const AppNavigator = () => {
  useEffect(() => {
    // Initialize services
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize combo data
      await ComboService.initializeCombos();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.surface,
          notification: colors.warning,
        },
      }}
    >
      <ProgressProvider>
        <TimerProvider>
          <StatusBar style="light" backgroundColor={colors.background} />
          <TabNavigator />
        </TimerProvider>
      </ProgressProvider>
    </NavigationContainer>
  );
};