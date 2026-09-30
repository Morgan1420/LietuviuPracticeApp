import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { RootStackScreenProps } from '../../types/navigation';
import { DIFFICULTY_LABELS } from '../components/DifficultySelector';
import { ExerciseQueueView } from '../components/ExerciseQueueView';
import { ExerciseScreenLayout } from '../components/ExerciseScreenLayout';
import { NumberAnswerFormat, NumberExerciseCard } from '../components/NumberExerciseCard';
import { Score, ScoreBadge } from '../components/ScoreBadge';
import { loadNumbers } from '../data/loadNumbers';
import { loadedExercises } from '../data/loadExercises';
import { useExerciseQueue } from '../hooks/useExerciseQueue';
import { colors, fontSize } from '../theme/tokens';

const EMPTY_SCORE: Score = { correct: 0, incorrect: 0 };

export const NumbersExerciseScreen: React.FC<RootStackScreenProps<'NumbersExercise'>> = ({
  navigation,
  route,
}) => {
  const { difficulty } = route.params;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty];
  const format: NumberAnswerFormat = difficulty === 'easy' ? 'choice' : 'input';
  const result = useMemo(() => loadNumbers(difficulty), [difficulty]);
  const queue = useExerciseQueue(loadedExercises(result));
  const [score, setScore] = useState<Score>(EMPTY_SCORE);

  const handleAnswered = useCallback((isCorrect: boolean): void => {
    setScore(current =>
      isCorrect
        ? { ...current, correct: current.correct + 1 }
        : { ...current, incorrect: current.incorrect + 1 },
    );
  }, []);

  const resetScore = useCallback((): void => setScore(EMPTY_SCORE), []);

  return (
    <ExerciseScreenLayout title={`Numbers · ${difficultyLabel}`} onBack={navigation.goBack}>
      <ScoreBadge score={score} />
      <ExerciseQueueView
        result={result}
        queue={queue}
        itemsLabel="numbers"
        itemLabel="Number"
        difficultyLabel={difficultyLabel}
        onBack={navigation.goBack}
        onRestart={resetScore}
        finishedSummary={
          <Text style={styles.summary}>
            Score: {score.correct} / {score.correct + score.incorrect}
          </Text>
        }
        renderItem={(exercise, onNext) => (
          <NumberExerciseCard
            exercise={exercise}
            format={format}
            onAnswered={handleAnswered}
            onNext={onNext}
          />
        )}
      />
    </ExerciseScreenLayout>
  );
};

const styles = StyleSheet.create({
  summary: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
});
