import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabParamList, ComboStackParamList } from '../types';
import { colors } from '../utils/constants';

// Import screens (these will be created next)
import { HomeScreen } from '../screens/HomeScreen';
import { CombosScreen } from '../screens/CombosScreen';
import { ComboDetailScreen } from '../screens/ComboDetailScreen';
import { TimerScreen } from '../screens/TimerScreen';
import { ProgressScreen } from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const ComboStack = createNativeStackNavigator<ComboStackParamList>();

// Stack navigator for combo screens
const ComboStackNavigator = () => {
  return (
    <ComboStack.Navigator
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
      <ComboStack.Screen 
        name="ComboList" 
        component={CombosScreen}
        options={{ 
          title: 'Combos',
          headerShown: false // We'll handle header in the tab navigator
        }}
      />
      <ComboStack.Screen 
        name="ComboDetail" 
        component={ComboDetailScreen}
        options={{ 
          title: 'Technique Details',
          headerBackTitleVisible: false,
        }}
      />
    </ComboStack.Navigator>
  );
};

// Tab navigator icons (using emojis for simplicity)
const getTabBarIcon = (routeName: string, focused: boolean) => {
  const iconMap = {
    Home: focused ? '🏠' : '🏠',
    Combos: focused ? '🥊' : '🥊',
    Timer: focused ? '⏱️' : '⏱️',
    Progress: focused ? '📊' : '📊',
  };
  return iconMap[routeName as keyof typeof iconMap] || '•';
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => ({
          children: getTabBarIcon(route.name, focused),
        }),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface,
          paddingBottom: 5,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Nak Muay Trainer',
        }}
      />
      <Tab.Screen 
        name="Combos" 
        component={ComboStackNavigator}
        options={{ 
          title: 'Techniques',
          headerShown: false, // Stack navigator handles headers
        }}
      />
      <Tab.Screen 
        name="Timer" 
        component={TimerScreen}
        options={{ 
          title: 'Round Timer',
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{ 
          title: 'Your Progress',
        }}
      />
    </Tab.Navigator>
  );
};