import { Directory, File, Paths } from 'expo-file-system';

/**
 * Last successfully fetched copy of each remote JSON file, kept in the
 * documents directory (not purged by the OS) so content works offline.
 */

const CONTENT_DIR_NAME = 'content-cache';

const contentFile = (key: string): File => {
  const directory = new Directory(Paths.document, CONTENT_DIR_NAME);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return new File(directory, `${key}.json`);
};

export const readCachedContent = async (key: string): Promise<unknown | undefined> => {
  try {
    const file = contentFile(key);
    if (!file.exists) {
      return undefined;
    }
    return JSON.parse(await file.text());
  } catch (error) {
    console.error(`[ContentCache Error]: could not read ${key}.json`, error);
    return undefined;
  }
};

export const writeCachedContent = (key: string, content: unknown): void => {
  try {
    contentFile(key).write(JSON.stringify(content));
  } catch (error) {
    console.error(`[ContentCache Error]: could not write ${key}.json`, error);
  }
};
