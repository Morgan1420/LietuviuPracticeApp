import { useEffect, useState } from 'react';
import { Difficulty, ListeningMode } from '../../types/exercises';
import { ListeningContent, loadListeningContent } from '../data/listeningContent';

/** Loads a listening set (remote → cache → bundled). null while loading. */
export const useListeningContent = <M extends ListeningMode>(
  mode: M,
  difficulty: Difficulty,
): ListeningContent<M> | null => {
  const [content, setContent] = useState<ListeningContent<M> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    loadListeningContent(mode, difficulty).then(loaded => {
      if (!cancelled) {
        setContent(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, difficulty]);

  return content;
};
