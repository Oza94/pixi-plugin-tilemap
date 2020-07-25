import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/pixi-plugin-tilemap.cjs.js",
      format: "cjs",
    },
    {
      file: "dist/pixi-plugin-tilemap.esm.js",
      format: "esm",
    },
  ],
  plugins: [
    typescript(),
    string({
      include: ["src/**/*.vert", "src/**/*.frag"],
    }),
  ],
};
