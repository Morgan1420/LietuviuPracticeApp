import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ExerciseLoadResult } from '../data/loadExercises';
import { ExerciseQueue } from '../hooks/useExerciseQueue';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import { MenuButton } from './MenuButton';

interface ExerciseQueueViewProps<T extends { id: string }> {
  result: ExerciseLoadResult<T>;
  /** Created by the screen with useExerciseQueue(loadedExercises(result)). */
  queue: ExerciseQueue<T>;
  /** Plural noun for messages, e.g. "dialogues". */
  itemsLabel: string;
  /** Singular noun for the progress line, e.g. "Dialogue". */
  itemLabel: string;
  difficultyLabel: string;
  onBack: () => void;
  /** `upcoming` is the next item in the queue (e.g. to prefetch its audio). */
  renderItem: (item: T, onNext: () => void, upcoming: T | undefined) => React.ReactElement;
  /** Extra content on the finished card, e.g. a score summary. */
  finishedSummary?: React.ReactNode;
  /** Called when the user starts the set again, e.g. to reset a score. */
  onRestart?: () => void;
}

/**
 * Shared shell for listening exercise screens: renders the current item of a
 * (shuffled) queue and handles the error, empty and finished states.
 */
export const ExerciseQueueView = <T extends { id: string }>({
  result,
  queue,
  itemsLabel,
  itemLabel,
  difficultyLabel,
  onBack,
  renderItem,
  finishedSummary,
  onRestart,
}: ExerciseQueueViewProps<T>): React.ReactElement => {
  const { restart } = queue;

  const handleRestart = useCallback((): void => {
    restart();
    onRestart?.();
  }, [restart, onRestart]);

  if (!result.ok) {
    return <Text style={styles.message}>Could not load exercises: {result.message}</Text>;
  }

  if (queue.total === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.message}>
          No {difficultyLabel.toLowerCase()} {itemsLabel} yet. Try another difficulty.
        </Text>
        <MenuButton label="Back to Listening" onPress={onBack} />
      </View>
    );
  }

  if (!queue.current) {
    return (
      <View style={styles.card}>
        <Text style={styles.message}>Puiku! You finished all {itemsLabel}.</Text>
        {finishedSummary}
        <MenuButton label="Start over" onPress={handleRestart} />
        <MenuButton variant="secondary" label="Back to Listening" onPress={onBack} />
      </View>
    );
  }

  return (
    <>
      <Text style={styles.progress}>
        {itemLabel} {queue.position + 1} of {queue.total}
      </Text>
      <React.Fragment key={queue.current.id}>
        {renderItem(queue.current, queue.advance, queue.upcoming)}
      </React.Fragment>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  progress: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
