import { OptionIndex } from '../../types/exercises';
import { OptionState } from './OptionButton';

/**
 * After an answer is picked: the correct option turns green, a wrong pick
 * turns red, and every other option is greyed out.
 */
export const getOptionState = (
  index: OptionIndex,
  selectedIndex: OptionIndex | null,
  correctIndex: OptionIndex,
): OptionState => {
  if (selectedIndex === null) {
    return 'idle';
  }
  if (index === correctIndex) {
    return 'correct';
  }
  return index === selectedIndex ? 'incorrect' : 'inactive';
};
