import { useEffect, useState } from 'react';
import { AudioPlayer, AudioStatus } from 'expo-audio';

/**
 * Race-free replacement for expo-audio's useAudioPlayerStatus.
 *
 * The native player emits its "loaded" status as soon as it is ready, which
 * for a cached local file can happen before a React effect subscribes. The
 * stock hook then misses it and reports isLoaded=false forever (and it also
 * keeps the previous player's status when the player instance changes).
 * Here we subscribe first and then read the current status, so no update is
 * lost either way.
 */
export const usePlayerStatus = (player: AudioPlayer): AudioStatus => {
  const [status, setStatus] = useState<AudioStatus>(() => player.currentStatus);

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', setStatus);
    setStatus(player.currentStatus);
    return () => subscription.remove();
  }, [player]);

  return status;
};
