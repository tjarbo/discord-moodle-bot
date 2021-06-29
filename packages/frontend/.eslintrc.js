module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unresolved': 'off',
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'no-alert': 'off',
    'no-plusplus': 'off',
    'max-len': ['error', {
      code: 120,
      ignoreTrailingComments: true,
      ignoreTemplateLiterals: true,
    }],
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/**/*.spec.{j,t}s?(x)',
        '**/tests/**/*.spec_.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
      rules: {
        'no-unused-expressions': 'off',
        'no-await-in-loop': 'off',
      },
    },
  ],
};
