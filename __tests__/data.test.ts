import { Difficulty } from '../types/exercises';
import { loadDialogues } from '../src/data/loadDialogues';
import { loadDrops } from '../src/data/loadDrops';
import { loadNumbers } from '../src/data/loadNumbers';
import { parseNumberExercises } from '../src/data/parseNumberExercises';
import { formatTime } from '../src/utils/formatTime';
import { isSameNumber } from '../src/utils/normalizeNumber';
import { shuffle } from '../src/utils/shuffle';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

describe('listening JSON files are valid', () => {
  test.each(DIFFICULTIES)('%s dialogues, numbers and drops', difficulty => {
    for (const result of [loadDialogues(difficulty), loadNumbers(difficulty), loadDrops(difficulty)]) {
      expect(result).toEqual(expect.objectContaining({ ok: true }));
    }
  });
});

test('easy numbers require multiple-choice options', () => {
  const item = {
    id: 'x',
    type: 'number',
    context: 'Price',
    prompt: 'How much?',
    audioUrl: 'https://example.com/x.mp3',
    transcriptLt: 'Penki eurai.',
    answer: '5 €',
  };
  expect(() => parseNumberExercises([item], 'easy_numbers.json', { requireChoices: true })).toThrow(
    'easy_numbers.json[0].choices',
  );
  expect(() =>
    parseNumberExercises(
      [{ ...item, choices: { options: ['6', '5', '7', '8'], correctOptionIndex: 0 } }],
      'easy_numbers.json',
      { requireChoices: true },
    ),
  ).toThrow('easy_numbers.json[0].choices.options[0]');
});

test('isSameNumber compares digits only', () => {
  expect(isSameNumber('12,50 €', '1250')).toBe(true);
  expect(isSameNumber('+370 698 76543', '37069876543')).toBe(true);
  expect(isSameNumber('12', '120')).toBe(false);
  expect(isSameNumber('€', '')).toBe(false);
});

test('shuffle keeps every item exactly once', () => {
  const items = Array.from({ length: 20 }, (_, i) => i);
  const shuffled = shuffle(items);
  expect(shuffled).not.toBe(items);
  expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
});

test('formatTime', () => {
  expect(formatTime(0)).toBe('0:00');
  expect(formatTime(65.4)).toBe('1:05');
  expect(formatTime(Number.NaN)).toBe('0:00');
});
