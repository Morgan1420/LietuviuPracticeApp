import { DropExercise, DropLine } from '../../types/exercises';
import { fail, parseList, readArray, readRecord, readString, readType } from './schema';

const parseDropLine = (value: unknown, path: string): DropLine => {
  const record = readRecord(value, path);
  return { lt: readString(record, 'lt', path), en: readString(record, 'en', path) };
};

const parseDropExercise = (value: unknown, path: string): DropExercise => {
  const record = readRecord(value, path);
  const lines = readArray(record.lines, `${path}.lines`).map((line, i) =>
    parseDropLine(line, `${path}.lines[${i}]`),
  );
  if (lines.length === 0) {
    return fail(`${path}.lines`, 'a non-empty array');
  }
  return {
    id: readString(record, 'id', path),
    type: readType(record, 'drop', path),
    title: readString(record, 'title', path),
    topic: readString(record, 'topic', path),
    audioUrl: readString(record, 'audioUrl', path),
    lines,
  };
};

export const parseDropExercises = (raw: unknown, fileName: string): DropExercise[] =>
  parseList(raw, fileName, parseDropExercise);
