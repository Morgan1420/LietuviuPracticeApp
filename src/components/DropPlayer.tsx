import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DropExercise } from '../../types/exercises';
import { useExerciseAudio } from '../hooks/useExerciseAudio';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';
import { AudioControls } from './AudioControls';
import { DropTranscript } from './DropTranscript';
import { MenuButton } from './MenuButton';
import { PlaybackProgress } from './PlaybackProgress';

interface DropPlayerProps {
  exercise: DropExercise;
  onNext: () => void;
}

/** Passive listening: audio + full transcript, no quiz. Mount with `key={exercise.id}`. */
export const DropPlayer: React.FC<DropPlayerProps> = ({ exercise, onNext }) => {
  const audio = useExerciseAudio(exercise.audioUrl);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

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
      />
      <PlaybackProgress
        currentTime={audio.currentTime}
        duration={audio.duration}
        onSeek={audio.seekTo}
      />

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: showTranslation }}
        onPress={() => setShowTranslation(visible => !visible)}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <Text style={styles.toggleLabel}>
          {showTranslation ? 'Hide English' : 'Show English'}
        </Text>
      </Pressable>

      <DropTranscript lines={exercise.lines} showTranslation={showTranslation} />

      <MenuButton variant="secondary" label="Next drop" onPress={onNext} />
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
  toggle: {
    alignSelf: 'flex-start',
    minHeight: touchTarget - spacing.md,
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
