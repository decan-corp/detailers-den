import { clamp } from 'lodash';

export const getIncreaseInPercentage = (previousValue: number, currentValue: number) => {
  if (previousValue === 0) return '0';

  const result = ((currentValue - previousValue) / previousValue) * 100;

  return result > 0 ? `+${result.toFixed(2)}` : result.toFixed(2);
};

export const getComputedCutPercentage = (params: {
  serviceCutPercentage: number;
  numberOfCrews: number;
}) => clamp(params.serviceCutPercentage / params.numberOfCrews, 0, 100);

export const computeCrewEarnedAmount = (params: {
  serviceCutPercentage: number;
  numberOfCrews: number;
  servicePrice: number;
}) => {
  const computedServiceCutPercentage = getComputedCutPercentage(params);

  const amount = (computedServiceCutPercentage / 100) * params.servicePrice;

  return {
    computedServiceCutPercentage,
    amount,
  };
};
