import React, { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../utils/formatTime';
import { colors, fontSize, spacing, touchTarget } from '../theme/tokens';

interface PlaybackProgressProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

const THUMB_SIZE = 18;
const TRACK_HEIGHT = 6;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Progress bar with tap/drag-to-seek, built on PanResponder (no native slider). */
export const PlaybackProgress: React.FC<PlaybackProgressProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const trackWidth = useRef<number>(0);
  const grantX = useRef<number>(0);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const enabled = duration > 0;

  const responder = useMemo(() => {
    const ratioAt = (dx: number): number =>
      trackWidth.current > 0 ? clamp01((grantX.current + dx) / trackWidth.current) : 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: () => enabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: event => {
        grantX.current = event.nativeEvent.locationX;
        setDragRatio(ratioAt(0));
      },
      onPanResponderMove: (_event, gesture) => setDragRatio(ratioAt(gesture.dx)),
      onPanResponderRelease: (_event, gesture) => {
        setDragRatio(null);
        onSeek(ratioAt(gesture.dx) * duration);
      },
      onPanResponderTerminate: () => setDragRatio(null),
    });
  }, [enabled, duration, onSeek]);

  const handleLayout = (event: LayoutChangeEvent): void => {
    trackWidth.current = event.nativeEvent.layout.width;
  };

  const ratio = dragRatio ?? (enabled ? clamp01(currentTime / duration) : 0);
  const shownTime = dragRatio === null ? currentTime : dragRatio * duration;

  return (
    <View style={styles.container}>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Playback position"
        accessibilityValue={{ min: 0, max: Math.round(duration), now: Math.round(shownTime) }}
        onLayout={handleLayout}
        style={styles.touchArea}
        {...responder.panHandlers}
      >
        <View pointerEvents="none" style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: `${ratio * 100}%` }, !enabled && styles.thumbDisabled]}
        />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(shownTime)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  touchArea: {
    height: touchTarget - spacing.md,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginLeft: -THUMB_SIZE / 2,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary,
  },
  thumbDisabled: {
    backgroundColor: colors.border,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
