import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackScreenProps } from '../../types/navigation';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fontSize, spacing } from '../theme/tokens';

export const PlaceholderScreen: React.FC<RootStackScreenProps<'Placeholder'>> = ({
  navigation,
  route,
}) => (
  <ScreenContainer>
    <ScreenHeader title={route.params.title} onBack={navigation.goBack} />
    <View style={styles.body}>
      <Text style={styles.heading}>Coming soon</Text>
      <Text style={styles.message}>This section is not available yet.</Text>
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
