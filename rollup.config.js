import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  plugins: [commonjs(), json(), nodeResolve({ extensions: ['.ts'] }), typescript()],
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    inlineDynamicImports: true,
  },
  external: ['globals'],
};
