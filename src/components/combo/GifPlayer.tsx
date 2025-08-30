import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../utils/constants';

interface GifPlayerProps {
  gifPath: string;
  comboName: string;
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const GifPlayer: React.FC<GifPlayerProps> = ({
  gifPath,
  comboName,
  isPlaying = true,
  onPlayStateChange
}) => {
  const [playing, setPlaying] = useState(isPlaying);

  const togglePlayback = () => {
    const newPlayingState = !playing;
    setPlaying(newPlayingState);
    onPlayStateChange?.(newPlayingState);
  };

  // Note: In a real app, you would use react-native-fast-image or similar
  // For the MVP, we'll show a placeholder with controls
  return (
    <View style={styles.container}>
      <View style={styles.gifContainer}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🥊</Text>
          <Text style={styles.placeholderText}>
            {comboName}
          </Text>
          <Text style={styles.placeholderSubtext}>
            GIF Animation
          </Text>
          {/* In production, replace with:
              <FastImage 
                source={{ uri: gifPath }}
                style={styles.gif}
                resizeMode={FastImage.resizeMode.contain}
              />
          */}
        </View>
        
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
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