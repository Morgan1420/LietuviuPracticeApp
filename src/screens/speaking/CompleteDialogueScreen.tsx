import React from 'react';
import { RootStackScreenProps } from '../../../types/navigation';
import { ComingSoonView } from '../../components/ComingSoonView';

/** Speaking > Complete Dialogue. See CompleteDialogueExercise in types/exercises.ts. */
export const CompleteDialogueScreen: React.FC<RootStackScreenProps<'CompleteDialogue'>> = ({
  navigation,
}) => (
  <ComingSoonView
    title="Complete Dialogue"
    description="Hear a dialogue with a missing line and say it yourself."
    onBack={navigation.goBack}
  />
);
