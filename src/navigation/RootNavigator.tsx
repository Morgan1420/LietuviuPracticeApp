import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { DialogueExerciseScreen } from '../screens/DialogueExerciseScreen';
import { DropsExerciseScreen } from '../screens/DropsExerciseScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ListeningMenuScreen } from '../screens/ListeningMenuScreen';
import { NumbersExerciseScreen } from '../screens/NumbersExerciseScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { SpeakingMenuScreen } from '../screens/SpeakingMenuScreen';
import { AIQAScreen } from '../screens/speaking/AIQAScreen';
import { CompleteDialogueScreen } from '../screens/speaking/CompleteDialogueScreen';
import { RepeatPracticeScreen } from '../screens/speaking/RepeatPracticeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screens render their own header (ScreenHeader), so the native one is hidden.
export const RootNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="ListeningMenu" component={ListeningMenuScreen} />
    <Stack.Screen name="DialogueExercise" component={DialogueExerciseScreen} />
    <Stack.Screen name="NumbersExercise" component={NumbersExerciseScreen} />
    <Stack.Screen name="DropsExercise" component={DropsExerciseScreen} />
    <Stack.Screen name="SpeakingMenu" component={SpeakingMenuScreen} />
    <Stack.Screen name="RepeatPractice" component={RepeatPracticeScreen} />
    <Stack.Screen name="CompleteDialogue" component={CompleteDialogueScreen} />
    <Stack.Screen name="AIQA" component={AIQAScreen} />
    <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
  </Stack.Navigator>
);
