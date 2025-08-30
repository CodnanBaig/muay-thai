import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../utils/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 'md' 
}) => {
  const cardStyle = [
    styles.card,
    { padding: spacing[padding] },
    style
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});