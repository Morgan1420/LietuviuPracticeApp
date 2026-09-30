import { setAudioModeAsync } from 'expo-audio';

/**
 * Single place that sets the app's audio mode. On Android setAudioModeAsync
 * is not a partial update — omitted fields reset to their defaults — so every
 * call must pass the full mode.
 */
export const configureAudioMode = async ({ background }: { background: boolean }): Promise<void> => {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: background,
      // Lock-screen controls (needed for sustained background playback) require exclusive focus.
      interruptionMode: background ? 'doNotMix' : 'mixWithOthers',
    });
  } catch (error) {
    console.error(`[AudioPlayback Error]: failed to set audio mode (background=${background})`, error);
  }
};
