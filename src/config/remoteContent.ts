import { Difficulty, ListeningMode } from '../../types/exercises';

/**
 * Remote exercise JSON files (Firebase Storage download URLs).
 *
 * Paste each file's download URL (Firebase console → file → "Download URL",
 * including the `?alt=media&token=…` part) into its slot. `null` = not
 * uploaded yet: the app then uses the copy bundled under
 * assets/data/listening/ instead.
 */
export const REMOTE_CONTENT: Record<ListeningMode, Record<Difficulty, string | null>> = {
  dialogues: {
    easy: null,
    medium:
      'https://firebasestorage.googleapis.com/v0/b/lietuviulearningapp.firebasestorage.app/o/data%2Flistenings%2Fdialogues%2Fmedium_dialogues.json?alt=media&token=dbef2d66-a84f-463d-9f67-7e257764bb7d',
    hard: null,
  },
  numbers: {
    easy: null,
    medium: null,
    hard: null,
  },
  drops: {
    easy: null,
    medium: null,
    hard: null,
  },
};

/** Give up on a remote fetch after this long and fall back to cached/bundled content. */
export const REMOTE_FETCH_TIMEOUT_MS = 10000;
