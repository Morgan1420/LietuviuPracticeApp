import {
  DialogueExercise,
  DialogueOptions,
  DialogueQuestion,
  OptionIndex,
  VocabularyItem,
} from '../../types/exercises';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isOptionIndex = (value: unknown): value is OptionIndex =>
  value === 0 || value === 1 || value === 2 || value === 3;

const fail = (path: string, expected: string): never => {
  throw new Error(`[DialogueData Error]: ${path} must be ${expected}`);
};

const readRecord = (value: unknown, path: string): UnknownRecord =>
  isRecord(value) ? value : fail(path, 'an object');

const readArray = (value: unknown, path: string): unknown[] =>
  isUnknownArray(value) ? value : fail(path, 'an array');

const readString = (record: UnknownRecord, key: string, path: string): string => {
  const value = record[key];
  return isNonEmptyString(value) ? value : fail(`${path}.${key}`, 'a non-empty string');
};

const parseOptions = (value: unknown, path: string): DialogueOptions => {
  const items = readArray(value, path);
  if (items.length !== 4 || !items.every(isNonEmptyString)) {
    return fail(path, 'an array of exactly 4 non-empty strings');
  }
  const [a, b, c, d] = items;
  return [a, b, c, d];
};

const parseVocabularyItem = (value: unknown, path: string): VocabularyItem => {
  const record = readRecord(value, path);
  return { lt: readString(record, 'lt', path), en: readString(record, 'en', path) };
};

const parseQuestion = (value: unknown, path: string): DialogueQuestion => {
  const record = readRecord(value, path);
  const correctOptionIndex = record.correctOptionIndex;
  if (!isOptionIndex(correctOptionIndex)) {
    return fail(`${path}.correctOptionIndex`, 'one of 0, 1, 2, 3');
  }
  return {
    id: readString(record, 'id', path),
    questionText: readString(record, 'questionText', path),
    options: parseOptions(record.options, `${path}.options`),
    correctOptionIndex,
    explanation: readString(record, 'explanation', path),
  };
};

const parseDialogueExercise = (value: unknown, path: string): DialogueExercise => {
  const record = readRecord(value, path);
  if (record.type !== 'dialogue') {
    return fail(`${path}.type`, '"dialogue"');
  }
  const questions = readArray(record.questions, `${path}.questions`).map((q, i) =>
    parseQuestion(q, `${path}.questions[${i}]`),
  );
  if (questions.length === 0) {
    return fail(`${path}.questions`, 'a non-empty array');
  }
  return {
    id: readString(record, 'id', path),
    type: 'dialogue',
    title: readString(record, 'title', path),
    topic: readString(record, 'topic', path),
    audioUrl: readString(record, 'audioUrl', path),
    transcriptLt: readString(record, 'transcriptLt', path),
    transcriptEn: readString(record, 'transcriptEn', path),
    keyVocabulary: readArray(record.keyVocabulary, `${path}.keyVocabulary`).map((v, i) =>
      parseVocabularyItem(v, `${path}.keyVocabulary[${i}]`),
    ),
    questions,
  };
};

/**
 * Validates raw JSON content against the DialogueExercise schema.
 * Throws a context-rich error pointing at the first invalid field.
 */
export const parseDialogueExercises = (raw: unknown): DialogueExercise[] =>
  readArray(raw, 'dialogues').map((item, i) => parseDialogueExercise(item, `dialogues[${i}]`));
