import easyNumbers from '../../assets/data/listening/numbers/easy_numbers.json';
import hardNumbers from '../../assets/data/listening/numbers/hard_numbers.json';
import mediumNumbers from '../../assets/data/listening/numbers/medium_numbers.json';
import { Difficulty, NumberExercise } from '../../types/exercises';
import { ExerciseLoadResult, listeningFileName, loadExercises } from './loadExercises';
import { parseNumberExercises } from './parseNumberExercises';

const RAW_NUMBERS: Record<Difficulty, unknown> = {
  easy: easyNumbers,
  medium: mediumNumbers,
  hard: hardNumbers,
};

export const loadNumbers = (difficulty: Difficulty): ExerciseLoadResult<NumberExercise> => {
  const fileName = listeningFileName(difficulty, 'numbers');
  return loadExercises(fileName, () =>
    parseNumberExercises(RAW_NUMBERS[difficulty], fileName, {
      requireChoices: difficulty === 'easy',
    }),
  );
};
