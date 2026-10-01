import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme/tokens';
import { ScreenContainer } from './ScreenContainer';
import { ScreenHeader } from './ScreenHeader';

interface ComingSoonViewProps {
  title: string;
  onBack: () => void;
  /** What the mode will do, shown under "Coming soon". */
  description?: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ title, onBack, description }) => (
  <ScreenContainer>
    <ScreenHeader title={title} onBack={onBack} />
    <View style={styles.body}>
      <Text style={styles.heading}>Coming soon</Text>
      <Text style={styles.message}>{description ?? 'This section is not available yet.'}</Text>
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
