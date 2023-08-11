import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kullna-editor.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: true,
            inlineSources: true
          }
        }
      }),
      babel({
        extensions: ['.ts'],
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        inputSourceMap: true,
        sourceMaps: 'both'
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/kullna-editor.min.js',
      format: 'umd',
      name: 'KullnaEditor',
      indent: false,
      banner:
        '/* Kullna Editor - A small but feature-rich code editor for the web\n   Copyright (C) 2022-2023 The Kullna Programming Language Project\n      \n   This program is free software: you can redistribute it and/or modify\n   it under the terms of the GNU Lesser General Public License as published by\n   the Free Software Foundation, either version 3 of the License, or\n   (at your option) any later version.\n   \n   This program is distributed in the hope that it will be useful,\n   but WITHOUT ANY WARRANTY; without even the implied warranty of\n   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n   GNU General Public License for more details.\n   \n   You should have received a copy of the GNU Lesser General Public License\n   along with this program.  If not, see <https://www.gnu.org/licenses/>. */'
    },
    plugins: [
      typescript(),
      babel({
        extensions: ['.ts'],
        exclude: 'node_modules/**',
        babelHelpers: 'bundled'
      }),
      terser()
    ]
  }
];
