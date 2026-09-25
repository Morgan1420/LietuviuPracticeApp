import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VocabularyItem } from '../../types/exercises';
import { colors, fontSize, radius, spacing } from '../theme/tokens';

interface TranscriptPanelProps {
  transcriptLt: string;
  transcriptEn: string;
  keyVocabulary: VocabularyItem[];
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcriptLt,
  transcriptEn,
  keyVocabulary,
}) => (
  <View style={styles.container}>
    <Text style={styles.heading}>Lietuviškai</Text>
    <Text style={styles.body}>{transcriptLt}</Text>

    <Text style={styles.heading}>English</Text>
    <Text style={[styles.body, styles.muted]}>{transcriptEn}</Text>

    <Text style={styles.heading}>Key vocabulary</Text>
    {keyVocabulary.map(item => (
      <Text key={item.lt} style={styles.body}>
        <Text style={styles.vocabLt}>{item.lt}</Text> — {item.en}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  heading: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: 24,
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
  vocabLt: {
    fontWeight: '600',
  },
});
