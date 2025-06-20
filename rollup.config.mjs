import {nodeResolve} from "@rollup/plugin-node-resolve"
export default {
  input: "./editor.mjs",
  output: {
    name: 'feedface',
    file: "./feed-face.js",
    format: "iife"
  },
  plugins: [nodeResolve()]
}
