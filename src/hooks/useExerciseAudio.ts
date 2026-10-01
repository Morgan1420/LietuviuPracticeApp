import { useCallback, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { configureAudioMode } from '../audio/audioMode';
import { resolveAudioSource } from '../audio/resolveAudioSource';
import { useCachedAudioUri } from './useCachedAudioUri';
import { useAudioLoadWatchdog } from './useAudioLoadWatchdog';
import { usePlayerStatus } from './usePlayerStatus';

export type PlaybackRate = 0.75 | 1.0;

export interface ExerciseAudio {
  isLoaded: boolean;
  isPlaying: boolean;
  /** Seconds. */
  currentTime: number;
  /** Seconds; 0 until the clip has loaded. */
  duration: number;
  /** True on the status update where playback reached the end. */
  didJustFinish: boolean;
  /** The clip failed to load (error or timeout); show a notice instead of controls. */
  isUnavailable: boolean;
  /** Tries loading the clip again after it was marked unavailable. */
  retry: () => void;
  play: () => Promise<void>;
  pause: () => void;
  replay: (rate: PlaybackRate) => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
}

// Treat anything this close to the end as "finished" so Play restarts the clip.
const END_TOLERANCE_SECONDS = 0.1;

/**
 * Wraps expo-audio for a single exercise clip, played from the disk cache
 * (see audioCache). useAudioPlayer releases the native player (and its
 * listeners) on unmount or when the source changes.
 */
export const useExerciseAudio = (audioUrl: string): ExerciseAudio => {
  const playableUri = useCachedAudioUri(audioUrl);
  const player = useAudioPlayer(resolveAudioSource(playableUri));
  const status = usePlayerStatus(player);
  const watchdog = useAudioLoadWatchdog({
    label: audioUrl,
    hasSource: playableUri !== null,
    isLoaded: status.isLoaded,
    error: status.error,
  });

  useEffect(() => {
    configureAudioMode({ background: false });
  }, []);

  const setRate = useCallback(
    (rate: PlaybackRate): void => {
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(rate);
    },
    [player],
  );

  const play = useCallback(async (): Promise<void> => {
    try {
      const atEnd =
        status.duration > 0 && status.currentTime >= status.duration - END_TOLERANCE_SECONDS;
      if (atEnd) {
        await player.seekTo(0);
      }
      player.play();
    } catch (error) {
      console.error(`[AudioPlayback Error]: play failed for ${audioUrl}`, error);
    }
  }, [player, status.duration, status.currentTime, audioUrl]);

  const pause = useCallback((): void => {
    try {
      player.pause();
    } catch (error) {
      console.error(`[AudioPlayback Error]: pause failed for ${audioUrl}`, error);
    }
  }, [player, audioUrl]);

  const replay = useCallback(
    async (rate: PlaybackRate): Promise<void> => {
      try {
        setRate(rate);
        await player.seekTo(0);
        player.play();
      } catch (error) {
        console.error(`[AudioPlayback Error]: replay at ${rate}x failed for ${audioUrl}`, error);
      }
    },
    [player, setRate, audioUrl],
  );

  const seekTo = useCallback(
    async (seconds: number): Promise<void> => {
      try {
        await player.seekTo(seconds);
      } catch (error) {
        console.error(`[AudioPlayback Error]: seek to ${seconds}s failed for ${audioUrl}`, error);
      }
    },
    [player, audioUrl],
  );

  const { reset: resetWatchdog } = watchdog;
  const retry = useCallback((): void => {
    resetWatchdog();
    try {
      player.replace(resolveAudioSource(playableUri));
    } catch (error) {
      console.error(`[AudioPlayback Error]: retry failed for ${audioUrl}`, error);
    }
  }, [player, playableUri, resetWatchdog, audioUrl]);

  return {
    isLoaded: status.isLoaded,
    isPlaying: status.playing,
    currentTime: status.currentTime,
    duration: status.duration,
    didJustFinish: status.didJustFinish,
    isUnavailable: watchdog.failed,
    retry,
    play,
    pause,
    replay,
    seekTo,
  };
};
