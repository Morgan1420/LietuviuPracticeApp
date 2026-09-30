import { useEffect, useState } from 'react';
import { getCachedAudioUri, peekCachedAudioUri } from '../audio/audioCache';

/**
 * Returns a playable URI for `audioUrl`: the cached local file once it is
 * available (or the remote URL if caching failed), and null while resolving.
 */
export const useCachedAudioUri = (audioUrl: string): string | null => {
  const [uri, setUri] = useState<string | null>(() => peekCachedAudioUri(audioUrl) ?? null);

  useEffect(() => {
    let cancelled = false;
    const known = peekCachedAudioUri(audioUrl);
    setUri(known ?? null);
    if (known === undefined) {
      getCachedAudioUri(audioUrl).then(resolved => {
        if (!cancelled) {
          setUri(resolved);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [audioUrl]);

  return uri;
};
