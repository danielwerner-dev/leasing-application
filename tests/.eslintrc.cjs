module.exports = {
  plugins: ['jest'],
  env: {
    node: true,
    jest: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    camelcase: 'off'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tests/tsconfig.json'
  }
};
