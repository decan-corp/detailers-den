/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['@/**/*.ts', '@/**/*.tsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off',
        'react/prop-types': 'off',
      },
    },
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'prettier',
  ],
  rules: {
    'no-prototype-builtins': 'off',
    'class-methods-use-this': 'off',
    'linebreak-style': 'off',
    'no-undef': 'off',
    'no-void': 'off',
    'no-console': 'error',
    'prefer-default-export': 'off',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/order': [
      'error',
      {
        groups: ['index', 'internal', 'sibling', 'parent', 'external', 'builtin', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/extensions': [
      'error',
      'never',
      {
        mjs: 'ignorePackages',
      },
    ],
    'react-hooks/exhaustive-deps': [
      'error',
      { enableDangerousAutofixThisMayCauseInfiniteLoops: true },
    ],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['interface', 'typeAlias', 'enum', 'class', 'typeParameter'],
        format: ['PascalCase'],
      },
    ],
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': [
      'error',
      {
        fixToUnknown: true,
      },
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    'jsx-a11y/label-has-associated-control': 'off',
  },
};
