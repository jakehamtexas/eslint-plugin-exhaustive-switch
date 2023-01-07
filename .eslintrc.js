const path = require("node:path");
const _ = require("lodash");

const tsconfigs = _.mapValues(
  {
    Lib: "./lib/tsconfig.json",
    Eslint: "./tsconfig.eslint.json",
    Scripts: "./scripts/tsconfig.json",
  },
  (partial) => path.join(__dirname, partial)
);
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:eslint-plugin/recommended",
    "plugin:node/recommended",
    "plugin:unicorn/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict",
    // This may be usable after https://github.com/microsoft/TypeScript/pull/51914
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: Object.values(tsconfigs),
  },
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": 2,
    "@typescript-eslint/consistent-type-imports": 2,
    "@typescript-eslint/consistent-type-definitions": [2, "type"],
    "@typescript-eslint/no-unused-vars": [
      2,
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "unicorn/no-array-callback-reference": 0,
  },
  overrides: [
    {
      files: "*.ts",
      rules: {
        "node/no-missing-import": 0,
      },
    },
    {
      files: "*.schema.d.ts",
      rules: {
        "@typescript-eslint/consistent-type-definitions": 0,
      },
    },
    {
      files: ["*.ts", ".eslintrc.js"],
      rules: {
        "unicorn/prefer-module": 0,
        "@typescript-eslint/no-var-requires": 0,
        "node/no-unsupported-features/es-syntax": 0,
      },
      env: {
        node: true,
      },
    },
    {
      files: [
        ".eslintrc.js",
        "jest.config.ts",
        "scripts/*",
        "*.test.ts",
        "lib/test-utils/*",
      ],
      rules: {
        "node/no-unpublished-import": 0,
        "node/no-unpublished-require": 0,
      },
    },
    {
      files: ["scripts/*"],
      rules: {
        "node/shebang": 0,
        "unicorn/prefer-top-level-await": 0,
      },
    },
  ],
};
