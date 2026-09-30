import React, { useMemo, useState } from 'react';
import { RootStackScreenProps } from '../../types/navigation';
import { AutoPlayToggle } from '../components/AutoPlayToggle';
import { DIFFICULTY_LABELS } from '../components/DifficultySelector';
import { DropPlayer } from '../components/DropPlayer';
import { ExerciseQueueView } from '../components/ExerciseQueueView';
import { ExerciseScreenLayout } from '../components/ExerciseScreenLayout';
import { loadDrops } from '../data/loadDrops';
import { loadedExercises } from '../data/loadExercises';
import { useDropSession } from '../hooks/useDropSession';
import { useExerciseQueue } from '../hooks/useExerciseQueue';

export const DropsExerciseScreen: React.FC<RootStackScreenProps<'DropsExercise'>> = ({
  navigation,
  route,
}) => {
  const { difficulty } = route.params;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty];
  const result = useMemo(() => loadDrops(difficulty), [difficulty]);
  const queue = useExerciseQueue(loadedExercises(result));
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  // Lives at screen level (not per drop) so playback continues across drops,
  // with the screen locked, or with the app in the background.
  const session = useDropSession({
    current: queue.current,
    upcoming: queue.upcoming,
    autoPlay,
    onAdvance: queue.advance,
  });

  return (
    <ExerciseScreenLayout title={`Drops · ${difficultyLabel}`} onBack={navigation.goBack}>
      <AutoPlayToggle value={autoPlay} onChange={setAutoPlay} />
      <ExerciseQueueView
        result={result}
        queue={queue}
        itemsLabel="drops"
        itemLabel="Drop"
        difficultyLabel={difficultyLabel}
        onBack={navigation.goBack}
        renderItem={(exercise, onNext) => (
          <DropPlayer exercise={exercise} session={session} onNext={onNext} />
        )}
      />
    </ExerciseScreenLayout>
  );
};
