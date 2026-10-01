import { Difficulty } from '../types/exercises';
import { loadBundledContent } from '../src/data/listeningContent';
import { parseDropExercises } from '../src/data/parseDropExercises';
import { parseNumberExercises } from '../src/data/parseNumberExercises';
import { formatTime } from '../src/utils/formatTime';
import { isSameNumber } from '../src/utils/normalizeNumber';
import { shuffle } from '../src/utils/shuffle';

// Only the bundled JSON is exercised here; no network or file system.
jest.mock('../src/data/fetchJson', () => ({ fetchJson: jest.fn() }));
jest.mock('../src/data/contentCache', () => ({
  readCachedContent: jest.fn(),
  writeCachedContent: jest.fn(),
}));

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

describe('listening JSON files are valid', () => {
  test.each(DIFFICULTIES)('%s dialogues, numbers and drops', difficulty => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    for (const mode of ['dialogues', 'numbers', 'drops'] as const) {
      const result = loadBundledContent(mode, difficulty);
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

test('items without audio are skipped; the rest of the file still loads', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const drop = (id: string, audioUrl?: string | null) => ({
    id,
    type: 'drop',
    title: 'T',
    topic: 'T',
    audioUrl,
    lines: [{ lt: 'Labas', en: 'Hi' }],
  });
  const parsed = parseDropExercises(
    [drop('ok', 'https://example.com/a.mp3'), drop('blank', '  '), drop('missing'), drop('null', null)],
    'test_drops.json',
  );
  expect(parsed.map(d => d.id)).toEqual(['ok']);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('skipped 3 item(s) without audio: blank, missing, null'));

  // Other invalid fields still fail loudly.
  expect(() => parseDropExercises([{ ...drop('bad', 'https://x/y.mp3'), lines: [] }], 'test_drops.json')).toThrow(
    'test_drops.json[0].lines',
  );
  warn.mockRestore();
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
