/**
 * @format
 */

import React from 'react';
import { Text, TextInput } from 'react-native';
import ReactTestRenderer, { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import App from '../App';
import { Difficulty } from '../types/exercises';
import { loadDialogues } from '../src/data/loadDialogues';
import { loadNumbers } from '../src/data/loadNumbers';
import { loadDrops } from '../src/data/loadDrops';

// The real SafeAreaProvider renders nothing until native insets arrive.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// Caching is covered in audioCache.test.ts; here audio plays from the remote URL.
jest.mock('../src/audio/audioCache', () => ({
  getCachedAudioUri: (url: string) => Promise.resolve(url),
  peekCachedAudioUri: (url: string) => url,
  prefetchAudio: jest.fn(),
}));

jest.mock('expo-audio', () => {
  const { useRef } = require('react');
  const STATUS = { isLoaded: true, playing: false, duration: 65, currentTime: 12, didJustFinish: false };
  const makePlayer = () => ({
    currentStatus: STATUS,
    addListener: () => ({ remove: () => undefined }),
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    setPlaybackRate: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    updateLockScreenMetadata: jest.fn(),
  });
  return {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    // One stable player per component, like the real hook.
    useAudioPlayer: () => {
      const player = useRef(null);
      if (player.current === null) {
        player.current = makePlayer();
      }
      return player.current;
    },
  };
});

const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

const textOf = (node: ReactTestInstance): string =>
  node.children.map(child => (typeof child === 'string' ? child : textOf(child))).join('');

const hasText = (renderer: Renderer, text: string): boolean =>
  renderer.root.findAllByType(Text).some(node => textOf(node) === text);

const findPressable = (renderer: Renderer, label: string): ReactTestInstance | undefined =>
  renderer.root.findAll(
    node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  )[0];

const press = async (renderer: Renderer, label: string): Promise<void> => {
  const button = findPressable(renderer, label);
  if (!button) {
    throw new Error(`No pressable labelled "${label}"`);
  }
  await ReactTestRenderer.act(async () => {
    button.props.onPress();
  });
};

const renderApp = async (): Promise<Renderer> => {
  let renderer: Renderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  if (!renderer) {
    throw new Error('App did not render');
  }
  return renderer;
};

const openMode = async (mode: string, difficulty: Difficulty): Promise<Renderer> => {
  const renderer = await renderApp();
  await press(renderer, 'Listening');
  await press(renderer, DIFFICULTY_LABEL[difficulty]);
  await press(renderer, mode);
  return renderer;
};

/** Id of the Numbers item currently on screen (order is random). */
const currentNumberId = (renderer: Renderer): string => {
  const card = renderer.root.find(
    node => typeof node.props.testID === 'string' && node.props.testID.startsWith('number-exercise-'),
  );
  return String(card.props.testID).replace('number-exercise-', '');
};

const typeAnswer = async (renderer: Renderer, value: string): Promise<void> => {
  const input = renderer.root.findByType(TextInput);
  await ReactTestRenderer.act(async () => {
    input.props.onChangeText(value);
  });
  await press(renderer, 'Check');
};

test('Home and Listening menu defaults', async () => {
  const renderer = await renderApp();
  expect(hasText(renderer, 'Lietuvių kalba · A1')).toBe(true);

  await press(renderer, 'Listening');
  const medium = renderer.root.findAll(
    node => node.props.accessibilityLabel === 'Medium' && node.props.accessibilityRole === 'radio',
  )[0];
  expect(medium.props.accessibilityState).toEqual({ selected: true });
});

test('Dialogue mode opens with the selected difficulty', async () => {
  const difficulty = (['easy', 'medium', 'hard'] as const).find(d => {
    const result = loadDialogues(d);
    return result.ok && result.exercises.length > 0;
  });
  if (!difficulty) {
    throw new Error('No dialogue content in any difficulty');
  }
  const result = loadDialogues(difficulty);
  const titles = result.ok ? result.exercises.map(e => e.title) : [];

  const renderer = await openMode('Dialogue', difficulty);
  expect(hasText(renderer, `Dialogue · ${DIFFICULTY_LABEL[difficulty]}`)).toBe(true);
  expect(titles.some(title => hasText(renderer, title))).toBe(true);
});

test('Numbers easy is multiple choice (no text input)', async () => {
  const renderer = await openMode('Numbers', 'easy');
  expect(hasText(renderer, 'Numbers · Easy')).toBe(true);
  expect(renderer.root.findAllByType(TextInput)).toHaveLength(0);

  const result = loadNumbers('easy');
  const exercise = result.ok ? result.exercises.find(e => e.id === currentNumberId(renderer)) : undefined;
  if (!exercise?.choices) {
    throw new Error('Easy number item without choices');
  }
  for (const option of exercise.choices.options) {
    expect(findPressable(renderer, option)).toBeDefined();
  }

  await press(renderer, exercise.choices.options[exercise.choices.correctOptionIndex]);
  expect(hasText(renderer, 'Teisingai! Correct!')).toBe(true);
  expect(hasText(renderer, '✓ 1')).toBe(true);
});

test.each(['medium', 'hard'] as const)('Numbers %s uses typed input and checks digits', async difficulty => {
  const renderer = await openMode('Numbers', difficulty);
  expect(renderer.root.findAllByType(TextInput)).toHaveLength(1);

  const result = loadNumbers(difficulty);
  const exercise = result.ok ? result.exercises.find(e => e.id === currentNumberId(renderer)) : undefined;
  if (!exercise) {
    throw new Error('Current number item not found in data');
  }

  // Punctuation and spaces are ignored: only the digits must match.
  await typeAnswer(renderer, exercise.answer.replace(/\D/g, ''));
  expect(hasText(renderer, 'Teisingai! Correct!')).toBe(true);

  await press(renderer, 'Next');
  await typeAnswer(renderer, '0');
  expect(hasText(renderer, 'Not quite.')).toBe(true);
  expect(hasText(renderer, '✓ 1')).toBe(true);
  expect(hasText(renderer, '✗ 1')).toBe(true);
});

test('Drops shows the Lithuanian transcript, English on demand, and the timer', async () => {
  const renderer = await openMode('Drops', 'hard');
  expect(hasText(renderer, 'Drops · Hard')).toBe(true);

  const result = loadDrops('hard');
  const drop = result.ok ? result.exercises.find(e => hasText(renderer, e.title)) : undefined;
  if (!drop) {
    throw new Error('Current drop not found in data');
  }
  expect(hasText(renderer, drop.lines[0].lt)).toBe(true);
  expect(hasText(renderer, drop.lines[0].en)).toBe(false);

  // Auto-play starts with the chime; Play skips straight to the drop.
  expect(hasText(renderer, '🔔 Starting…')).toBe(true);
  await press(renderer, '▶ Play');
  expect(hasText(renderer, '🔔 Starting…')).toBe(false);
  expect(hasText(renderer, '0:12')).toBe(true);
  expect(hasText(renderer, '1:05')).toBe(true);

  const toggle = renderer.root.findAll(
    node => node.props.accessibilityRole === 'switch' && typeof node.props.onPress === 'function',
  )[0];
  await ReactTestRenderer.act(async () => {
    toggle.props.onPress();
  });
  expect(hasText(renderer, drop.lines[0].en)).toBe(true);
});

test('unimplemented modes open the placeholder screen', async () => {
  const renderer = await renderApp();
  await press(renderer, 'AI Q&A');
  expect(hasText(renderer, 'Coming soon')).toBe(true);
});
