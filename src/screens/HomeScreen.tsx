import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RootStackScreenProps } from '../../types/navigation';
import { MenuButton } from '../components/MenuButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, spacing } from '../theme/tokens';

export const HomeScreen: React.FC<RootStackScreenProps<'Home'>> = ({ navigation }) => (
  <ScreenContainer>
    <ScrollView contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        Lietuvių kalba · A1
      </Text>

      <MenuButton label="Listening" onPress={() => navigation.navigate('ListeningMenu')} />
      <MenuButton
        variant="secondary"
        label="Listen and repeat"
        caption="Coming soon"
        onPress={() => navigation.navigate('Placeholder', { title: 'Listen and repeat' })}
      />
      <MenuButton
        variant="secondary"
        label="AI Q&A"
        caption="Coming soon"
        onPress={() => navigation.navigate('Placeholder', { title: 'AI Q&A' })}
      />

      <View style={styles.divider} />

      <MenuButton
        variant="secondary"
        label="Credits & Contribute"
        onPress={() => navigation.navigate('Placeholder', { title: 'Credits & Contribute' })}
      />
    </ScrollView>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    marginVertical: spacing.xl,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth * 2,
    marginVertical: spacing.sm,
    backgroundColor: colors.border,
  },
});
