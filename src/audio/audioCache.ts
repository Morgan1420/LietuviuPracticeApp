import { Directory, File, Paths } from 'expo-file-system';

/**
 * Disk cache for remote exercise audio (e.g. Firebase Storage URLs).
 *
 * The first request downloads the file into the OS cache directory; later
 * requests — in this session or after a restart — play the local copy. An
 * in-memory map dedupes concurrent requests and skips repeat disk checks.
 * The OS may purge the cache directory under storage pressure; files are
 * then simply downloaded again.
 */

const CACHE_DIR_NAME = 'audio-cache';

/** Resolved local URIs, readable synchronously to avoid a loading flash. */
const cachedUris = new Map<string, string>();
/** In-flight or settled lookups, so each URL is downloaded at most once. */
const pendingUris = new Map<string, Promise<string>>();

const isRemoteUrl = (url: string): boolean => /^https?:\/\//i.test(url);

/** FNV-1a hash of the full URL (query included, so a new Firebase token is a new file). */
export const cacheKeyForUrl = (url: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < url.length; i++) {
    /* eslint-disable no-bitwise -- FNV-1a is defined in terms of XOR and uint32 math */
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
    /* eslint-enable no-bitwise */
  }
  return `${hash.toString(16).padStart(8, '0')}-${url.length}`;
};

const getCacheDirectory = (): Directory => {
  const directory = new Directory(Paths.cache, CACHE_DIR_NAME);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
};

const downloadToCache = async (url: string): Promise<string> => {
  const directory = getCacheDirectory();
  const key = cacheKeyForUrl(url);
  const target = new File(directory, `${key}.mp3`);
  if (target.exists) {
    return target.uri;
  }
  // Download to a temporary name first so an interrupted download is never
  // mistaken for a complete cached file.
  const partial = new File(directory, `${key}.part`);
  if (partial.exists) {
    partial.delete();
  }
  await File.downloadFileAsync(url, partial, { idempotent: true });
  await partial.move(target);
  return target.uri;
};

/** Local URI if this URL was already cached in this session, otherwise undefined. */
export const peekCachedAudioUri = (url: string): string | undefined =>
  isRemoteUrl(url) ? cachedUris.get(url) : url;

/**
 * Resolves a playable URI for `url`, downloading it into the cache on first
 * use. Falls back to the remote URL (streaming) if caching fails.
 */
export const getCachedAudioUri = (url: string): Promise<string> => {
  if (!isRemoteUrl(url)) {
    return Promise.resolve(url);
  }
  const pending = pendingUris.get(url);
  if (pending) {
    return pending;
  }
  const request = downloadToCache(url)
    .then(uri => {
      cachedUris.set(url, uri);
      return uri;
    })
    .catch((error: unknown) => {
      console.error(`[AudioCache Error]: caching failed, streaming instead: ${url}`, error);
      pendingUris.delete(url); // Allow a retry on the next request.
      return url;
    });
  pendingUris.set(url, request);
  return request;
};

/** Starts caching `url` in the background, e.g. for the next exercise in a queue. */
export const prefetchAudio = (url: string): void => {
  getCachedAudioUri(url).catch(() => undefined);
};
