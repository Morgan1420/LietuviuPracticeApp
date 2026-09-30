/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { ReactTestInstance, ReactTestRenderer as Renderer } from 'react-test-renderer';
import App from '../App';
import easyDialogues from '../assets/data/listening/dialogues/easy_dialogues.json';

// The real SafeAreaProvider renders nothing until native insets arrive.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    setPlaybackRate: jest.fn(),
  })),
  useAudioPlayerStatus: jest.fn(() => ({
    isLoaded: true,
    playing: false,
    duration: 10,
    currentTime: 0,
  })),
}));

const textOf = (node: ReactTestInstance): string =>
  node.children.map(child => (typeof child === 'string' ? child : textOf(child))).join('');

const hasText = (renderer: Renderer, text: string): boolean =>
  renderer.root.findAllByType(Text).some(node => textOf(node) === text);

const press = async (renderer: Renderer, label: string): Promise<void> => {
  const [button] = renderer.root.findAll(
    node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  );
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

test('navigates Home -> Listening menu -> Dialogue with the selected difficulty', async () => {
  const renderer = await renderApp();
  expect(hasText(renderer, 'Lietuvių kalba · A1')).toBe(true);

  await press(renderer, 'Listening');
  const medium = renderer.root.findAll(
    node => node.props.accessibilityLabel === 'Medium' && node.props.accessibilityRole === 'radio',
  )[0];
  expect(medium.props.accessibilityState).toEqual({ selected: true });

  await press(renderer, 'Easy');
  await press(renderer, 'Dialogue');
  expect(hasText(renderer, 'Dialogue · Easy')).toBe(true);
  expect(hasText(renderer, easyDialogues[0].title)).toBe(true);
});

test('medium difficulty (default) shows the empty state until content exists', async () => {
  const renderer = await renderApp();
  await press(renderer, 'Listening');
  await press(renderer, 'Dialogue');
  expect(hasText(renderer, 'Dialogue · Medium')).toBe(true);
  expect(hasText(renderer, 'No medium dialogues yet. Try another difficulty.')).toBe(true);
});

test('unimplemented modes open the placeholder screen', async () => {
  const renderer = await renderApp();
  await press(renderer, 'AI Q&A');
  expect(hasText(renderer, 'Coming soon')).toBe(true);
});
