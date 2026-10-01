import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioStatus, useAudioPlayer } from 'expo-audio';
import { DropExercise } from '../../types/exercises';
import { configureAudioMode } from '../audio/audioMode';
import { getCachedAudioUri, prefetchAudio } from '../audio/audioCache';
import { AUDIO_LOAD_TIMEOUT_MS } from '../audio/audioTimeouts';
import { SOUND_EFFECTS } from '../audio/soundEffects';
import { usePlayerStatus } from './usePlayerStatus';

/** What the session player currently holds: nothing, the transition chime, or a drop. */
export type DropSegment = 'idle' | 'chime' | 'drop';

export interface DropSession {
  segment: DropSegment;
  isLoaded: boolean;
  isPlaying: boolean;
  /** Seconds into the drop (0 while the chime plays). */
  currentTime: number;
  /** Drop length in seconds (0 until loaded / while the chime plays). */
  duration: number;
  /** The current drop's audio failed to load (only shown when auto-play is off). */
  isUnavailable: boolean;
  /** Tries loading the current drop again. */
  retry: () => void;
  play: () => void;
  pause: () => void;
  replay: () => void;
  seekTo: (seconds: number) => void;
}

interface UseDropSessionParams {
  current: DropExercise | undefined;
  upcoming: DropExercise | undefined;
  autoPlay: boolean;
  /** Advances the queue; called when a drop ends while auto-play is on. */
  onAdvance: () => void;
}

const LOCK_SCREEN_ARTIST = 'Lietuvių kalba · Drops';
// Treat anything this close to the end as "finished" so Play restarts the drop.
const END_TOLERANCE_SECONDS = 0.1;

/**
 * One long-lived player for the whole Drops session: chime → drop → chime →
 * next drop… The player stays registered for lock-screen controls (Android
 * foreground service), and transitions are driven by native status events
 * rather than React renders, so the sequence keeps going with the screen
 * locked or the app in the background.
 */
