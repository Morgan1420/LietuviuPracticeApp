import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { normalizeNumber } from '../utils/normalizeNumber';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';

interface NumberAnswerInputProps {
  disabled: boolean;
  onSubmit: (value: string) => void;
}

export const NumberAnswerInput: React.FC<NumberAnswerInputProps> = ({ disabled, onSubmit }) => {
  const [value, setValue] = useState<string>('');
  const canSubmit = !disabled && normalizeNumber(value).length > 0;

  const submit = (): void => {
    if (canSubmit) {
      onSubmit(value);
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        accessibilityLabel="Your answer"
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        editable={!disabled}
        keyboardType="decimal-pad"
        returnKeyType="done"
        placeholder="Type the digits you hear"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, disabled && styles.inputDisabled]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Check"
        accessibilityState={{ disabled: !canSubmit }}
        disabled={!canSubmit}
        onPress={submit}
        style={({ pressed }) => [
          styles.button,
          !canSubmit && styles.buttonDisabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.buttonLabel}>Check</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  inputDisabled: {
    backgroundColor: colors.disabledSurface,
  },
  button: {
    minHeight: touchTarget,
    minWidth: touchTarget * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primaryText,
  },
});
