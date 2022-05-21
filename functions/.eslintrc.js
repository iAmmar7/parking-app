module.exports = {
  root: true,
  env: {
    es2017: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    'quotes': ['error', 'single'],
    'max-len': ['error', { code: 120 }],
    'object-curly-spacing': ['error', 'always'],
  },
};
