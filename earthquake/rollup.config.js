import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.ts",
  output: {
    chunkFileNames: "chunks/[name]-[hash].js",
    dir: "public",
    format: "es"
  },
  plugins: [
    del({ targets: "public/chunks", runOnce: true, verbose: true }),
    typescript(),
    resolve(),
    commonjs(),
    production && terser()
  ],
  preserveEntrySignatures: false,
  // external: ['moment']
};
