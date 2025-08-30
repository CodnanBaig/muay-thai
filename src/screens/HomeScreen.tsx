import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreenProps } from '../types';
import { Button, Card, LoadingSpinner } from '../components/common';
import { useProgress } from '../context';
import { colors, typography, spacing, APP_CONFIG } from '../utils/constants';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userProgress, isLoading, getMotivationalMessage } = useProgress();
  const [motivationalMessage, setMotivationalMessage] = useState(APP_CONFIG.TAGLINE);

  useEffect(() => {
    loadMotivationalMessage();
  }, [userProgress]);

  const loadMotivationalMessage = async () => {
    try {
      const message = await getMotivationalMessage();
      setMotivationalMessage(message);
    } catch (error) {
      console.error('Error loading motivational message:', error);
    }
  };

  const navigateToSection = (section: 'Combos' | 'Timer' | 'Progress') => {
    navigation.navigate(section);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading your training data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.primary + '80']}
          style={styles.heroSection}
        >
          <Text style={styles.appName}>{APP_CONFIG.NAME}</Text>
          <Text style={styles.tagline}>{motivationalMessage}</Text>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProgress.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProgress.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProgress.longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Navigation Cards */}
        <View style={styles.navigationSection}>
          <Text style={styles.sectionTitle}>Ready to train?</Text>
          
          <Card style={styles.navCard}>
            <View style={styles.navCardContent}>
              <View style={styles.navCardHeader}>
                <Text style={styles.navCardEmoji}>🥊</Text>
                <View style={styles.navCardText}>
                  <Text style={styles.navCardTitle}>Learn Techniques</Text>
                  <Text style={styles.navCardDescription}>
                    Master Muay Thai combos with step-by-step guides
                  </Text>
                </View>
              </View>
              <Button
                title="Explore Combos"
                onPress={() => navigateToSection('Combos')}
                size="medium"
              />
            </View>
          </Card>

          <Card style={styles.navCard}>
            <View style={styles.navCardContent}>
              <View style={styles.navCardHeader}>
                <Text style={styles.navCardEmoji}>⏱️</Text>
                <View style={styles.navCardText}>
                  <Text style={styles.navCardTitle}>Round Timer</Text>
                  <Text style={styles.navCardDescription}>
                    Train with authentic Muay Thai round timing
                  </Text>
                </View>
              </View>
              <Button
                title="Start Timer"
                onPress={() => navigateToSection('Timer')}
                size="medium"
              />
            </View>
          </Card>

          <Card style={styles.navCard}>
            <View style={styles.navCardContent}>
              <View style={styles.navCardHeader}>
                <Text style={styles.navCardEmoji}>📊</Text>
                <View style={styles.navCardText}>
                  <Text style={styles.navCardTitle}>Track Progress</Text>
                  <Text style={styles.navCardDescription}>
                    See your training streaks and achievements
                  </Text>
                </View>
              </View>
              <Button
                title="View Progress"
                onPress={() => navigateToSection('Progress')}
                size="medium"
              />
            </View>
          </Card>
        </View>

        {/* Quick Action Section */}
        {userProgress.totalSessions === 0 && (
          <Card style={styles.quickActionCard}>
            <Text style={styles.quickActionTitle}>
              Welcome to Nak Muay Trainer! 🎉
            </Text>
            <Text style={styles.quickActionDescription}>
              Start your Muay Thai journey today. Learn your first combo or set up a training session.
            </Text>
            <View style={styles.quickActionButtons}>
              <Button
                title="First Combo"
                onPress={() => navigateToSection('Combos')}
                style={styles.quickActionButton}
              />
              <Button
                title="Quick Session"
                onPress={() => navigateToSection('Timer')}
                variant="secondary"
                style={styles.quickActionButton}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  heroSection: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.9,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 300,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.textPrimary,
    opacity: 0.3,
    marginHorizontal: spacing.md,
  },
  navigationSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  navCard: {
    marginBottom: spacing.md,
  },
  navCardContent: {
    gap: spacing.md,
  },
  navCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navCardEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  navCardText: {
    flex: 1,
  },
  navCardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  navCardDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  quickActionCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  quickActionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  quickActionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
  },
});