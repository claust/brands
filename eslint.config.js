import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import oxlint from 'eslint-plugin-oxlint'

export default [
  // Base config for all files
  {
    languageOptions: {
      globals: {
        // Browser globals
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        Image: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        // SVG DOM types
        SVGSVGElement: 'readonly',
        SVGGElement: 'readonly',
        // Node globals
        process: 'readonly',
        // Deno globals
        Deno: 'readonly',
        Request: 'readonly',
        Response: 'readonly'
      }
    }
  },

  js.configs.recommended,
  
  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }]
    }
  },

  // Vue files
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: typescriptParser,
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'vue/multi-word-component-names': ['error', {
        ignores: ['Button', 'Card', 'Dashboard']
      }]
    }
  },

  // oxlint should be last to disable conflicting rules
  ...oxlint.configs['flat/recommended']
]