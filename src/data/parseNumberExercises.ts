import { NumberChoices, NumberExercise } from '../../types/exercises';
import { isSameNumber } from '../utils/normalizeNumber';
import {
  fail,
  parseList,
  parseOptions,
  readOptionIndex,
  readRecord,
  readString,
  readType,
} from './schema';

interface ParseNumberOptions {
  /** Easy files are multiple choice, so every item must provide `choices`. */
  requireChoices: boolean;
}

const parseChoices = (value: unknown, answer: string, path: string): NumberChoices => {
  const record = readRecord(value, path);
  const options = parseOptions(record.options, `${path}.options`);
  const correctOptionIndex = readOptionIndex(record, 'correctOptionIndex', path);
  if (!isSameNumber(options[correctOptionIndex], answer)) {
    return fail(`${path}.options[${correctOptionIndex}]`, `the same number as answer "${answer}"`);
  }
  return { options, correctOptionIndex };
};

const parseNumberExercise =
  ({ requireChoices }: ParseNumberOptions) =>
  (value: unknown, path: string): NumberExercise => {
    const record = readRecord(value, path);
    const answer = readString(record, 'answer', path);
    if (!/\d/.test(answer)) {
      return fail(`${path}.answer`, 'a string containing digits');
    }
    if (requireChoices && record.choices === undefined) {
      return fail(`${path}.choices`, 'present (easy numbers are multiple choice)');
    }
    return {
      id: readString(record, 'id', path),
      type: readType(record, 'number', path),
      context: readString(record, 'context', path),
      prompt: readString(record, 'prompt', path),
      audioUrl: readString(record, 'audioUrl', path),
      transcriptLt: readString(record, 'transcriptLt', path),
      answer,
      choices:
        record.choices === undefined
          ? undefined
          : parseChoices(record.choices, answer, `${path}.choices`),
    };
  };

export const parseNumberExercises = (
  raw: unknown,
  fileName: string,
  options: ParseNumberOptions,
): NumberExercise[] => parseList(raw, fileName, parseNumberExercise(options));
