import { Difficulty } from '../../types/exercises';

export type ExerciseLoadResult<T> =
  | { ok: true; exercises: T[] }
  | { ok: false; message: string };

/** Runs a parser over a JSON source, turning validation errors into a result. */
export const loadExercises = <T>(
  fileName: string,
  parse: () => T[],
): ExerciseLoadResult<T> => {
  try {
    return { ok: true, exercises: parse() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ExerciseData Error]: could not load ${fileName}`, message);
    return { ok: false, message };
  }
};

export const listeningFileName = (difficulty: Difficulty, mode: string): string =>
  `${difficulty}_${mode}.json`;

const NO_EXERCISES: never[] = [];

/** The exercises of a load result, or a stable empty list if loading failed. */
export const loadedExercises = <T>(result: ExerciseLoadResult<T>): readonly T[] =>
  result.ok ? result.exercises : NO_EXERCISES;
