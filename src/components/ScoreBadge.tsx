import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme/tokens';

export interface Score {
  correct: number;
  incorrect: number;
}

interface ScoreBadgeProps {
  score: Score;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => (
  <View
    accessibilityLabel={`${score.correct} correct, ${score.incorrect} incorrect`}
    style={styles.row}
  >
    <Text style={[styles.value, styles.correct]}>✓ {score.correct}</Text>
    <Text style={[styles.value, styles.incorrect]}>✗ {score.incorrect}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  correct: {
    color: colors.correct,
  },
  incorrect: {
    color: colors.incorrect,
  },
});
