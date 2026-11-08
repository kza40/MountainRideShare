const js = require('@eslint/js')
const globals = require('globals')
const prettier = require('eslint-config-prettier')

module.exports = [
    { ignores: ['node_modules/'] },
    js.configs.recommended,
    {
        files: ['server/**/*.js', 'eslint.config.js'],
        languageOptions: { sourceType: 'commonjs', globals: globals.node },
    },
    {
        files: ['public/**/*.js'],
        languageOptions: {
            sourceType: 'script',
            globals: { ...globals.browser, google: 'readonly' },
        },
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
    {
        rules: {
            eqeqeq: 'error',
            'prefer-const': 'error',
        },
    },
    prettier,
]
