import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';

interface AudioUnavailableNoticeProps {
  onRetry: () => void;
}

/** Shown in place of the audio controls when a clip couldn't be loaded. */
export const AudioUnavailableNotice: React.FC<AudioUnavailableNoticeProps> = ({ onRetry }) => (
  <View accessibilityLiveRegion="polite" style={styles.container}>
    <Text style={styles.title}>🔇 Audio unavailable</Text>
    <Text style={styles.message}>
      This recording couldn't be loaded. Check your connection, or continue with the text.
    </Text>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Try again"
      onPress={onRetry}
      style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
    >
      <Text style={styles.retryLabel}>Try again</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.disabledSurface,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
  retry: {
    alignSelf: 'flex-start',
    minHeight: touchTarget - spacing.md,
    justifyContent: 'center',
  },
  retryLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
