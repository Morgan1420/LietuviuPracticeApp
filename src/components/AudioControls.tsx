import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  fontSize,
  radius,
  spacing,
  touchTarget,
} from '../theme/tokens';
import { AudioUnavailableNotice } from './AudioUnavailableNotice';

interface AudioControlsProps {
  isLoaded: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  /** Omit to hide the 0.75x button (e.g. passive listening). */
  onSlowReplay?: () => void;
  /** When true, a notice with "Try again" replaces the controls. */
  isUnavailable?: boolean;
  onRetry?: () => void;
}

interface ControlButtonProps {
  label: string;
  onPress: () => void;
  disabled: boolean;
  primary?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  onPress,
  disabled,
  primary,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      primary && styles.primaryButton,
      disabled && styles.disabledButton,
      pressed && styles.pressed,
    ]}
  >
    <Text style={[styles.label, primary && styles.primaryLabel]}>{label}</Text>
  </Pressable>
);

export const AudioControls: React.FC<AudioControlsProps> = ({
  isLoaded,
  isPlaying,
  onPlay,
  onPause,
  onReplay,
  onSlowReplay,
  isUnavailable = false,
  onRetry,
}) =>
  isUnavailable && onRetry ? (
    <AudioUnavailableNotice onRetry={onRetry} />
  ) : (
    <View style={styles.container}>
      <ControlButton
        primary
        label={isPlaying ? '⏸ Pause' : '▶ Play'}
        onPress={isPlaying ? onPause : onPlay}
        disabled={!isLoaded}
      />
      <View style={styles.row}>
        <ControlButton
          label="↺ Replay 1.0x"
          onPress={onReplay}
          disabled={!isLoaded}
        />
        {onSlowReplay && (
          <ControlButton
            label="🐢 Slow 0.75x"
            onPress={onSlowReplay}
            disabled={!isLoaded}
          />
        )}
      </View>
    </View>
  );

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  primaryButton: {
    minHeight: touchTarget + spacing.lg,
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  primaryLabel: {
    fontSize: fontSize.lg,
    color: colors.primaryText,
  },
});
