import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  plugins: [
    commonjs(),
    json(),
    nodeResolve({ extensions: ['.ts'] }),
    resolveFunkyNodeImports(),
    typescript(),
  ],
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    inlineDynamicImports: true,
  },
  external: ['builtins', 'globals'],
};

function resolveFunkyNodeImports() {
  return {
    resolveId(importee) {
      if (importee.startsWith('node:')) {
        return { id: importee.slice('node:'.length), external: true };
      }
      return null;
    },
  };
}
