import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, typography, spacing } from '../../utils/constants';

interface GifPlayerProps {
  gifPath: string;
  comboName: string;
  category?: string;
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const GifPlayer: React.FC<GifPlayerProps> = ({
  gifPath,
  comboName,
  category = '',
  isPlaying = true,
  onPlayStateChange
}) => {
  const [playing, setPlaying] = useState(isPlaying);
  const [imageError, setImageError] = useState(false);

  const togglePlayback = () => {
    const newPlayingState = !playing;
    setPlaying(newPlayingState);
    onPlayStateChange?.(newPlayingState);
  };

  // For demo purposes, we'll create a mapping of combo techniques to placeholder images
  const getPlaceholderImage = (comboName: string, category: string = '') => {
    // Extract category from combo props if available, or determine from combo name
    const lowerName = comboName.toLowerCase();
    
    // Category-based placeholder selection
    if (category === 'Punches' || lowerName.includes('jab') || lowerName.includes('cross') || lowerName.includes('hook')) {
      return require('../../../assets/images/react-logo.png'); // Punches
    }
    if (category === 'Kicks' || lowerName.includes('kick') || lowerName.includes('teep') || lowerName.includes('roundhouse')) {
      return require('../../../assets/images/react-logo@2x.png'); // Kicks
    }
    if (category === 'Elbows' || lowerName.includes('elbow')) {
      return require('../../../assets/images/react-logo@3x.png'); // Elbows
    }
    if (category === 'Knees' || lowerName.includes('knee')) {
      return require('../../../assets/images/icon.png'); // Knees
    }
    if (category === 'Combos' || lowerName.includes('combo')) {
      return require('../../../assets/images/adaptive-icon.png'); // Combos
    }
    
    // Default fallback
    return require('../../../assets/images/react-logo.png');
  };

  const renderContent = () => {
    // Try to load the actual image first, fallback to placeholder
    if (!imageError && gifPath && gifPath !== '') {
      return (
        <Image
          source={{ uri: gifPath }}
          style={styles.gif}
          onError={() => setImageError(true)}
          resizeMode="contain"
        />
      );
    }
    
    // Fallback to a placeholder image or generated placeholder
    return (
      <View style={styles.placeholder}>
        <Image
          source={getPlaceholderImage(comboName, category)}
          style={styles.placeholderImage}
          resizeMode="contain"
        />
        <Text style={styles.placeholderText}>
          {comboName}
        </Text>
        <Text style={styles.placeholderSubtext}>
          Training Technique
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.gifContainer}>
        {renderContent()}
        
        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayback}
          activeOpacity={0.8}
        >
          <Text style={styles.playButtonText}>
            {playing ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            // Restart animation
            setPlaying(false);
            setTimeout(() => setPlaying(true), 100);
          }}
        >
          <Text style={styles.controlText}>🔄 Restart</Text>
        </TouchableOpacity>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: playing ? colors.success : colors.textSecondary }
          ]} />
          <Text style={styles.statusText}>
            {playing ? 'Playing' : 'Paused'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gifContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: colors.background,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  placeholderText: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  placeholderSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  playButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  controlButton: {
    padding: spacing.sm,
  },
  controlText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});