import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';

interface ComingSoonCardProps {
  title: string;
  description: string;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ title, description }) => (
  <View accessibilityState={{ disabled: true }} style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    <Text style={styles.badge}>Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.disabledSurface,
    opacity: 0.7,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textMuted,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
