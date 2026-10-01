import React from 'react';
import { RootStackScreenProps } from '../../../types/navigation';
import { ComingSoonView } from '../../components/ComingSoonView';

/** Speaking > Repeat (Shadowing). See RepeatExercise in types/exercises.ts. */
export const RepeatPracticeScreen: React.FC<RootStackScreenProps<'RepeatPractice'>> = ({
  navigation,
}) => (
  <ComingSoonView
    title="Repeat (Shadowing)"
    description="Listen to a phrase, then say it back after the beep."
    onBack={navigation.goBack}
  />
);
