module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks'],
  rules: {
    'jsx-quotes': ['error', 'prefer-single'],
    'react-hooks/exhaustive-deps': 'off',
    'no-shadow': 'off',
    'eqeqeq': 'off',
  },
};
