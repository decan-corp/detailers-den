export const formatAmount = (value: string | number, options?: Intl.NumberFormatOptions) => {
  // Convert the value to a number with two decimal places
  const formattedNumber = Number(value).toFixed(2);

  // Use Intl.NumberFormat for formatting with locale and additional options
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    ...options,
  } satisfies Intl.NumberFormatOptions).format(Number(formattedNumber));
};

export const formatInputAmount = (value: string | number, options?: Intl.NumberFormatOptions) => {
  const formattedString = String(value).replaceAll(',', '');
  // Convert the value to a number with two decimal places
  const formattedNumber = Number(formattedString).toFixed(2);

  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  const formatOptions = { ...defaultOptions, ...options };

  // Use Intl.NumberFormat for formatting with locale and merged options
  return new Intl.NumberFormat('en-US', formatOptions).format(Number(formattedNumber));
};
