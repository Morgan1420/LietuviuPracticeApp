import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fontSize, spacing, touchTarget } from '../theme/tokens';

interface AutoPlayToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const AutoPlayToggle: React.FC<AutoPlayToggleProps> = ({ value, onChange }) => (
  <View style={styles.row}>
    <Text style={styles.label}>Auto-play drops in sequence</Text>
    <Switch
      accessibilityLabel="Auto-play drops in sequence"
      value={value}
      onValueChange={onChange}
      trackColor={{ true: colors.primary, false: colors.border }}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
});
