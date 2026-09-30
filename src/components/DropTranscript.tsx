import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DropLine } from '../../types/exercises';
import { colors, fontSize, spacing } from '../theme/tokens';

interface DropTranscriptProps {
  lines: DropLine[];
  showTranslation: boolean;
}

export const DropTranscript: React.FC<DropTranscriptProps> = ({ lines, showTranslation }) => (
  <View style={styles.container}>
    {lines.map((line, index) => (
      <View key={`${index}-${line.lt}`} style={styles.line}>
        <Text style={styles.lt}>{line.lt}</Text>
        {showTranslation && <Text style={styles.en}>{line.en}</Text>}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  line: {
    gap: 2,
  },
  lt: {
    fontSize: fontSize.lg,
    lineHeight: 26,
    color: colors.text,
  },
  en: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
