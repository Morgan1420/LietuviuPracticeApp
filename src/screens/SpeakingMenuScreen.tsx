import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { RootStackScreenProps } from '../../types/navigation';
import { MenuButton } from '../components/MenuButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { spacing } from '../theme/tokens';

export const SpeakingMenuScreen: React.FC<RootStackScreenProps<'SpeakingMenu'>> = ({
  navigation,
}) => (
  <ScreenContainer>
    <ScreenHeader title="Speaking" onBack={navigation.goBack} />
    <ScrollView contentContainerStyle={styles.content}>
      <MenuButton
        variant="secondary"
        label="Repeat (Shadowing)"
        caption="Coming soon"
        onPress={() => navigation.navigate('RepeatPractice')}
      />
      <MenuButton
        variant="secondary"
        label="Complete Dialogue"
        caption="Coming soon"
        onPress={() => navigation.navigate('CompleteDialogue')}
      />
      <MenuButton
        variant="secondary"
        label="AI Q&A"
        caption="Coming soon"
        onPress={() => navigation.navigate('AIQA')}
      />
    </ScrollView>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
});
