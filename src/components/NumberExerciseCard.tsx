import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DialogueQuestion, NumberChoices, NumberExercise, OptionIndex } from '../../types/exercises';
import { useExerciseAudio } from '../hooks/useExerciseAudio';
import { isSameNumber } from '../utils/normalizeNumber';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import { AudioControls } from './AudioControls';
import { FeedbackBanner } from './FeedbackBanner';
import { MenuButton } from './MenuButton';
import { NumberAnswerInput } from './NumberAnswerInput';
import { QuestionCard } from './QuestionCard';

export type NumberAnswerFormat = 'choice' | 'input';

interface NumberExerciseCardProps {
  exercise: NumberExercise;
  format: NumberAnswerFormat;
  onAnswered: (isCorrect: boolean) => void;
  onNext: () => void;
}

interface TypedAnswer {
  given: string;
  isCorrect: boolean;
}

const revealText = (exercise: NumberExercise): string =>
  `Correct answer: ${exercise.answer}. You heard: „${exercise.transcriptLt}“`;

const toChoiceQuestion = (exercise: NumberExercise, choices: NumberChoices): DialogueQuestion => ({
  id: exercise.id,
  questionText: exercise.prompt,
  options: choices.options,
  correctOptionIndex: choices.correctOptionIndex,
  explanation: revealText(exercise),
});

/** One Numbers item. Mount with `key={exercise.id}` so answer state and audio reset. */
export const NumberExerciseCard: React.FC<NumberExerciseCardProps> = ({
  exercise,
  format,
  onAnswered,
  onNext,
}) => {
  const audio = useExerciseAudio(exercise.audioUrl);
  const [selectedIndex, setSelectedIndex] = useState<OptionIndex | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<TypedAnswer | null>(null);

  const choices = format === 'choice' ? exercise.choices : undefined;
  const answered = selectedIndex !== null || typedAnswer !== null;

  const handleSelect = (index: OptionIndex): void => {
    if (!choices) {
      return;
    }
    setSelectedIndex(index);
    onAnswered(index === choices.correctOptionIndex);
  };

  const handleSubmit = (given: string): void => {
    const isCorrect = isSameNumber(given, exercise.answer);
    setTypedAnswer({ given, isCorrect });
    onAnswered(isCorrect);
  };

  return (
    <View testID={`number-exercise-${exercise.id}`} style={styles.card}>
      <Text style={styles.context}>{exercise.context}</Text>

      <AudioControls
        isLoaded={audio.isLoaded}
        isPlaying={audio.isPlaying}
        onPlay={audio.play}
        onPause={audio.pause}
        onReplay={() => audio.replay(1.0)}
        onSlowReplay={() => audio.replay(0.75)}
      />

      {choices ? (
        <QuestionCard
          question={toChoiceQuestion(exercise, choices)}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
        />
      ) : (
        <View style={styles.inputSection}>
          <Text style={styles.prompt}>{exercise.prompt}</Text>
          <NumberAnswerInput disabled={answered} onSubmit={handleSubmit} />
          {typedAnswer && (
            <FeedbackBanner
              isCorrect={typedAnswer.isCorrect}
              message={
                typedAnswer.isCorrect
                  ? `You heard: „${exercise.transcriptLt}“`
                  : `You typed ${typedAnswer.given}. ${revealText(exercise)}`
              }
            />
          )}
        </View>
      )}

      {answered && <MenuButton label="Next" onPress={onNext} />}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  context: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  inputSection: {
    gap: spacing.sm,
  },
  prompt: {
    marginBottom: spacing.xs,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
});
