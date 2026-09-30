import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Difficulty } from '../../types/exercises';
import { colors, difficultyColors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ value, onChange }) => (
  <View accessibilityRole="radiogroup" style={styles.row}>
    {DIFFICULTIES.map(difficulty => {
      const selected = difficulty === value;
      const color = difficultyColors[difficulty];
      return (
        <Pressable
          key={difficulty}
          accessibilityRole="radio"
          accessibilityLabel={DIFFICULTY_LABELS[difficulty]}
          accessibilityState={{ selected }}
          onPress={() => onChange(difficulty)}
          style={({ pressed }) => [
            styles.option,
            { borderColor: color },
            selected && { backgroundColor: color },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.label, { color: selected ? colors.primaryText : color }]}>
            {DIFFICULTY_LABELS[difficulty]}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
