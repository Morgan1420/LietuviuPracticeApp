import React from 'react';
import { RootStackScreenProps } from '../../../types/navigation';
import { ComingSoonView } from '../../components/ComingSoonView';

/** Speaking > AI Q&A. See QAExercise in types/exercises.ts. */
export const AIQAScreen: React.FC<RootStackScreenProps<'AIQA'>> = ({ navigation }) => (
  <ComingSoonView
    title="AI Q&A"
    description="Answer spoken questions in Lithuanian and get feedback."
    onBack={navigation.goBack}
  />
);
