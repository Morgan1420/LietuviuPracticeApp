import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Difficulty } from './exercises';

export type RootStackParamList = {
  Home: undefined;
  // Listening module
  ListeningMenu: undefined;
  DialogueExercise: { difficulty: Difficulty };
  NumbersExercise: { difficulty: Difficulty };
  DropsExercise: { difficulty: Difficulty };
  // Speaking module (coming soon)
  SpeakingMenu: undefined;
  RepeatPractice: undefined;
  CompleteDialogue: undefined;
  AIQA: undefined;
  // Other
  Placeholder: { title: string };
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  RouteName
>;
