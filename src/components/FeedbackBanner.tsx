import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';

interface FeedbackBannerProps {
  isCorrect: boolean;
  message: string;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ isCorrect, message }) => (
  <View
    accessibilityLiveRegion="polite"
    style={[styles.container, isCorrect ? styles.correct : styles.incorrect]}
  >
    <Text style={styles.title}>{isCorrect ? 'Teisingai! Correct!' : 'Not quite.'}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  correct: {
    backgroundColor: colors.correctSurface,
  },
  incorrect: {
    backgroundColor: colors.incorrectSurface,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.text,
  },
});
