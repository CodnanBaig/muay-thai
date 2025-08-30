import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ProgressScreenProps, Milestone } from '../types';
import { Card, LoadingSpinner, ProgressBar } from '../components/common';
import { useProgress } from '../context';
import { ProgressService } from '../services';
import { colors, typography, spacing } from '../utils/constants';
import { formatDate, formatDuration } from '../utils/dateHelpers';

const screenWidth = Dimensions.get('window').width;

export const ProgressScreen: React.FC<ProgressScreenProps> = () => {
  const { userProgress, isLoading } = useProgress();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    loadProgressData();
  }, [userProgress]);

  const loadProgressData = async () => {
    try {
      // Load milestones
      const progressMilestones = await ProgressService.getMilestones();
      setMilestones(progressMilestones);

      // Load weekly stats for chart
      const weekly = await ProgressService.getWeeklyStats();
      setWeeklyData(weekly.slice(0, 6).reverse()); // Last 6 weeks
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const getStreakMessage = () => {
    if (userProgress.currentStreak === 0) {
      return "Ready to start a new streak! 💪";
    }
    if (userProgress.currentStreak === 1) {
      return "Great start! Keep the momentum going! 🔥";
    }
    if (userProgress.currentStreak >= 7) {
      return `Amazing ${userProgress.currentStreak}-day streak! You're on fire! 🚀`;
    }
    return `${userProgress.currentStreak} days strong! Keep it up! ⚡`;
  };

  const getTotalTrainingTime = () => {
    return userProgress.sessionHistory.reduce((total, session) => total + session.duration, 0);
  };

  const getRecentSessions = () => {
    return userProgress.sessionHistory
      .slice(-5)
      .reverse()
      .map(session => ({
        ...session,
        formattedDate: formatDate(session.date),
        formattedDuration: formatDuration(session.duration)
      }));
  };

  const renderChart = () => {
    if (weeklyData.length < 2) {
      return (
        <Card>
          <Text style={styles.chartTitle}>Weekly Progress</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>
              📊 Complete more sessions to see your progress chart
            </Text>
          </View>
        </Card>
      );
    }

    const chartData = {
      labels: weeklyData.map(week => {
        const date = new Date(week.week);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: weeklyData.map(week => week.totalSessions),
          strokeWidth: 3,
          color: (opacity = 1) => colors.primary,
        }
      ]
    };

    return (
      <Card>
        <Text style={styles.chartTitle}>Weekly Sessions</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 64}
          height={200}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.textSecondary,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: colors.primary
            }
          }}
          bezier
          style={styles.chart}
        />
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading your progress..." />;
  }

  const recentSessions = getRecentSessions();
  const totalTrainingTime = getTotalTrainingTime();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{userProgress.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{userProgress.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{userProgress.longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{formatDuration(totalTrainingTime)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </Card>
        </View>

        {/* Streak Message */}
        <Card style={styles.messageCard}>
          <Text style={styles.messageText}>{getStreakMessage()}</Text>
        </Card>

        {/* Progress Chart */}
        {renderChart()}

        {/* Achievements */}
        <Card>
          <Text style={styles.sectionTitle}>Achievements 🏆</Text>
          {milestones.length === 0 ? (
            <Text style={styles.emptyText}>Complete your first session to unlock achievements!</Text>
          ) : (
            milestones.map((milestone) => (
              <View key={milestone.id} style={styles.milestoneItem}>
                <View style={styles.milestoneHeader}>
                  <Text style={[
                    styles.milestoneTitle,
                    { color: milestone.achieved ? colors.success : colors.textSecondary }
                  ]}>
                    {milestone.achieved ? '✅' : '⏳'} {milestone.title}
                  </Text>
                  <Text style={styles.milestoneProgress}>
                    {milestone.current}/{milestone.target}
                  </Text>
                </View>
                <Text style={styles.milestoneDescription}>
                  {milestone.description}
                </Text>
                <ProgressBar
                  progress={(milestone.current / milestone.target) * 100}
                  height={4}
                  style={styles.milestoneProgressBar}
                />
              </View>
            ))
          )}
        </Card>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Recent Sessions 📅</Text>
            {recentSessions.map((session, index) => (
              <View key={session.id} style={styles.sessionItem}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionType}>
                    {session.type === 'timer' ? '⏱️ Timer' : '🥊 Technique'}
                  </Text>
                  <Text style={styles.sessionDate}>{session.formattedDate}</Text>
                </View>
                <Text style={styles.sessionDuration}>
                  Duration: {session.formattedDuration}
                </Text>
                {index < recentSessions.length - 1 && <View style={styles.sessionDivider} />}
              </View>
            ))}
          </Card>
        )}

        {/* Empty State */}
        {userProgress.totalSessions === 0 && (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateEmoji}>🎯</Text>
            <Text style={styles.emptyStateTitle}>Start Your Journey!</Text>
            <Text style={styles.emptyStateDescription}>
              Complete your first training session to start tracking your progress and unlock achievements.
            </Text>
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.lg,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messageCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  messageText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  chartTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  milestoneItem: {
    marginBottom: spacing.lg,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  milestoneTitle: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  milestoneProgress: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  milestoneDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  milestoneProgressBar: {
    marginTop: spacing.sm,
  },
  sessionItem: {
    paddingVertical: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sessionType: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sessionDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sessionDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sessionDivider: {
    height: 1,
    backgroundColor: colors.textSecondary + '20',
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyStateDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});