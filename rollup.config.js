import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
export default {
  input: "src/index.js",
  output: {
    dir: "./dist/",
    format: "iife",
    name: "InputIO",
    sourcemap: true,
    compact: true,
  },
  plugins: [terser(), babel({ babelHelpers: "bundled" })],
};
