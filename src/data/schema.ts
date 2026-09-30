import { DialogueOptions, OptionIndex } from '../../types/exercises';

// Shared runtime-validation helpers for exercise JSON files.

export type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const isOptionIndex = (value: unknown): value is OptionIndex =>
  value === 0 || value === 1 || value === 2 || value === 3;

export const fail = (path: string, expected: string): never => {
  throw new Error(`[ExerciseData Error]: ${path} must be ${expected}`);
};

export const readRecord = (value: unknown, path: string): UnknownRecord =>
  isRecord(value) ? value : fail(path, 'an object');

export const readArray = (value: unknown, path: string): unknown[] =>
  isUnknownArray(value) ? value : fail(path, 'an array');

export const readString = (record: UnknownRecord, key: string, path: string): string => {
  const value = record[key];
  return isNonEmptyString(value) ? value : fail(`${path}.${key}`, 'a non-empty string');
};

export const readOptionIndex = (record: UnknownRecord, key: string, path: string): OptionIndex => {
  const value = record[key];
  return isOptionIndex(value) ? value : fail(`${path}.${key}`, 'one of 0, 1, 2, 3');
};

export const readType = <T extends string>(record: UnknownRecord, expected: T, path: string): T =>
  record.type === expected ? expected : fail(`${path}.type`, `"${expected}"`);

export const parseOptions = (value: unknown, path: string): DialogueOptions => {
  const items = readArray(value, path);
  if (items.length !== 4 || !items.every(isNonEmptyString)) {
    return fail(path, 'an array of exactly 4 non-empty strings');
  }
  const [a, b, c, d] = items;
  return [a, b, c, d];
};

/** An item whose audio isn't recorded yet: `audioUrl` missing or blank. */
const isMissingAudio = (item: unknown): boolean => {
  if (!isRecord(item)) {
    return false;
  }
  const { audioUrl } = item;
  return typeof audioUrl === 'string' ? audioUrl.trim() === '' : audioUrl === undefined || audioUrl === null;
};

/**
 * Parses a top-level JSON array, prefixing error paths with the file name.
 * Items without audio yet are skipped (with a warning) so the rest of the
 * file stays usable; any other invalid field still fails the whole file.
 */
export const parseList = <T>(
  raw: unknown,
  fileName: string,
  parseItem: (value: unknown, path: string) => T,
): T[] => {
  const parsed: T[] = [];
  const skippedIds: string[] = [];
  readArray(raw, fileName).forEach((item, i) => {
    if (isMissingAudio(item)) {
      const id = isRecord(item) && typeof item.id === 'string' ? item.id : `#${i}`;
      skippedIds.push(id);
      return;
    }
    parsed.push(parseItem(item, `${fileName}[${i}]`));
  });
  if (skippedIds.length > 0) {
    console.warn(
      `[ExerciseData Warning]: ${fileName}: skipped ${skippedIds.length} item(s) without audio: ${skippedIds.join(', ')}`,
    );
  }
  return parsed;
};
