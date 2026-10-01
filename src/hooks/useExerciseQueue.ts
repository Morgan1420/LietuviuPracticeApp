import { useCallback, useState } from 'react';
import { shuffle } from '../utils/shuffle';

export interface ExerciseQueue<T> {
  current: T | undefined;
  /** The item after `current`, if any. */
  upcoming: T | undefined;
  /** 0-based position of `current`; equals `total` once the queue is finished. */
  position: number;
  total: number;
  advance: () => void;
  /** Starts again with a freshly shuffled order. */
  restart: () => void;
}

/**
 * Serves exercises in a random order that is reshuffled on every load and
 * restart — including when `items` arrives later (async remote content).
 */
export const useExerciseQueue = <T>(items: readonly T[]): ExerciseQueue<T> => {
  const [source, setSource] = useState<readonly T[]>(items);
  const [order, setOrder] = useState<T[]>(() => shuffle(items));
  const [position, setPosition] = useState<number>(0);

  // New item list → new shuffled queue (state adjusted during render, React's
  // recommended alternative to an effect for derived resets).
  if (source !== items) {
    setSource(items);
    setOrder(shuffle(items));
    setPosition(0);
  }

  const advance = useCallback((): void => setPosition(p => p + 1), []);

  const restart = useCallback((): void => {
    setOrder(shuffle(items));
    setPosition(0);
  }, [items]);

  return {
    current: position < order.length ? order[position] : undefined,
    upcoming: position + 1 < order.length ? order[position + 1] : undefined,
    position,
    total: order.length,
    advance,
    restart,
  };
};
