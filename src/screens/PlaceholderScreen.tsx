import React from 'react';
import { RootStackScreenProps } from '../../types/navigation';
import { ComingSoonView } from '../components/ComingSoonView';

export const PlaceholderScreen: React.FC<RootStackScreenProps<'Placeholder'>> = ({
  navigation,
  route,
}) => <ComingSoonView title={route.params.title} onBack={navigation.goBack} />;
