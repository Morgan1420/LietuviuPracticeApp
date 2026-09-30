import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RootStackScreenProps } from '../../types/navigation';
import { DialoguePlayer } from '../components/DialoguePlayer';
import { DIFFICULTY_LABELS } from '../components/DifficultySelector';
import { MenuButton } from '../components/MenuButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { loadDialogues } from '../data/loadDialogues';
import { colors, fontSize, radius, spacing } from '../theme/tokens';

export const DialogueExerciseScreen: React.FC<RootStackScreenProps<'DialogueExercise'>> = ({
  navigation,
  route,
}) => {
  const { difficulty } = route.params;
  const result = useMemo(() => loadDialogues(difficulty), [difficulty]);
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);

  const renderBody = (): React.ReactElement => {
    if (!result.ok) {
      return <Text style={styles.message}>Could not load exercises: {result.message}</Text>;
    }
    if (result.exercises.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.message}>
            No {DIFFICULTY_LABELS[difficulty].toLowerCase()} dialogues yet. Try another difficulty.
          </Text>
          <MenuButton label="Back to Listening" onPress={navigation.goBack} />
        </View>
      );
    }
    const exercise = result.exercises[exerciseIndex];
    if (!exercise) {
      return (
        <View style={styles.card}>
          <Text style={styles.message}>Puiku! You finished all dialogues.</Text>
          <MenuButton label="Start over" onPress={() => setExerciseIndex(0)} />
          <MenuButton variant="secondary" label="Back to Listening" onPress={navigation.goBack} />
        </View>
      );
    }
    return (
      <>
        <Text style={styles.progress}>
          Dialogue {exerciseIndex + 1} of {result.exercises.length}
        </Text>
        <DialoguePlayer
          key={exercise.id}
          exercise={exercise}
          onComplete={() => setExerciseIndex(index => index + 1)}
        />
      </>
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title={`Dialogue · ${DIFFICULTY_LABELS[difficulty]}`}
        onBack={navigation.goBack}
      />
      <ScrollView contentContainerStyle={styles.content}>{renderBody()}</ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
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
