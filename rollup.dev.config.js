import { eslint } from 'rollup-plugin-eslint';
import postcss from 'rollup-plugin-postcss';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/main.js',
  external: id => /lodash|angular|jquery/.test(`^${id}`),
  plugins: [
    eslint({
      exclude: [
        'src/styles/**',
      ]
    }),
    postcss({
      extensions: [ '.css' ],
    }),
    serve('public'),
  ],
  output: {
    file: 'public/ng-float.js',
    format: 'iife',
    name: 'float',
    sourcemap: true,
    globals: {
      'angular': 'angular',
      'lodash': '_',
    },
  },
};
