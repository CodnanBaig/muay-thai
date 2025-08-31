import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProgressProvider, TimerProvider } from '../src/context';
import { ComboService } from '../src/services';
import { colors } from '../src/utils/constants';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

export default function RootLayout() {
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
    <ProgressProvider>
      <TimerProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </TimerProvider>
    </ProgressProvider>
  );
}
