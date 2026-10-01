import React from 'react';
import ReactTestRenderer, { ReactTestRenderer as Renderer } from 'react-test-renderer';
import { DropExercise } from '../types/exercises';
import { AUDIO_LOAD_TIMEOUT_MS } from '../src/audio/audioTimeouts';
import { SOUND_EFFECTS } from '../src/audio/soundEffects';
import { DropSession, useDropSession } from '../src/hooks/useDropSession';
import { ExerciseQueue, useExerciseQueue } from '../src/hooks/useExerciseQueue';

type StatusUpdate = Record<string, unknown>;

/** Stand-in for the native player: records calls and emits status events on demand. */
class FakePlayer {
  private listeners = new Set<(status: StatusUpdate) => void>();
  currentStatus: StatusUpdate = { isLoaded: true, playing: false, currentTime: 12, duration: 65 };
  replace = jest.fn();
  play = jest.fn();
  pause = jest.fn();
  seekTo = jest.fn(() => Promise.resolve());
  setActiveForLockScreen = jest.fn();
  updateLockScreenMetadata = jest.fn();

  addListener(_event: string, listener: (status: StatusUpdate) => void): { remove: () => void } {
    this.listeners.add(listener);
    return { remove: () => this.listeners.delete(listener) };
  }

  emit(update: StatusUpdate): void {
    this.listeners.forEach(listener => listener({ ...this.currentStatus, ...update }));
  }
}

let mockPlayer = new FakePlayer();
const mockSetAudioMode = jest.fn((_mode: Record<string, unknown>) => Promise.resolve());

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => mockPlayer,
  setAudioModeAsync: (mode: Record<string, unknown>) => mockSetAudioMode(mode),
}));

jest.mock('../src/audio/audioCache', () => ({
  getCachedAudioUri: (url: string) => Promise.resolve(`file:///cache/${url.split('/').pop()}`),
  prefetchAudio: jest.fn(),
}));

const makeDrop = (n: number): DropExercise => ({
  id: `drop_${n}`,
  type: 'drop',
  title: `Drop ${n}`,
  topic: 'Test',
  audioUrl: `https://example.com/drop_${n}.mp3`,
  lines: [{ lt: 'Labas', en: 'Hi' }],
});

const DROPS = [makeDrop(1), makeDrop(2), makeDrop(3)];
const cachedUri = (drop: DropExercise): { uri: string } => ({ uri: `file:///cache/drop_${drop.id.split('_')[1]}.mp3` });

let session: DropSession | undefined;
let queue: ExerciseQueue<DropExercise> | undefined;

const Harness: React.FC<{ autoPlay: boolean }> = ({ autoPlay }) => {
  queue = useExerciseQueue(DROPS);
  session = useDropSession({
    current: queue.current,
    upcoming: queue.upcoming,
    autoPlay,
    onAdvance: queue.advance,
  });
  return null;
};

const mounted: Renderer[] = [];

const mount = async (autoPlay: boolean): Promise<Renderer> => {
  let renderer: Renderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness autoPlay={autoPlay} />);
  });
  if (!renderer) {
    throw new Error('Harness did not render');
  }
  mounted.push(renderer);
  return renderer;
};

afterEach(async () => {
  await ReactTestRenderer.act(async () => {
    mounted.splice(0).forEach(renderer => renderer.unmount());
  });
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const emit = async (update: StatusUpdate): Promise<void> => {
  await ReactTestRenderer.act(async () => {
    mockPlayer.emit(update);
  });
};

const finish = async (): Promise<void> => {
  await ReactTestRenderer.act(async () => {
    mockPlayer.emit({ didJustFinish: true, playing: false });
  });
};

const currentDrop = (): DropExercise => {
  if (!queue?.current) {
    throw new Error('Queue has no current drop');
  }
  return queue.current;
};

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  mockPlayer = new FakePlayer();
  mockSetAudioMode.mockClear();
  session = undefined;
  queue = undefined;
});

test('auto-play: chime → drop → chime → next drop (the reported bug)', async () => {
  await mount(true);
  const first = currentDrop();
  expect(mockPlayer.replace).toHaveBeenLastCalledWith(SOUND_EFFECTS.transitionChime);
  expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  expect(session?.segment).toBe('chime');

  await finish(); // chime ends
  expect(mockPlayer.replace).toHaveBeenLastCalledWith(cachedUri(first));
  expect(mockPlayer.play).toHaveBeenCalledTimes(2);
  expect(session?.segment).toBe('drop');

  await finish(); // first drop ends
  const second = currentDrop();
  expect(second.id).not.toBe(first.id);
  expect(queue?.position).toBe(1);
  expect(mockPlayer.replace).toHaveBeenLastCalledWith(SOUND_EFFECTS.transitionChime);
  expect(mockPlayer.play).toHaveBeenCalledTimes(3);

  await finish(); // chime ends → second drop must actually start
  expect(mockPlayer.replace).toHaveBeenLastCalledWith(cachedUri(second));
  expect(mockPlayer.play).toHaveBeenCalledTimes(4);
  expect(session?.segment).toBe('drop');
  expect(mockPlayer.updateLockScreenMetadata).toHaveBeenLastCalledWith(
    expect.objectContaining({ title: second.title }),
  );
});

