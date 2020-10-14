import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';

import { browser, main, module } from './package.json';

export default {
  input: 'src/main.js',
  external: id => /lodash|angular|jquery/.test(`^${id}`),
  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true,
      exclude: [
        'src/styles/**',
      ]
    }),
    babel(),
    terser(),
    postcss({
      extensions: [ '.css' ],
      plugins: [ cssnano() ],
    }),
  ],
  output: [
    {
      file: module,
      format: 'module'
    },
    {
      file: browser,
      format: 'umd',
      name: 'float',
      globals: {
        'angular': 'angular',
        'lodash': '_',
      }
    },
    {
      file: main,
      format: 'cjs',
      exports: 'default'
    },
  ],
};
