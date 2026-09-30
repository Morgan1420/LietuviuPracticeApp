import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioStatus, useAudioPlayer } from 'expo-audio';
import { DropExercise } from '../../types/exercises';
import { configureAudioMode } from '../audio/audioMode';
import { getCachedAudioUri, prefetchAudio } from '../audio/audioCache';
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

  // Refs read by native event handlers, which may fire while backgrounded.
  const segmentRef = useRef<DropSegment>('idle');
  const targetDrop = useRef<DropExercise | null>(null);
  const generation = useRef<number>(0);
  const latest = useRef({ upcoming, autoPlay, onAdvance });
  latest.current = { upcoming, autoPlay, onAdvance };

  const setSegment = useCallback((next: DropSegment): void => {
    segmentRef.current = next;
    setSegmentState(next);
  }, []);

  /** Loads `drop` into the player (from the cache) unless a newer request superseded it. */
  const loadDrop = useCallback(
    async (drop: DropExercise, autoStart: boolean): Promise<void> => {
      const token = ++generation.current;
      targetDrop.current = drop;
      const uri = await getCachedAudioUri(drop.audioUrl);
      if (token !== generation.current) {
        return;
      }
      try {
        player.replace({ uri });
        setSegment('drop');
        player.updateLockScreenMetadata({ title: drop.title, artist: LOCK_SCREEN_ARTIST });
        if (autoStart) {
          player.play();
        }
      } catch (error) {
        console.error(`[AudioPlayback Error]: could not load drop ${drop.id}`, error);
      }
    },
    [player, setSegment],
  );

  /** Plays the chime; the status listener loads and starts `drop` when it ends. */
  const chimeThen = useCallback(
    (drop: DropExercise): void => {
      generation.current++;
      targetDrop.current = drop;
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
    [player, setSegment, loadDrop],
  );

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
      configureAudioMode({ background: false });
      try {
        player.setActiveForLockScreen(false);
      } catch {
        // The player may already be released on unmount; that also unregisters it.
      }
    };
  }, [player]);

  // Native-driven transitions: chime end → drop; drop end → next (auto-play).
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (update: AudioStatus) => {
      if (!update.didJustFinish) {
        return;
      }
      if (segmentRef.current === 'chime' && targetDrop.current) {
        loadDrop(targetDrop.current, true);
        return;
      }
      if (segmentRef.current === 'drop' && latest.current.autoPlay) {
        const next = latest.current.upcoming;
        latest.current.onAdvance();
        if (next) {
          chimeThen(next);
        } else {
          targetDrop.current = null;
          setSegment('idle');
        }
      }
    });
    return () => subscription.remove();
  }, [player, loadDrop, chimeThen, setSegment]);

  // Queue changes from the UI ("Next drop", Start over, first load). Transitions
  // already started by the listener above are recognised and skipped.
  useEffect(() => {
    if (!current) {
      generation.current++;
      targetDrop.current = null;
      player.pause();
      setSegment('idle');
      return;
    }
    if (targetDrop.current?.id !== current.id) {
      start(current, latest.current.autoPlay);
    }
  }, [current, player, start, setSegment]);

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

  const inDrop = segment === 'drop';
  return {
    segment,
    // During the chime, Play stays enabled so the user can skip straight to the drop.
    isLoaded: inDrop ? status.isLoaded : segment === 'chime',
    isPlaying: inDrop && status.playing,
    currentTime: inDrop ? status.currentTime : 0,
    duration: inDrop ? status.duration : 0,
    play,
    pause,
    replay,
    seekTo,
  };
};
