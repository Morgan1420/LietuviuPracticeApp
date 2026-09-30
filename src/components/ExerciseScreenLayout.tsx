import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';
import { ScreenContainer } from './ScreenContainer';
import { ScreenHeader } from './ScreenHeader';

interface ExerciseScreenLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const ExerciseScreenLayout: React.FC<ExerciseScreenLayoutProps> = ({
  title,
  onBack,
  children,
}) => (
  <ScreenContainer>
    <ScreenHeader title={title} onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
});
