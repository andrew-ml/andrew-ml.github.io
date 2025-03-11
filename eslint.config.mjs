import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['build', 'vite.config.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      // "prettier",
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: false,
        },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      // TODO: need to fix and remove later
      "no-empty-pattern": "warn",
      "no-empty": "warn",
      "react/no-unescaped-entities": "off",
      "no-case-declarations": "off",
      "react/jsx-no-target-blank": "off",
      "no-useless-escape": "warn",
    },
  },
]
