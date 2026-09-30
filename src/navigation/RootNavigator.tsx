import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { DialogueExerciseScreen } from '../screens/DialogueExerciseScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ListeningMenuScreen } from '../screens/ListeningMenuScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screens render their own header (ScreenHeader), so the native one is hidden.
export const RootNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="ListeningMenu" component={ListeningMenuScreen} />
    <Stack.Screen name="DialogueExercise" component={DialogueExerciseScreen} />
    <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
  </Stack.Navigator>
);
