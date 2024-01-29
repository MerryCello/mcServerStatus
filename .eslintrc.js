module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'jsx-quotes': ['error', 'prefer-single'],
    'react-hooks/exhaustive-deps': 'off',
    'no-shadow': 'off',
    'eqeqeq': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
