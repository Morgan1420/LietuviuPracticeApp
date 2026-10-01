import { fetchJson } from '../src/data/fetchJson';

const URL = 'https://example.com/data.json';
const originalFetch = globalThis.fetch;

const respond = (status: number, body: string): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : '',
    text: () => Promise.resolve(body),
  } as unknown as Response);

afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});

test('parses a successful JSON response', async () => {
  globalThis.fetch = jest.fn(() => Promise.resolve(respond(200, '[{"id":"a"}]')));
  await expect(fetchJson(URL, 1000)).resolves.toEqual([{ id: 'a' }]);
});

test('rejects non-2xx responses with the status', async () => {
  globalThis.fetch = jest.fn(() => Promise.resolve(respond(404, 'nope')));
  await expect(fetchJson(URL, 1000)).rejects.toThrow('HTTP 404 Not Found');
});

test('rejects invalid JSON', async () => {
  globalThis.fetch = jest.fn(() => Promise.resolve(respond(200, '<html>')));
  await expect(fetchJson(URL, 1000)).rejects.toThrow('response is not valid JSON');
});

test('times out a request that never answers', async () => {
  jest.useFakeTimers();
  globalThis.fetch = jest.fn(
    (_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
      }),
  );
  const pending = fetchJson(URL, 5000);
  jest.advanceTimersByTime(5000);
  await expect(pending).rejects.toThrow('timed out after 5000 ms');
});
