/**
 * A clip that hasn't become playable within this time is treated as
 * unavailable (bad/placeholder URL, offline, server error) instead of leaving
 * a dead Play button or a stalled Drops sequence.
 */
export const AUDIO_LOAD_TIMEOUT_MS = 15000;
