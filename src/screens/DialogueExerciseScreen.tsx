import React from 'react';
import { RootStackScreenProps } from '../../types/navigation';
import { DialoguePlayer } from '../components/DialoguePlayer';
import { DIFFICULTY_LABELS } from '../components/DifficultySelector';
import { ExerciseQueueView } from '../components/ExerciseQueueView';
import { ExerciseScreenLayout } from '../components/ExerciseScreenLayout';
import { loadedExercises } from '../data/loadExercises';
import { useExerciseQueue } from '../hooks/useExerciseQueue';
import { useListeningContent } from '../hooks/useListeningContent';

export const DialogueExerciseScreen: React.FC<RootStackScreenProps<'DialogueExercise'>> = ({
  navigation,
  route,
}) => {
  const { difficulty } = route.params;
  const difficultyLabel = DIFFICULTY_LABELS[difficulty];
  const result = useListeningContent('dialogues', difficulty);
  const queue = useExerciseQueue(loadedExercises(result));

  return (
    <ExerciseScreenLayout title={`Dialogues · ${difficultyLabel}`} onBack={navigation.goBack}>
      <ExerciseQueueView
        result={result}
        queue={queue}
        itemsLabel="dialogues"
        itemLabel="Dialogue"
        difficultyLabel={difficultyLabel}
        onBack={navigation.goBack}
        renderItem={(exercise, onNext) => (
          <DialoguePlayer exercise={exercise} onComplete={onNext} />
        )}
      />
    </ExerciseScreenLayout>
  );
};
