import { AudioSource } from 'expo-audio';

/**
 * Maps a playable URI (remote URL or cached file:// URI) to an expo-audio
 * source, so components never hardcode audio paths. null = not ready yet.
 */
export const resolveAudioSource = (uri: string | null): AudioSource =>
  uri === null ? null : { uri };
