module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier',
    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended'
  ],
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': ['error']
      }
    }
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    'comma-style': ['error', 'last'], // requires a comma after and on the same line as an array element, object property, or variable declaration
    'comma-dangle': ['error', 'never'], // disallow trailing commas
    'no-use-before-define': [
      // warns when it encounters a reference to an identifier that has not yet been declared.
      'error',
      {
        functions: true,
        classes: true,
        variables: false
      }
    ],
    'arrow-return-shorthand': 0,
    'max-len': ['error', { code: 150 }],
    semi: ['error', 'always'],
    indent: ['error', 2, { SwitchCase: 1 }],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/prefer-default-export': 'off',
    'prettier/prettier': 'error'
  }
};
