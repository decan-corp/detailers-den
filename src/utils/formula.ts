export const getIncreaseInPercentage = (previousValue: number, currentValue: number) => {
  if (previousValue === 0) return '0';

  const result = ((currentValue - previousValue) / previousValue) * 100;

  return result > 0 ? `+${result.toFixed(2)}` : result.toFixed(2);
};
