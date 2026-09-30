// In-memory stand-in for expo-file-system: tracks which paths "exist" and
// counts downloads, so the cache logic can be tested without a device.
const mockDisk = new Set<string>();
const mockDownload = jest.fn();

jest.mock('expo-file-system', () => {
  const pathOf = (parts: unknown[]): string =>
    parts.map(part => (typeof part === 'string' ? part : (part as { uri: string }).uri)).join('/');

  class Directory {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = pathOf(parts);
    }
    get exists(): boolean {
      return mockDisk.has(this.uri);
    }
    create(): void {
      mockDisk.add(this.uri);
    }
  }

  class File {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = pathOf(parts);
    }
    get exists(): boolean {
      return mockDisk.has(this.uri);
    }
    delete(): void {
      mockDisk.delete(this.uri);
    }
    async move(destination: File): Promise<void> {
      mockDisk.delete(this.uri);
      mockDisk.add(destination.uri);
      this.uri = destination.uri;
    }
    static downloadFileAsync = async (url: string, destination: File): Promise<File> => {
      await mockDownload(url);
      mockDisk.add(destination.uri);
      return destination;
    };
  }

  return { Directory, File, Paths: { cache: { uri: 'file:///cache' } } };
});

type AudioCacheModule = typeof import('../src/audio/audioCache');

const URL_A = 'https://firebasestorage.googleapis.com/v0/b/app/o/audio%2Fa.mp3?alt=media&token=1';
const URL_B = 'https://firebasestorage.googleapis.com/v0/b/app/o/audio%2Fb.mp3?alt=media&token=2';

// Fresh module per test so the in-memory maps start empty.
const loadCache = (): AudioCacheModule => {
  let cache: AudioCacheModule | undefined;
  jest.isolateModules(() => {
    cache = require('../src/audio/audioCache');
  });
  if (!cache) {
    throw new Error('audioCache failed to load');
  }
  return cache;
};

beforeEach(() => {
  mockDisk.clear();
  mockDownload.mockReset();
  mockDownload.mockResolvedValue(undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('downloads once, then reuses the cached file', async () => {
  const cache = loadCache();
  const first = await cache.getCachedAudioUri(URL_A);
  const second = await cache.getCachedAudioUri(URL_A);

  expect(first).toMatch(/^file:\/\/\/cache\/audio-cache\/[0-9a-f]{8}-\d+\.mp3$/);
  expect(second).toBe(first);
  expect(mockDownload).toHaveBeenCalledTimes(1);
  expect(cache.peekCachedAudioUri(URL_A)).toBe(first);
});

test('concurrent requests share a single download', async () => {
  const cache = loadCache();
  const [a, b, c] = await Promise.all([
    cache.getCachedAudioUri(URL_A),
    cache.getCachedAudioUri(URL_A),
    cache.getCachedAudioUri(URL_A),
  ]);
  expect(new Set([a, b, c]).size).toBe(1);
  expect(mockDownload).toHaveBeenCalledTimes(1);
});

test('a file cached in a previous session is reused without downloading', async () => {
  await loadCache().getCachedAudioUri(URL_A);
  expect(mockDownload).toHaveBeenCalledTimes(1);

  // New app session: memory is empty, disk still has the file.
  const uri = await loadCache().getCachedAudioUri(URL_A);
  expect(uri).toMatch(/\.mp3$/);
  expect(mockDownload).toHaveBeenCalledTimes(1);
});

test('different URLs are cached separately', async () => {
  const cache = loadCache();
  const a = await cache.getCachedAudioUri(URL_A);
  const b = await cache.getCachedAudioUri(URL_B);
  expect(a).not.toBe(b);
  expect(mockDownload).toHaveBeenCalledTimes(2);
});

test('a failed download streams the remote URL and retries next time', async () => {
  const cache = loadCache();
  mockDownload.mockRejectedValueOnce(new Error('offline'));

  expect(await cache.getCachedAudioUri(URL_A)).toBe(URL_A);
  expect(cache.peekCachedAudioUri(URL_A)).toBeUndefined();
  // No partial file is left behind looking like a complete one.
  expect([...mockDisk].some(path => path.endsWith('.mp3'))).toBe(false);

  expect(await cache.getCachedAudioUri(URL_A)).toMatch(/\.mp3$/);
  expect(mockDownload).toHaveBeenCalledTimes(2);
});

test('non-remote sources pass through untouched', async () => {
  const cache = loadCache();
  expect(await cache.getCachedAudioUri('file:///local/clip.mp3')).toBe('file:///local/clip.mp3');
  expect(mockDownload).not.toHaveBeenCalled();
});
