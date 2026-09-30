import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';

interface MenuButtonProps {
  label: string;
  onPress: () => void;
  /** Small caption under the label, e.g. "Coming soon". */
  caption?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  onPress,
  caption,
  variant = 'primary',
  disabled = false,
}) => {
  const isPrimary = variant === 'primary' && !disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
      {caption !== undefined && (
        <Text style={[styles.caption, isPrimary && styles.primaryLabel]}>{caption}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget + spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  primary: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  secondary: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  disabled: {
    backgroundColor: colors.disabledSurface,
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  primaryLabel: {
    color: colors.primaryText,
  },
  secondaryLabel: {
    color: colors.text,
  },
  caption: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
