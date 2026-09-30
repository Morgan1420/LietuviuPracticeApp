import { DialogueExercise, DialogueQuestion, VocabularyItem } from '../../types/exercises';
import {
  fail,
  parseList,
  parseOptions,
  readArray,
  readOptionIndex,
  readRecord,
  readString,
  readType,
} from './schema';

const parseVocabularyItem = (value: unknown, path: string): VocabularyItem => {
  const record = readRecord(value, path);
  return { lt: readString(record, 'lt', path), en: readString(record, 'en', path) };
};

const parseQuestion = (value: unknown, path: string): DialogueQuestion => {
  const record = readRecord(value, path);
  return {
    id: readString(record, 'id', path),
    questionText: readString(record, 'questionText', path),
    options: parseOptions(record.options, `${path}.options`),
    correctOptionIndex: readOptionIndex(record, 'correctOptionIndex', path),
    explanation: readString(record, 'explanation', path),
  };
};

const parseDialogueExercise = (value: unknown, path: string): DialogueExercise => {
  const record = readRecord(value, path);
  const questions = readArray(record.questions, `${path}.questions`).map((q, i) =>
    parseQuestion(q, `${path}.questions[${i}]`),
  );
  if (questions.length === 0) {
    return fail(`${path}.questions`, 'a non-empty array');
  }
  return {
    id: readString(record, 'id', path),
    type: readType(record, 'dialogue', path),
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
export const parseDialogueExercises = (raw: unknown, fileName = 'dialogues'): DialogueExercise[] =>
  parseList(raw, fileName, parseDialogueExercise);
