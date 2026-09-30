import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AudioPlayer, AudioStatus } from 'expo-audio';
import { usePlayerStatus } from '../src/hooks/usePlayerStatus';

type Listener = (status: Partial<AudioStatus>) => void;

/**
 * A player that becomes "loaded" during render — i.e. before any effect could
 * subscribe — mimicking a cached local file that ExoPlayer prepares instantly.
 */
const makeFastLoadingPlayer = (): { player: AudioPlayer; listeners: Set<Listener> } => {
  const listeners = new Set<Listener>();
  let status: Partial<AudioStatus> = { isLoaded: false, playing: false };
  const fake = {
    get currentStatus() {
      const snapshot = status;
      status = { isLoaded: true, playing: false }; // "ready" right after first read
      return snapshot;
    },
    addListener: (_event: string, listener: Listener) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    },
  };
  return { player: fake as unknown as AudioPlayer, listeners };
};

test('a "loaded" status emitted before subscribing is not lost', async () => {
  const { player } = makeFastLoadingPlayer();
  let seen: AudioStatus | undefined;
  const Probe: React.FC = () => {
    seen = usePlayerStatus(player);
    return null;
  };
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<Probe />);
  });
  expect(seen?.isLoaded).toBe(true);
});

test('later status events are applied', async () => {
  const { player, listeners } = makeFastLoadingPlayer();
  let seen: AudioStatus | undefined;
  const Probe: React.FC = () => {
    seen = usePlayerStatus(player);
    return null;
  };
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<Probe />);
  });
  await ReactTestRenderer.act(async () => {
    listeners.forEach(listener => listener({ isLoaded: true, playing: true }));
  });
  expect(seen?.playing).toBe(true);
});
