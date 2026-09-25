import { AudioSource } from 'expo-audio';

/**
 * Maps the audioUrl stored in exercise JSON to a playable source, so
 * components never hardcode audio paths.
 */
export const resolveAudioSource = (audioUrl: string): AudioSource => ({ uri: audioUrl });
