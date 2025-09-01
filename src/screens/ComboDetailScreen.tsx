import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ComboItem } from '../types';
import { GifPlayer, InstructionList } from '../components/combo';
import { Button, LoadingSpinner, Card } from '../components/common';
import { ComboService } from '../services';
import { useProgress } from '../context';
import { colors, typography, spacing } from '../utils/constants';

interface ComboDetailScreenProps {
  comboId: string;
}

export const ComboDetailScreen: React.FC<ComboDetailScreenProps> = ({ 
  comboId
}) => {
  const { updateProgress } = useProgress();
  const [combo, setCombo] = useState<ComboItem | null>(null);
  const [nextCombos, setNextCombos] = useState<ComboItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    loadComboDetails();
  }, [comboId]);

  const loadComboDetails = async () => {
    try {
      setIsLoading(true);
      const comboDetails = ComboService.getComboById(comboId);
      
      if (!comboDetails) {
        Alert.alert('Error', 'Technique not found');
        router.back();
        return;
      }

      setCombo(comboDetails);
      
      // Load next suggested combos
      const nextSuggestions = ComboService.getNextCombos(comboId);
      setNextCombos(nextSuggestions);
    } catch (error) {
      console.error('Error loading combo details:', error);
      Alert.alert('Error', 'Failed to load technique details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!combo) return;

    try {
      setIsCompleting(true);
      
      // Mark combo as completed in service
      await ComboService.markComboCompleted(combo.id);
      
      Alert.alert(
        'Great work! 🥊',
        `You've completed the ${combo.name} technique. Keep training!`,
        [
          {
            text: 'Continue Training',
            onPress: () => router.back(),
          },
          {
            text: 'Next Technique',
            onPress: () => {
              if (nextCombos.length > 0) {
                router.replace(`/combo-detail/${nextCombos[0].id}`);
              } else {
                router.back();
              }
            },
          }
        ]
      );
    } catch (error) {
      console.error('Error marking combo as completed:', error);
      Alert.alert('Error', 'Failed to save progress');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNextCombo = (nextCombo: ComboItem) => {
    router.push(`/combo-detail/${nextCombo.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return colors.success;
      case 'Intermediate':
        return colors.warning;
      case 'Advanced':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading technique details..." />;
  }

  if (!combo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Technique not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.title}>{combo.name}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{combo.category}</Text>
            </View>
            <View 
              style={[
                styles.difficultyTag, 
                { backgroundColor: getDifficultyColor(combo.difficulty) }
              ]}
            >
              <Text style={styles.difficultyText}>{combo.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* GIF Player */}
        <View style={styles.section}>
          <GifPlayer
            gifPath={combo.gifPath}
            comboName={combo.name}
            category={combo.category}
          />
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <InstructionList
            instructions={combo.instructions}
            tips={combo.tips}
            commonMistakes={combo.commonMistakes}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title={isCompleting ? "Saving..." : "Mark as Completed ✓"}
            onPress={handleMarkCompleted}
            disabled={isCompleting}
            style={styles.completeButton}
          />
        </View>

        {/* Next Techniques */}
        {nextCombos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended Next 🎯</Text>
            {nextCombos.map((nextCombo) => (
              <Card key={nextCombo.id} style={styles.nextComboCard}>
                <View style={styles.nextComboContent}>
                  <View style={styles.nextComboInfo}>
                    <Text style={styles.nextComboName}>{nextCombo.name}</Text>
                    <Text style={styles.nextComboCategory}>{nextCombo.category}</Text>
                  </View>
                  <Button
                    title="Learn"
                    onPress={() => handleNextCombo(nextCombo)}
                    size="small"
                  />
                </View>
              </Card>
            ))}
          </View>
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  categoryTag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  difficultyTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionSection: {
    padding: spacing.lg,
  },
  completeButton: {
    marginTop: spacing.md,
  },
  nextComboCard: {
    marginBottom: spacing.md,
  },
  nextComboContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextComboInfo: {
    flex: 1,
  },
  nextComboName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  nextComboCategory: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    margin: spacing.xl,
  },
});