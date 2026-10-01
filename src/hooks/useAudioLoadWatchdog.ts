import { useCallback, useEffect, useState } from 'react';
import { AUDIO_LOAD_TIMEOUT_MS } from '../audio/audioTimeouts';

interface AudioLoadWatchdogParams {
  /** Context for logs, e.g. the audio URL. */
  label: string;
  /** False while there is nothing to load yet (e.g. cache lookup in progress). */
  hasSource: boolean;
  isLoaded: boolean;
  /** Error reported by the native player, if any. */
  error: string | null | undefined;
}

export interface AudioLoadWatchdog {
  failed: boolean;
  /** Clears the failure and restarts the timeout (call when retrying). */
  reset: () => void;
}

/** Flags a clip as failed on a native error, or if it isn't loaded in time. */
export const useAudioLoadWatchdog = ({
  label,
  hasSource,
  isLoaded,
  error,
}: AudioLoadWatchdogParams): AudioLoadWatchdog => {
  const [failed, setFailed] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    if (error) {
      console.error(`[AudioPlayback Error]: could not load ${label}: ${error}`);
      setFailed(true);
    }
  }, [error, label]);

  useEffect(() => {
    if (!hasSource || isLoaded || failed) {
      return;
    }
    const timeout = setTimeout(() => {
      console.warn(`[AudioPlayback Warning]: ${label} not loaded after ${AUDIO_LOAD_TIMEOUT_MS} ms`);
      setFailed(true);
    }, AUDIO_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [hasSource, isLoaded, failed, label, attempt]);

  const reset = useCallback((): void => {
    setFailed(false);
    setAttempt(current => current + 1);
  }, []);

  return { failed: failed && !isLoaded, reset };
};
