/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  // Lint our own source only - not vendored docs, build output, or generated bundles.
  ignorePatterns: [
    'Design/',
    'dist/',
    'dist-app/',
    'release/',
    'release-tool/',
    'Fork/',
    'release-work/',
    'coverage/',
    'public/',
    '*.min.js'
  ],
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  overrides: [
    {
      files: [
        'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
      ],
      'extends': [
        'plugin:cypress/recommended'
      ]
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/no-mutating-props': 'off'
  }
}
