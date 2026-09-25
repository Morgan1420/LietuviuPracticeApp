import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DialogueExercise, OptionIndex } from '../../types/exercises';
import { useDialogueAudio } from '../hooks/useDialogueAudio';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';
import { AudioControls } from './AudioControls';
import { QuestionCard } from './QuestionCard';
import { TranscriptPanel } from './TranscriptPanel';

interface DialoguePlayerProps {
  exercise: DialogueExercise;
  onComplete: () => void;
}

/**
 * Mode 1: Conversation Listening Practice.
 * Mount with `key={exercise.id}` so state and the audio player reset per exercise.
 */
export const DialoguePlayer: React.FC<DialoguePlayerProps> = ({ exercise, onComplete }) => {
  const [showText, setShowText] = useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<OptionIndex | null>(null);
  const audio = useDialogueAudio(exercise.audioUrl);

  const question = exercise.questions[questionIndex];
  const isLastQuestion = questionIndex === exercise.questions.length - 1;

  const handleNext = useCallback((): void => {
    if (isLastQuestion) {
      onComplete();
      return;
    }
    setQuestionIndex(index => index + 1);
    setSelectedIndex(null);
  }, [isLastQuestion, onComplete]);

  return (
    <View style={styles.card}>
      <Text style={styles.topic}>{exercise.topic}</Text>
      <Text style={styles.title}>{exercise.title}</Text>

      <AudioControls
        isLoaded={audio.isLoaded}
        isPlaying={audio.isPlaying}
        onPlay={audio.play}
        onPause={audio.pause}
        onReplay={() => audio.replay(1.0)}
        onSlowReplay={() => audio.replay(0.75)}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowText(visible => !visible)}
        style={({ pressed }) => [styles.textToggle, pressed && styles.pressed]}
      >
        <Text style={styles.textToggleLabel}>{showText ? 'Hide Text' : 'Show Text'}</Text>
      </Pressable>

      {showText && (
        <TranscriptPanel
          transcriptLt={exercise.transcriptLt}
          transcriptEn={exercise.transcriptEn}
          keyVocabulary={exercise.keyVocabulary}
        />
      )}

      <Text style={styles.progress}>
        Question {questionIndex + 1} of {exercise.questions.length}
      </Text>
      <QuestionCard key={question.id} question={question} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

      {selectedIndex !== null && (
        <Pressable
          accessibilityRole="button"
          onPress={handleNext}
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
        >
          <Text style={styles.nextLabel}>{isLastQuestion ? 'Finish' : 'Next question'}</Text>
        </Pressable>
      )}
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
  topic: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  textToggle: {
    alignSelf: 'flex-start',
    minHeight: touchTarget - spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  textToggleLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  progress: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  nextButton: {
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  nextLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.7,
  },
});
