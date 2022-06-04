module.exports = {
  root: true,
  env: {
    es2017: true,
    node: true,
  },
  extends: ['eslint:recommended', 'google', 'prettier'],
  plugins: ['prettier'],
  parser: {
    ecmaVersion: 2018,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        tabWidth: 2,
        jsxSingleQuote: true,
        trailingComma: 'all',
        singleQuote: true,
      },
    ],
    quotes: ['error', 'single', { avoidEscape: true }],
    'max-len': ['error', { code: 120 }],
    'object-curly-spacing': ['error', 'always'],
  },
};