export const useDropSession = ({
  current,
  upcoming,
  autoPlay,
  onAdvance,
}: UseDropSessionParams): DropSession => {
  const player = useAudioPlayer(null);
  const status = usePlayerStatus(player);
  const [segment, setSegmentState] = useState<DropSegment>('idle');
  const [isUnavailable, setUnavailable] = useState<boolean>(false);

  // Refs read by native event handlers, which may fire while backgrounded.
  const segmentRef = useRef<DropSegment>('idle');
  const targetDrop = useRef<DropExercise | null>(null);
  const generation = useRef<number>(0);
  const latest = useRef({ upcoming, autoPlay, onAdvance });
  latest.current = { upcoming, autoPlay, onAdvance };
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Assigned below; lets loadDrop's timeout reach the failure handler without a cycle.
  const onDropFailure = useRef<(drop: DropExercise, reason: string) => void>(() => undefined);

  const clearLoadTimer = useCallback((): void => {
    if (loadTimer.current !== null) {
      clearTimeout(loadTimer.current);
      loadTimer.current = null;
    }
  }, []);

  const setSegment = useCallback((next: DropSegment): void => {
    segmentRef.current = next;
    setSegmentState(next);
  }, []);

  /** Loads `drop` into the player (from the cache) unless a newer request superseded it. */
  const loadDrop = useCallback(
    async (drop: DropExercise, autoStart: boolean): Promise<void> => {
      const token = ++generation.current;
      targetDrop.current = drop;
      clearLoadTimer();
      setUnavailable(false);
      const uri = await getCachedAudioUri(drop.audioUrl);
      if (token !== generation.current) {
        return;
      }
      try {
        player.replace({ uri });
        setSegment('drop');
        // Cleared by the status listener once the drop reports isLoaded.
        loadTimer.current = setTimeout(() => {
          loadTimer.current = null;
          if (token === generation.current && segmentRef.current === 'drop') {
            onDropFailure.current(drop, `not loaded after ${AUDIO_LOAD_TIMEOUT_MS} ms`);
          }
        }, AUDIO_LOAD_TIMEOUT_MS);
        player.updateLockScreenMetadata({ title: drop.title, artist: LOCK_SCREEN_ARTIST });
        if (autoStart) {
          player.play();
        }
      } catch (error) {
        console.error(`[AudioPlayback Error]: could not load drop ${drop.id}`, error);
      }
    },
    [player, setSegment, clearLoadTimer],
  );

  /** Plays the chime; the status listener loads and starts `drop` when it ends. */
  const chimeThen = useCallback(
    (drop: DropExercise): void => {
      generation.current++;
      targetDrop.current = drop;
      clearLoadTimer();
      setUnavailable(false);
      prefetchAudio(drop.audioUrl);
      try {
        player.replace(SOUND_EFFECTS.transitionChime);
        setSegment('chime');
        player.updateLockScreenMetadata({ title: drop.title, artist: LOCK_SCREEN_ARTIST });
        player.play();
      } catch (error) {
        console.error('[AudioPlayback Error]: chime failed, starting drop directly', error);
        loadDrop(drop, true);
      }
    },
    [player, setSegment, loadDrop, clearLoadTimer],
  );

  /** Advances the queue and chimes into the next drop, or stops at the end. */
  const skipToNext = useCallback((): void => {
    const next = latest.current.upcoming;
    latest.current.onAdvance();
    if (next) {
      chimeThen(next);
    } else {
      generation.current++;
      targetDrop.current = null;
      setSegment('idle');
    }
  }, [chimeThen, setSegment]);

  onDropFailure.current = (drop: DropExercise, reason: string): void => {
    clearLoadTimer();
    if (latest.current.autoPlay) {
      console.warn(`[AudioPlayback Warning]: drop ${drop.id} unavailable (${reason}); skipping`);
      skipToNext();
    } else {
      console.warn(`[AudioPlayback Warning]: drop ${drop.id} unavailable (${reason})`);
      setUnavailable(true);
    }
  };

  const start = useCallback(
    (drop: DropExercise, withAutoPlay: boolean): void => {
      if (withAutoPlay) {
        chimeThen(drop);
      } else {
        loadDrop(drop, false);
      }
    },
    [chimeThen, loadDrop],
  );

  // Session setup: background audio mode + lock-screen registration.
  useEffect(() => {
    configureAudioMode({ background: true });
    try {
      player.setActiveForLockScreen(true, { title: 'Drops', artist: LOCK_SCREEN_ARTIST });
    } catch (error) {
      console.error('[AudioPlayback Error]: could not enable lock-screen controls', error);
    }
    return () => {
      clearLoadTimer();
      configureAudioMode({ background: false });
      try {
        player.setActiveForLockScreen(false);
      } catch {
        // The player may already be released on unmount; that also unregisters it.
      }
    };
  }, [player, clearLoadTimer]);

  // Native-driven transitions: chime end → drop; drop end or failure → next (auto-play).
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (update: AudioStatus) => {
      const drop = targetDrop.current;
      if (update.error) {
        if (segmentRef.current === 'chime' && drop) {
          loadDrop(drop, true); // A broken chime must not block the drop.
        } else if (segmentRef.current === 'drop' && drop) {
          onDropFailure.current(drop, update.error);
        }
        return;
      }
      if (segmentRef.current === 'drop' && update.isLoaded) {
        clearLoadTimer();
      }
      if (!update.didJustFinish) {
        return;
      }
      if (segmentRef.current === 'chime' && drop) {
        loadDrop(drop, true);
        return;
      }
      if (segmentRef.current === 'drop' && latest.current.autoPlay) {
        skipToNext();
      }
    });
    return () => subscription.remove();
  }, [player, loadDrop, skipToNext, clearLoadTimer]);

  // Queue changes from the UI ("Next drop", Start over, first load). Transitions
  // already started by the listener above are recognised and skipped.
  useEffect(() => {
    if (!current) {
      generation.current++;
      targetDrop.current = null;
      clearLoadTimer();
      player.pause();
      setSegment('idle');
      return;
    }
    if (targetDrop.current?.id !== current.id) {
      start(current, latest.current.autoPlay);
    }
  }, [current, player, start, setSegment, clearLoadTimer]);

  // Turning auto-play off during the chime cancels the automatic start.
  useEffect(() => {
    if (!autoPlay && segmentRef.current === 'chime' && targetDrop.current) {
      player.pause();
      loadDrop(targetDrop.current, false);
    }
  }, [autoPlay, player, loadDrop]);

  useEffect(() => {
    if (upcoming) {
      prefetchAudio(upcoming.audioUrl);
    }
  }, [upcoming]);

  const play = useCallback((): void => {
    const drop = targetDrop.current ?? current;
    if (segmentRef.current !== 'drop') {
      // Skips a playing chime, or loads the drop if nothing is loaded yet.
      player.pause();
      if (drop) {
        loadDrop(drop, true);
      }
      return;
    }
    const atEnd = status.duration > 0 && status.currentTime >= status.duration - END_TOLERANCE_SECONDS;
    (atEnd ? player.seekTo(0) : Promise.resolve())
      .then(() => player.play())
      .catch((error: unknown) => console.error('[AudioPlayback Error]: drop play failed', error));
  }, [player, current, loadDrop, status.duration, status.currentTime]);

  const pause = useCallback((): void => {
    if (segmentRef.current === 'chime' && targetDrop.current) {
      player.pause();
      loadDrop(targetDrop.current, false);
      return;
    }
    player.pause();
  }, [player, loadDrop]);

  const replay = useCallback((): void => {
    if (segmentRef.current !== 'drop') {
      play();
      return;
    }
    player
      .seekTo(0)
      .then(() => player.play())
      .catch((error: unknown) => console.error('[AudioPlayback Error]: drop replay failed', error));
  }, [player, play]);

  const seekTo = useCallback(
    (seconds: number): void => {
      if (segmentRef.current === 'drop') {
        player.seekTo(seconds).catch((error: unknown) => {
          console.error(`[AudioPlayback Error]: seek to ${seconds}s failed`, error);
        });
      }
    },
    [player],
  );

  const retry = useCallback((): void => {
    const drop = targetDrop.current ?? current;
    if (drop) {
      loadDrop(drop, true);
    }
  }, [current, loadDrop]);

  const inDrop = segment === 'drop';
  return {
    segment,
    // During the chime, Play stays enabled so the user can skip straight to the drop.
    isLoaded: inDrop ? status.isLoaded : segment === 'chime',
    isPlaying: inDrop && status.playing,
    currentTime: inDrop ? status.currentTime : 0,
    duration: inDrop ? status.duration : 0,
    isUnavailable,
    retry,
    play,
    pause,
    replay,
    seekTo,
  };
};
