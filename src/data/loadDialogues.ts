import easyDialogues from '../../assets/data/listening/dialogues/easy_dialogues.json';
import hardDialogues from '../../assets/data/listening/dialogues/hard_dialogues.json';
import mediumDialogues from '../../assets/data/listening/dialogues/medium_dialogues.json';
import { DialogueExercise, Difficulty } from '../../types/exercises';
import { ExerciseLoadResult, listeningFileName, loadExercises } from './loadExercises';
import { parseDialogueExercises } from './parseDialogueExercises';

// Metro needs static imports, so each difficulty file is registered here.
const RAW_DIALOGUES: Record<Difficulty, unknown> = {
  easy: easyDialogues,
  medium: mediumDialogues,
  hard: hardDialogues,
};

export const loadDialogues = (difficulty: Difficulty): ExerciseLoadResult<DialogueExercise> => {
  const fileName = listeningFileName(difficulty, 'dialogues');
  return loadExercises(fileName, () => parseDialogueExercises(RAW_DIALOGUES[difficulty], fileName));
};
