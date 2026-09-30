import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ExerciseLoadResult } from '../data/loadExercises';
import { useExerciseQueue } from '../hooks/useExerciseQueue';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import { MenuButton } from './MenuButton';

interface ExerciseQueueViewProps<T extends { id: string }> {
  result: ExerciseLoadResult<T>;
  /** Plural noun for messages, e.g. "dialogues". */
  itemsLabel: string;
  /** Singular noun for the progress line, e.g. "Dialogue". */
  itemLabel: string;
  difficultyLabel: string;
  onBack: () => void;
  renderItem: (item: T, onNext: () => void) => React.ReactElement;
  /** Extra content on the finished card, e.g. a score summary. */
  finishedSummary?: React.ReactNode;
  /** Called when the user starts the set again, e.g. to reset a score. */
  onRestart?: () => void;
}

const EMPTY_ITEMS: never[] = [];

/**
 * Shared shell for listening exercise screens: serves the loaded exercises in
 * random order and handles the error, empty and finished states.
 */
export const ExerciseQueueView = <T extends { id: string }>({
  result,
  itemsLabel,
  itemLabel,
  difficultyLabel,
  onBack,
  renderItem,
  finishedSummary,
  onRestart,
}: ExerciseQueueViewProps<T>): React.ReactElement => {
  const queue = useExerciseQueue<T>(result.ok ? result.exercises : EMPTY_ITEMS);
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
      <React.Fragment key={queue.current.id}>{renderItem(queue.current, queue.advance)}</React.Fragment>
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
