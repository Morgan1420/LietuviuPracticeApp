import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DialogueQuestion, OptionIndex } from '../../types/exercises';
import { colors, fontSize, spacing } from '../theme/tokens';
import { FeedbackBanner } from './FeedbackBanner';
import { OptionButton } from './OptionButton';
import { getOptionState } from './getOptionState';

interface QuestionCardProps {
  question: DialogueQuestion;
  selectedIndex: OptionIndex | null;
  onSelect: (index: OptionIndex) => void;
}

const OPTION_INDICES: readonly OptionIndex[] = [0, 1, 2, 3];

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedIndex, onSelect }) => (
  <View style={styles.container}>
    <Text style={styles.question}>{question.questionText}</Text>

    {OPTION_INDICES.map(index => (
      <OptionButton
        key={index}
        label={question.options[index]}
        state={getOptionState(index, selectedIndex, question.correctOptionIndex)}
        disabled={selectedIndex !== null}
        onPress={() => onSelect(index)}
      />
    ))}

    {selectedIndex !== null && (
      <FeedbackBanner
        isCorrect={selectedIndex === question.correctOptionIndex}
        message={question.explanation}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  question: {
    marginBottom: spacing.xs,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
});
