import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import dialoguesData from '../../assets/data/dialogues.json';
import { DialogueExercise } from '../../types/exercises';
import { ComingSoonCard } from '../components/ComingSoonCard';
import { DialoguePlayer } from '../components/DialoguePlayer';
import { parseDialogueExercises } from '../data/parseDialogueExercises';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';

type LoadResult = { ok: true; exercises: DialogueExercise[] } | { ok: false; message: string };

const loadDialogues = (): LoadResult => {
  try {
    return { ok: true, exercises: parseDialogueExercises(dialoguesData) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[HomeScreen Error]: could not load dialogues.json', message);
    return { ok: false, message };
  }
};

export const HomeScreen: React.FC = () => {
  const result = useMemo(loadDialogues, []);
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);

  const renderDialogueSection = (): React.ReactElement => {
    if (!result.ok) {
      return <Text style={styles.message}>Could not load exercises: {result.message}</Text>;
    }
    const exercise = result.exercises[exerciseIndex];
    if (!exercise) {
      return (
        <View style={styles.doneCard}>
          <Text style={styles.message}>Puiku! You finished all dialogues.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setExerciseIndex(0)}
            style={({ pressed }) => [styles.restartButton, pressed && styles.pressed]}
          >
            <Text style={styles.restartLabel}>Start over</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <DialoguePlayer
        key={exercise.id}
        exercise={exercise}
        onComplete={() => setExerciseIndex(index => index + 1)}
      />
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Lietuvių kalba · A1</Text>
      <Text style={styles.sectionTitle}>Mode 1: Dialogue Listening</Text>
      {renderDialogueSection()}

      <ComingSoonCard
        title="Mode 2: Repeat Practice"
        description="Listen to a word or phrase and repeat it out loud."
      />
      <ComingSoonCard
        title="Mode 3: AI Q&A"
        description="Answer spoken questions in Lithuanian and get feedback."
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  doneCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  restartButton: {
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  restartLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.7,
  },
});
