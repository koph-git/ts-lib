// build.js
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/reactive.ts"],
  outfile: "dist/reactive.js",
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  format: "esm",
  external: ["react", "react-dom"]
}).catch(() => process.exit(1));
