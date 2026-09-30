/** Reduces a number answer to its digits so "12,50 €", "12.50" and "1250" all match. */
export const normalizeNumber = (value: string): string => value.replace(/\D/g, '');

export const isSameNumber = (a: string, b: string): boolean => {
  const digits = normalizeNumber(a);
  return digits.length > 0 && digits === normalizeNumber(b);
};
