import React from 'react';
import { ComboDetailScreen } from '../../src/screens/ComboDetailScreen';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function ComboDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id || typeof id !== 'string') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid combo ID</Text>
      </View>
    );
  }
  
  return <ComboDetailScreen comboId={id} />;
}