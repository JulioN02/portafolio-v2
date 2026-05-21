module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y'],
  rules: {
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
  },
};
