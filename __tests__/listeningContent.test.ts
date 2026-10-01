import { REMOTE_CONTENT } from '../src/config/remoteContent';
import { readCachedContent, writeCachedContent } from '../src/data/contentCache';
import { fetchJson } from '../src/data/fetchJson';
import { loadListeningContent } from '../src/data/listeningContent';

jest.mock('../src/data/fetchJson', () => ({ fetchJson: jest.fn() }));
jest.mock('../src/data/contentCache', () => ({
  readCachedContent: jest.fn(),
  writeCachedContent: jest.fn(),
}));

const mockFetchJson = fetchJson as jest.MockedFunction<typeof fetchJson>;
const mockReadCache = readCachedContent as jest.MockedFunction<typeof readCachedContent>;
const mockWriteCache = writeCachedContent as jest.MockedFunction<typeof writeCachedContent>;

const drop = (id: string) => ({
  id,
  type: 'drop',
  title: `Title ${id}`,
  topic: 'Topic',
  audioUrl: `https://example.com/${id}.mp3`,
  lines: [{ lt: 'Labas', en: 'Hi' }],
});

const REMOTE_URL = 'https://firebasestorage.googleapis.com/v0/b/test/o/data%2Fdrops.json?alt=media';
const originalUrl = REMOTE_CONTENT.drops.medium;

beforeEach(() => {
  jest.resetAllMocks();
  REMOTE_CONTENT.drops.medium = REMOTE_URL;
  mockReadCache.mockResolvedValue(undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  REMOTE_CONTENT.drops.medium = originalUrl;
  jest.restoreAllMocks();
});

test('remote JSON is fetched, validated, used and saved for offline use', async () => {
  const remote = [drop('r1'), drop('r2')];
  mockFetchJson.mockResolvedValue(remote);

  const content = await loadListeningContent('drops', 'medium');

  expect(mockFetchJson).toHaveBeenCalledWith(REMOTE_URL, expect.any(Number));
  expect(content.source).toBe('remote');
  expect(content.ok && content.exercises.map(e => e.id)).toEqual(['r1', 'r2']);
  expect(mockWriteCache).toHaveBeenCalledWith('drops_medium', remote);
});

test('when the fetch fails, the last cached remote copy is used', async () => {
  mockFetchJson.mockRejectedValue(new Error('HTTP 404 Not Found'));
  mockReadCache.mockResolvedValue([drop('cached')]);

  const content = await loadListeningContent('drops', 'medium');

  expect(content.source).toBe('cache');
  expect(content.ok && content.exercises.map(e => e.id)).toEqual(['cached']);
  expect(mockWriteCache).not.toHaveBeenCalled();
});

test('without a cached copy it falls back to the bundled JSON', async () => {
  mockFetchJson.mockRejectedValue(new Error('timed out after 10000 ms'));

  const content = await loadListeningContent('drops', 'medium');

  expect(content.source).toBe('bundled');
  expect(content.ok).toBe(true);
});

test('invalid remote JSON is rejected with the exact field, then falls back', async () => {
  mockFetchJson.mockResolvedValue([{ ...drop('bad'), lines: [] }]);

  const content = await loadListeningContent('drops', 'medium');

  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining('remote medium_drops.json'),
    expect.stringContaining('remote medium_drops.json[0].lines'),
  );
  expect(mockWriteCache).not.toHaveBeenCalled();
  expect(content.source).toBe('bundled');
});

test('remote items without audio are skipped like bundled ones', async () => {
  mockFetchJson.mockResolvedValue([drop('ok'), { ...drop('no-audio'), audioUrl: '' }]);

  const content = await loadListeningContent('drops', 'medium');

  expect(content.source).toBe('remote');
  expect(content.ok && content.exercises.map(e => e.id)).toEqual(['ok']);
});

test('modes without a configured URL use the bundled JSON without fetching', async () => {
  REMOTE_CONTENT.drops.medium = null;

  const content = await loadListeningContent('drops', 'medium');

  expect(mockFetchJson).not.toHaveBeenCalled();
  expect(content.source).toBe('bundled');
});

test('the medium dialogues endpoint from Firebase is configured', () => {
  expect(REMOTE_CONTENT.dialogues.medium).toMatch(
    /^https:\/\/firebasestorage\.googleapis\.com\/.+medium_dialogues\.json\?alt=media&token=/,
  );
});
