import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ComboItem } from '../../types';
import { Card } from '../common';
import { colors, typography, spacing } from '../../utils/constants';

interface ComboCardProps {
  combo: ComboItem;
  onPress: (combo: ComboItem) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({
  combo,
  onPress
}) => {
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

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Punches':
        return '👊';
      case 'Kicks':
        return '🦵';
      case 'Elbows':
        return '💪';
      case 'Knees':
        return '🔥';
      case 'Combos':
        return '⚡';
      default:
        return '🥊';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(combo)}
      activeOpacity={0.8}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.emoji}>
              {getCategoryEmoji(combo.category)}
            </Text>
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {combo.name}
              </Text>
              <Text style={styles.category}>
                {combo.category}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(combo.difficulty) }
            ]}
          >
            <Text style={styles.difficultyText}>
              {combo.difficulty}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {combo.instructions[0]}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.instructionCount}>
            {combo.instructions.length} steps
          </Text>
          <Text style={styles.viewMore}>
            Tap to learn →
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  viewMore: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});