export const passwordRegex = /^(?=(?:.*[a-zA-Z]){1})(?=(?:.*[0-9]){2})(?=(?:.*[\W_]){2}).{8,}$/;

export const INVALID_PASSWORD_FORMAT =
  'Password must be at least 8 characters long and include at least 2 numeric characters, 2 special characters, and at least one alphabetic character.';
