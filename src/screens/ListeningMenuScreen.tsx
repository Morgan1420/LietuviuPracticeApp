import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Difficulty } from '../../types/exercises';
import { RootStackScreenProps } from '../../types/navigation';
import { DifficultySelector } from '../components/DifficultySelector';
import { MenuButton } from '../components/MenuButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fontSize, spacing } from '../theme/tokens';

const DEFAULT_DIFFICULTY: Difficulty = 'medium';

export const ListeningMenuScreen: React.FC<RootStackScreenProps<'ListeningMenu'>> = ({
  navigation,
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  return (
    <ScreenContainer>
      <ScreenHeader title="Listening" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />

        <Text style={styles.sectionTitle}>Mode</Text>
        <MenuButton
          label="Dialogue"
          onPress={() => navigation.navigate('DialogueExercise', { difficulty })}
        />
        <MenuButton
          label="Numbers"
          onPress={() => navigation.navigate('NumbersExercise', { difficulty })}
        />
        <MenuButton
          label="Drops"
          caption="Passive listening"
          onPress={() => navigation.navigate('DropsExercise', { difficulty })}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
