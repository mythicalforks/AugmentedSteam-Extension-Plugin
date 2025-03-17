import pluginJs from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  globalIgnores(['.millennium/', '.venv/', 'AugmentedSteam/']),
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*config.mjs', 'helpers/clean-maps.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unsafe-function-type': 'off',
    }
  }
);