test('auto-play runs to the end of the queue and then stops', async () => {
  await mount(true);
  for (let i = 0; i < DROPS.length; i++) {
    await finish(); // chime
    await finish(); // drop
  }
  expect(queue?.current).toBeUndefined();
  expect(session?.segment).toBe('idle');
  const playsAtEnd = mockPlayer.play.mock.calls.length;

  await finish(); // stray event after the end changes nothing
  expect(mockPlayer.play).toHaveBeenCalledTimes(playsAtEnd);
});

test('auto-play off: loads the drop without playing and does not advance', async () => {
  await mount(false);
  const first = currentDrop();
  expect(mockPlayer.replace).toHaveBeenCalledWith(cachedUri(first));
  expect(mockPlayer.replace).not.toHaveBeenCalledWith(SOUND_EFFECTS.transitionChime);
  expect(mockPlayer.play).not.toHaveBeenCalled();
  expect(session?.currentTime).toBe(12);
  expect(session?.duration).toBe(65);

  await finish();
  expect(queue?.position).toBe(0);
});

test('pressing Play during the chime skips straight to the drop', async () => {
  await mount(true);
  const first = currentDrop();
  await ReactTestRenderer.act(async () => session?.play());
  expect(mockPlayer.replace).toHaveBeenLastCalledWith(cachedUri(first));
  expect(mockPlayer.play).toHaveBeenCalledTimes(2);
  expect(session?.segment).toBe('drop');
  expect(queue?.position).toBe(0);
});

test('turning auto-play off during the chime loads the drop paused', async () => {
  const renderer = await mount(true);
  const first = currentDrop();
  await ReactTestRenderer.act(async () => {
    renderer.update(<Harness autoPlay={false} />);
  });
  expect(mockPlayer.pause).toHaveBeenCalled();
  expect(mockPlayer.replace).toHaveBeenLastCalledWith(cachedUri(first));
  expect(mockPlayer.play).toHaveBeenCalledTimes(1); // only the chime
  expect(session?.segment).toBe('drop');
});

test('enables background audio + lock-screen controls, and turns background off on exit', async () => {
  const renderer = await mount(true);
  expect(mockSetAudioMode).toHaveBeenCalledWith(
    expect.objectContaining({ shouldPlayInBackground: true, interruptionMode: 'doNotMix' }),
  );
  expect(mockPlayer.setActiveForLockScreen).toHaveBeenCalledWith(true, expect.anything());

  await ReactTestRenderer.act(async () => renderer.unmount());
  expect(mockSetAudioMode).toHaveBeenLastCalledWith(
    expect.objectContaining({ shouldPlayInBackground: false }),
  );
});

describe('audio that fails to load', () => {
  test('auto-play skips a drop whose audio errors, instead of stalling', async () => {
    await mount(true);
    const first = currentDrop();
    await finish(); // chime → first drop loads
    expect(mockPlayer.replace).toHaveBeenLastCalledWith(cachedUri(first));

    await emit({ error: 'Source error: 404', isLoaded: false });
    expect(queue?.position).toBe(1);
    expect(mockPlayer.replace).toHaveBeenLastCalledWith(SOUND_EFFECTS.transitionChime);

    await finish(); // chime → second drop plays normally
    expect(mockPlayer.replace).toHaveBeenLastCalledWith(cachedUri(currentDrop()));
    expect(session?.isUnavailable).toBe(false);
  });

  test('auto-play skips a drop that never finishes loading', async () => {
    jest.useFakeTimers();
    await mount(true);
    await finish(); // chime → first drop starts loading, never reports isLoaded

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(AUDIO_LOAD_TIMEOUT_MS);
    });
    expect(queue?.position).toBe(1);
    expect(mockPlayer.replace).toHaveBeenLastCalledWith(SOUND_EFFECTS.transitionChime);
  });

  test('a drop that reports loaded in time is not skipped', async () => {
    jest.useFakeTimers();
    await mount(true);
    await finish(); // chime → first drop
    await emit({ isLoaded: true, playing: true });

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(AUDIO_LOAD_TIMEOUT_MS * 2);
    });
    expect(queue?.position).toBe(0);
  });

  test('with auto-play off the drop shows "unavailable" and can be retried', async () => {
    await mount(false);
    const first = currentDrop();
    await emit({ error: 'Source error: 404', isLoaded: false });
    expect(session?.isUnavailable).toBe(true);
    expect(queue?.position).toBe(0);

    await ReactTestRenderer.act(async () => session?.retry());
    expect(session?.isUnavailable).toBe(false);
    expect(mockPlayer.replace).toHaveBeenLastCalledWith(cachedUri(first));
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  test('when every drop fails, auto-play ends the session instead of looping', async () => {
    await mount(true);
    for (let i = 0; i < DROPS.length; i++) {
      await finish(); // chime
      await emit({ error: 'offline', isLoaded: false }); // drop fails → skip
    }
    expect(queue?.current).toBeUndefined();
    expect(session?.segment).toBe('idle');
  });
});
