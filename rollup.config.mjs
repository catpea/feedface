import {nodeResolve} from "@rollup/plugin-node-resolve"
export default {
  input: "./editor.mjs",
  output: {
    name: 'feedface',
    file: "./feedface.bundle.js",
    format: "iife"
  },
  plugins: [nodeResolve()]
}
