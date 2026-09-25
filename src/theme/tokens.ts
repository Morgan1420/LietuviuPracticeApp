export const colors = {
  background: '#F6F7FB',
  surface: '#FFFFFF',
  border: '#DADDE6',
  text: '#1D2433',
  textMuted: '#5E6678',
  primary: '#2F5DDB',
  primaryText: '#FFFFFF',
  correct: '#1E9E5A',
  correctSurface: '#E3F6EC',
  incorrect: '#D14343',
  incorrectSurface: '#FBE6E6',
  disabledSurface: '#ECEEF3',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  md: 10,
  lg: 16,
} as const;

export const fontSize = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
} as const;

/** Minimum height for audio / answer buttons (large touch targets). */
export const touchTarget = 56;
