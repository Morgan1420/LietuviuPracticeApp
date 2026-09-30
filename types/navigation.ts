import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Difficulty } from './exercises';

export type RootStackParamList = {
  Home: undefined;
  ListeningMenu: undefined;
  DialogueExercise: { difficulty: Difficulty };
  NumbersExercise: { difficulty: Difficulty };
  DropsExercise: { difficulty: Difficulty };
  Placeholder: { title: string };
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  RouteName
>;
