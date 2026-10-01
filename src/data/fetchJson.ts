/**
 * Fetches and parses a JSON document. Rejects on network errors, timeouts,
 * non-2xx responses and invalid JSON, with a message that names the cause.
 * (React Native's fetch is not subject to browser CORS rules.)
 */
export const fetchJson = async (url: string, timeoutMs: number): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('response is not valid JSON');
    }
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`timed out after ${timeoutMs} ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
