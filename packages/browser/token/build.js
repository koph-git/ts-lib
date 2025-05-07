// build.js
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/token.ts"],
  outfile: "dist/token.js",
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  format: "esm"
}).catch(() => process.exit(1));
