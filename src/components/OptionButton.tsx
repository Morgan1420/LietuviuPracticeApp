import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';

export type OptionState = 'idle' | 'correct' | 'incorrect' | 'inactive';

interface OptionButtonProps {
  label: string;
  state: OptionState;
  disabled: boolean;
  onPress: () => void;
}

const STATE_ICON: Record<OptionState, string> = {
  idle: '',
  correct: '✓ ',
  incorrect: '✗ ',
  inactive: '',
};

export const OptionButton: React.FC<OptionButtonProps> = ({ label, state, disabled, onPress }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled, selected: state === 'correct' || state === 'incorrect' }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [styles.base, styles[state], pressed && styles.pressed]}
  >
    <Text style={[styles.label, state === 'inactive' && styles.inactiveLabel]}>
      {STATE_ICON[state]}
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  idle: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  correct: {
    borderColor: colors.correct,
    backgroundColor: colors.correctSurface,
  },
  incorrect: {
    borderColor: colors.incorrect,
    backgroundColor: colors.incorrectSurface,
  },
  inactive: {
    borderColor: colors.border,
    backgroundColor: colors.disabledSurface,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  inactiveLabel: {
    color: colors.textMuted,
  },
});
