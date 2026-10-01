import easyDialogues from '../../assets/data/listening/dialogues/easy_dialogues.json';
import hardDialogues from '../../assets/data/listening/dialogues/hard_dialogues.json';
import mediumDialogues from '../../assets/data/listening/dialogues/medium_dialogues.json';
import easyDrops from '../../assets/data/listening/drops/easy_drops.json';
import hardDrops from '../../assets/data/listening/drops/hard_drops.json';
import mediumDrops from '../../assets/data/listening/drops/medium_drops.json';
import easyNumbers from '../../assets/data/listening/numbers/easy_numbers.json';
import hardNumbers from '../../assets/data/listening/numbers/hard_numbers.json';
import mediumNumbers from '../../assets/data/listening/numbers/medium_numbers.json';
import {
  ContentSource,
  DialogueExercise,
  Difficulty,
  DropExercise,
  ListeningMode,
  NumberExercise,
} from '../../types/exercises';
import { REMOTE_CONTENT, REMOTE_FETCH_TIMEOUT_MS } from '../config/remoteContent';
import { readCachedContent, writeCachedContent } from './contentCache';
import { fetchJson } from './fetchJson';
import { ExerciseLoadResult, loadExercises } from './loadExercises';
import { parseDialogueExercises } from './parseDialogueExercises';
import { parseDropExercises } from './parseDropExercises';
import { parseNumberExercises } from './parseNumberExercises';

export interface ListeningExerciseMap {
  dialogues: DialogueExercise;
  numbers: NumberExercise;
  drops: DropExercise;
}

export type ListeningContent<M extends ListeningMode> = ExerciseLoadResult<ListeningExerciseMap[M]> & {
  source: ContentSource;
};

interface ModeDefinition<T> {
  parse: (raw: unknown, fileName: string, difficulty: Difficulty) => T[];
  /** Copies shipped in the app (Metro needs static imports). */
  bundled: Record<Difficulty, unknown>;
}

const MODES: { [M in ListeningMode]: ModeDefinition<ListeningExerciseMap[M]> } = {
  dialogues: {
    parse: (raw, fileName) => parseDialogueExercises(raw, fileName),
    bundled: { easy: easyDialogues, medium: mediumDialogues, hard: hardDialogues },
  },
  numbers: {
    parse: (raw, fileName, difficulty) =>
      parseNumberExercises(raw, fileName, { requireChoices: difficulty === 'easy' }),
    bundled: { easy: easyNumbers, medium: mediumNumbers, hard: hardNumbers },
  },
  drops: {
    parse: (raw, fileName) => parseDropExercises(raw, fileName),
    bundled: { easy: easyDrops, medium: mediumDrops, hard: hardDrops },
  },
};

export const listeningFileName = (mode: ListeningMode, difficulty: Difficulty): string =>
  `${difficulty}_${mode}.json`;

/** Validates the copy bundled with the app (synchronous). */
export const loadBundledContent = <M extends ListeningMode>(
  mode: M,
  difficulty: Difficulty,
): ListeningContent<M> => {
  const fileName = listeningFileName(mode, difficulty);
  const definition: ModeDefinition<ListeningExerciseMap[M]> = MODES[mode];
  return {
    ...loadExercises(fileName, () => definition.parse(definition.bundled[difficulty], fileName, difficulty)),
    source: 'bundled',
  };
};

/**
 * Loads a listening set: remote JSON first (validated, then saved for offline
 * use), falling back to the last cached remote copy, then the bundled copy.
 */
export const loadListeningContent = async <M extends ListeningMode>(
  mode: M,
  difficulty: Difficulty,
): Promise<ListeningContent<M>> => {
  const url = REMOTE_CONTENT[mode][difficulty];
  if (url === null) {
    return loadBundledContent(mode, difficulty);
  }

  const fileName = listeningFileName(mode, difficulty);
  const cacheKey = `${mode}_${difficulty}`;
  const definition: ModeDefinition<ListeningExerciseMap[M]> = MODES[mode];
  const parse = (raw: unknown) => () => definition.parse(raw, `remote ${fileName}`, difficulty);

  try {
    const raw = await fetchJson(url, REMOTE_FETCH_TIMEOUT_MS);
    const result = loadExercises(`remote ${fileName}`, parse(raw));
    if (result.ok) {
      writeCachedContent(cacheKey, raw);
      return { ...result, source: 'remote' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[RemoteContent Warning]: ${fileName} fetch failed (${message}); using fallback`);
  }

  const cached = await readCachedContent(cacheKey);
  if (cached !== undefined) {
    const result = loadExercises(`cached ${fileName}`, parse(cached));
    if (result.ok) {
      return { ...result, source: 'cache' };
    }
  }
  return loadBundledContent(mode, difficulty);
};
