import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import sortKeysFix from "eslint-plugin-sort-keys-fix";

export default defineConfig([
  {
    extends: ["js/recommended"],
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Phaser: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      js,
      "sort-keys-fix": sortKeysFix,
    },
    rules: {
      indent: ["error", 2],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "sort-keys-fix/sort-keys-fix": "error",
    },
  },
]);
