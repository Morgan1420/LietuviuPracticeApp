import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DropExercise } from '../../types/exercises';
import { DropSession } from '../hooks/useDropSession';
import { colors, fontSize, radius, spacing, touchTarget } from '../theme/tokens';
import { AudioControls } from './AudioControls';
import { DropTranscript } from './DropTranscript';
import { MenuButton } from './MenuButton';
import { PlaybackProgress } from './PlaybackProgress';

interface DropPlayerProps {
  exercise: DropExercise;
  /** Screen-level playback session (see useDropSession). */
  session: DropSession;
  onNext: () => void;
}

/** Passive listening: audio controls + full transcript, no quiz. Mount with `key={exercise.id}`. */
export const DropPlayer: React.FC<DropPlayerProps> = ({ exercise, session, onNext }) => {
  const [showTranslation, setShowTranslation] = useState<boolean>(false);

  return (
    <View style={styles.card}>
      <Text style={styles.topic}>{exercise.topic}</Text>
      <Text style={styles.title}>{exercise.title}</Text>
      {session.segment === 'chime' && <Text style={styles.status}>🔔 Starting…</Text>}

      <AudioControls
        isLoaded={session.isLoaded}
        isPlaying={session.isPlaying}
        onPlay={session.play}
        onPause={session.pause}
        onReplay={session.replay}
        isUnavailable={session.isUnavailable}
        onRetry={session.retry}
      />
      <PlaybackProgress
        currentTime={session.currentTime}
        duration={session.duration}
        onSeek={session.seekTo}
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
  status: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
