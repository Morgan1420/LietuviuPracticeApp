import easyDialogues from '../../assets/data/listening/dialogues/easy_dialogues.json';
import hardDialogues from '../../assets/data/listening/dialogues/hard_dialogues.json';
import mediumDialogues from '../../assets/data/listening/dialogues/medium_dialogues.json';
import { DialogueExercise, Difficulty } from '../../types/exercises';
import { parseDialogueExercises } from './parseDialogueExercises';

export type DialogueLoadResult =
  | { ok: true; exercises: DialogueExercise[] }
  | { ok: false; message: string };

// Metro needs static imports, so each difficulty file is registered here.
const RAW_DIALOGUES: Record<Difficulty, unknown> = {
  easy: easyDialogues,
  medium: mediumDialogues,
  hard: hardDialogues,
};

export const loadDialogues = (difficulty: Difficulty): DialogueLoadResult => {
  try {
    return { ok: true, exercises: parseDialogueExercises(RAW_DIALOGUES[difficulty]) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[DialogueData Error]: could not load ${difficulty}_dialogues.json`, message);
    return { ok: false, message };
  }
};
