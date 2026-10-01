import React from 'react';
import ReactTestRenderer, { ReactTestRenderer as Renderer } from 'react-test-renderer';
import { AUDIO_LOAD_TIMEOUT_MS } from '../src/audio/audioTimeouts';
import { AudioLoadWatchdog, useAudioLoadWatchdog } from '../src/hooks/useAudioLoadWatchdog';

interface ProbeProps {
  hasSource: boolean;
  isLoaded: boolean;
  error: string | null;
}

let watchdog: AudioLoadWatchdog | undefined;

const Probe: React.FC<ProbeProps> = props => {
  watchdog = useAudioLoadWatchdog({ label: 'clip.mp3', ...props });
  return null;
};

const mount = (props: ProbeProps): Renderer => {
  let renderer: Renderer | undefined;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Probe {...props} />);
  });
  if (!renderer) {
    throw new Error('Probe did not render');
  }
  return renderer;
};

const LOADING: ProbeProps = { hasSource: true, isLoaded: false, error: null };

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('a native error marks the clip unavailable immediately', () => {
  const renderer = mount(LOADING);
  ReactTestRenderer.act(() => renderer.update(<Probe {...LOADING} error="Source error" />));
  expect(watchdog?.failed).toBe(true);
  ReactTestRenderer.act(() => renderer.unmount());
});

test('a clip that never loads is marked unavailable after the timeout', () => {
  const renderer = mount(LOADING);
  ReactTestRenderer.act(() => jest.advanceTimersByTime(AUDIO_LOAD_TIMEOUT_MS - 1));
  expect(watchdog?.failed).toBe(false);
  ReactTestRenderer.act(() => jest.advanceTimersByTime(1));
  expect(watchdog?.failed).toBe(true);
  ReactTestRenderer.act(() => renderer.unmount());
});

test('loading in time, or having no source yet, never fails', () => {
  const renderer = mount({ ...LOADING, hasSource: false });
  ReactTestRenderer.act(() => jest.advanceTimersByTime(AUDIO_LOAD_TIMEOUT_MS * 2));
  expect(watchdog?.failed).toBe(false);

  ReactTestRenderer.act(() => renderer.update(<Probe {...LOADING} />));
  ReactTestRenderer.act(() => jest.advanceTimersByTime(1000));
  ReactTestRenderer.act(() => renderer.update(<Probe {...LOADING} isLoaded />));
  ReactTestRenderer.act(() => jest.advanceTimersByTime(AUDIO_LOAD_TIMEOUT_MS * 2));
  expect(watchdog?.failed).toBe(false);
  ReactTestRenderer.act(() => renderer.unmount());
});

test('reset clears the failure and starts a fresh timeout', () => {
  const renderer = mount(LOADING);
  ReactTestRenderer.act(() => jest.advanceTimersByTime(AUDIO_LOAD_TIMEOUT_MS));
  expect(watchdog?.failed).toBe(true);

  ReactTestRenderer.act(() => watchdog?.reset());
  expect(watchdog?.failed).toBe(false);
  ReactTestRenderer.act(() => jest.advanceTimersByTime(AUDIO_LOAD_TIMEOUT_MS));
  expect(watchdog?.failed).toBe(true);
  ReactTestRenderer.act(() => renderer.unmount());
});
