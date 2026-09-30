import { useCallback, useEffect } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { resolveAudioSource } from '../audio/resolveAudioSource';

export type PlaybackRate = 0.75 | 1.0;

export interface ExerciseAudio {
  isLoaded: boolean;
  isPlaying: boolean;
  /** Seconds. */
  currentTime: number;
  /** Seconds; 0 until the clip has loaded. */
  duration: number;
  play: () => Promise<void>;
  pause: () => void;
  replay: (rate: PlaybackRate) => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
}

// Treat anything this close to the end as "finished" so Play restarts the clip.
const END_TOLERANCE_SECONDS = 0.1;

/**
 * Wraps expo-audio for a single exercise clip. useAudioPlayer releases the
 * native player (and its listeners) on unmount or when audioUrl changes.
 */
export const useExerciseAudio = (audioUrl: string): ExerciseAudio => {
  const player = useAudioPlayer(resolveAudioSource(audioUrl));
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch((error: unknown) => {
      console.error('[AudioPlayback Error]: failed to set audio mode', error);
    });
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

  return {
    isLoaded: status.isLoaded,
    isPlaying: status.playing,
    currentTime: status.currentTime,
    duration: status.duration,
    play,
    pause,
    replay,
    seekTo,
  };
};
