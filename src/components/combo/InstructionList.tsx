import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common';
import { colors, typography, spacing } from '../../utils/constants';

interface InstructionListProps {
  instructions: string[];
  tips?: string[];
  commonMistakes?: string[];
}

export const InstructionList: React.FC<InstructionListProps> = ({
  instructions,
  tips = [],
  commonMistakes = []
}) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'tips' | 'mistakes'>('instructions');

  const renderTab = (
    tabKey: 'instructions' | 'tips' | 'mistakes',
    title: string,
    emoji: string
  ) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === tabKey && styles.activeTab
      ]}
      onPress={() => setActiveTab(tabKey)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.tabText,
        activeTab === tabKey && styles.activeTabText
      ]}>
        {emoji} {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    let content: string[] = [];
    let emptyMessage = '';

    switch (activeTab) {
      case 'instructions':
        content = instructions;
        emptyMessage = 'No instructions available';
        break;
      case 'tips':
        content = tips;
        emptyMessage = 'No tips available';
        break;
      case 'mistakes':
        content = commonMistakes;
        emptyMessage = 'No common mistakes listed';
        break;
    }

    if (content.length === 0) {
      return (
        <Text style={styles.emptyMessage}>
          {emptyMessage}
        </Text>
      );
    }

    return content.map((item, index) => (
      <View key={`${activeTab}-${index}-${item.slice(0, 10)}`} style={styles.listItem}>
        <View style={styles.bullet}>
          <Text style={styles.bulletText}>
            {activeTab === 'instructions' ? (index + 1).toString() : '•'}
          </Text>
        </View>
        <Text style={styles.itemText}>
          {item}
        </Text>
      </View>
    ));
  };

  return (
    <Card>
      <View style={styles.tabContainer}>
        {renderTab('instructions', 'Steps', '📝')}
        {tips.length > 0 && renderTab('tips', 'Tips', '💡')}
        {commonMistakes.length > 0 && renderTab('mistakes', 'Avoid', '⚠️')}
      </View>
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.textSecondary + '20',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    minHeight: 120,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  bulletText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.xl,
  },
});