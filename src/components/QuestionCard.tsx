import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DialogueQuestion, OptionIndex } from '../../types/exercises';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import { OptionButton } from './OptionButton';
import { getOptionState } from './getOptionState';

interface QuestionCardProps {
  question: DialogueQuestion;
  selectedIndex: OptionIndex | null;
  onSelect: (index: OptionIndex) => void;
}

const OPTION_INDICES: readonly OptionIndex[] = [0, 1, 2, 3];

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedIndex, onSelect }) => {
  const answered = selectedIndex !== null;
  const isCorrect = selectedIndex === question.correctOptionIndex;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question.questionText}</Text>

      {OPTION_INDICES.map(index => (
        <OptionButton
          key={index}
          label={question.options[index]}
          state={getOptionState(index, selectedIndex, question.correctOptionIndex)}
          disabled={answered}
          onPress={() => onSelect(index)}
        />
      ))}

      {answered && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <Text style={styles.feedbackTitle}>{isCorrect ? 'Teisingai! Correct!' : 'Not quite.'}</Text>
          <Text style={styles.explanation}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

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
  feedback: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  feedbackCorrect: {
    backgroundColor: colors.correctSurface,
  },
  feedbackIncorrect: {
    backgroundColor: colors.incorrectSurface,
  },
  feedbackTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  explanation: {
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.text,
  },
});
