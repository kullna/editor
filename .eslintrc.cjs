module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsdoc/recommended-error',
    'plugin:prettier/recommended'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['tsconfig.json']
  },
  plugins: ['prettier', '@typescript-eslint', 'jsdoc'],
  rules: {
    'prettier/prettier': 'error',
    /*
     * Being explicit about types... :thumbs-up:
     * If someone has a good argument for this being undesirable
     * and we want to reverse this decision, stripping inferable
     * types is supported by ESLint as an auto-fix, so this is
     * trivially reversable decision.
     */
    '@typescript-eslint/no-inferrable-types': ['off'],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    /*
     * Meh, keep the semi colons for consistency. ESLint will add
     * them automagically as an auto-fix, so this doesn't seem like
     * a big deal.
     */
    semi: ['error', 'always', {omitLastInOneLineBlock: false}],
    /* Be gone `\r`s. */
    'linebreak-style': ['error', 'unix'],
    'jsdoc/require-jsdoc': [
      1,
      {contexts: ['ClassDeclaration', 'ClassProperty', 'FunctionDeclaration']}
    ],
    /* Documentation FTW */
    'jsdoc/require-param': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/tag-lines': ['off'],
    'jsdoc/check-tag-names': ['off'],
    'jsdoc/require-param-type': 'off',
    'jsdoc/no-undefined-types': 'off',
    'jsdoc/require-returns-type': 'off'
  }
};
