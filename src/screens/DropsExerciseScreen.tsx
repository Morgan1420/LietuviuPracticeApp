import React, { useMemo } from 'react';
import { RootStackScreenProps } from '../../types/navigation';
import { DIFFICULTY_LABELS } from '../components/DifficultySelector';
import { DropPlayer } from '../components/DropPlayer';
import { ExerciseQueueView } from '../components/ExerciseQueueView';
import { ExerciseScreenLayout } from '../components/ExerciseScreenLayout';
import { loadDrops } from '../data/loadDrops';

export const DropsExerciseScreen: React.FC<RootStackScreenProps<'DropsExercise'>> = ({
  navigation,
  route,
}) => {
  const { difficulty } = route.params;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty];
  const result = useMemo(() => loadDrops(difficulty), [difficulty]);

  return (
    <ExerciseScreenLayout title={`Drops · ${difficultyLabel}`} onBack={navigation.goBack}>
      <ExerciseQueueView
        result={result}
        itemsLabel="drops"
        itemLabel="Drop"
        difficultyLabel={difficultyLabel}
        onBack={navigation.goBack}
        renderItem={(exercise, onNext) => <DropPlayer exercise={exercise} onNext={onNext} />}
      />
    </ExerciseScreenLayout>
  );
};
