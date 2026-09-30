import easyDrops from '../../assets/data/listening/drops/easy_drops.json';
import hardDrops from '../../assets/data/listening/drops/hard_drops.json';
import mediumDrops from '../../assets/data/listening/drops/medium_drops.json';
import { Difficulty, DropExercise } from '../../types/exercises';
import { ExerciseLoadResult, listeningFileName, loadExercises } from './loadExercises';
import { parseDropExercises } from './parseDropExercises';

const RAW_DROPS: Record<Difficulty, unknown> = {
  easy: easyDrops,
  medium: mediumDrops,
  hard: hardDrops,
};

export const loadDrops = (difficulty: Difficulty): ExerciseLoadResult<DropExercise> => {
  const fileName = listeningFileName(difficulty, 'drops');
  return loadExercises(fileName, () => parseDropExercises(RAW_DROPS[difficulty], fileName));
};
