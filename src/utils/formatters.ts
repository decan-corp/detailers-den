export const getInitials = (value: string) => {
  const words = value.split(/\s+/).filter((word) => word.length > 0);

  const initials = words.map((word) => word.charAt(0)).join('');

  return initials.toUpperCase();
};
