# eslint-plugin-exhaustive-switch

Rules for making switch/case expressions for union type values exhaustively checkable at compile time.

## Installation

You'll first need to install [ESLint](https://eslint.org/) and its dependency, `espree`:

```sh
npm i eslint espree --save-dev
```

Next, install `eslint-plugin-exhaustive-switch`. If you want to use the included `assertUnreachable` in your source
code, make sure to save it as a `dependency` and not a `devDependency`.

```sh
npm install eslint-plugin-exhaustive-switch --save-dev
```

## Usage

Add `exhaustive-switch` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["exhaustive-switch"]
}
```

Then configure the rule under the rules section.

```json
{
  "rules": {
    "exhaustive-switch/require-unreachable-default-case": [
      2,
      { "unreachableDefaultCaseAssertionFunctionName": "assertNever" }
    ]
  }
}
```

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                                               | Description                      | 🔧 |
| :--------------------------------------------------------------------------------- | :------------------------------- | :- |
| [require-unreachable-default-case](docs/rules/require-unreachable-default-case.md) | require unreachable default case | 🔧 |

<!-- end auto-generated rules list -->
