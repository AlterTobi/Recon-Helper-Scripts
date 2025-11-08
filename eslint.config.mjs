import globals from "globals";
import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";

export default [
  {files: ["**/*.js"],
    ignores: ["**/eslint.config.mjs"],
    languageOptions: {sourceType: "script"}},
  {languageOptions: {
    ecmaVersion: 14,
    globals: {
      ...globals.browser,
      ...globals.greasemonkey,
      "rhs": "readonly"
    }
  }
  },
  pluginJs.configs.recommended,
  {plugins: {
    "@stylistic": stylistic
  },
  rules: {
    // errors & suggestions
    "block-scoped-var": "error",
    "curly": "error",
    "dot-notation": "warn",
    "eqeqeq": "error",
    "no-empty-function": "error",
    "no-eq-null": "error",
    "no-lone-blocks": "error",
    "no-lonely-if": "warn",
    // "no-magic-numbers": ["warn", { "ignore": [1] }],
    "no-mixed-operators": "error",
    "no-multi-str": "warn",
    "no-negated-condition": "warn",
    "no-param-reassign": "error",
    "no-self-compare": "error",
    "no-unmodified-loop-condition": "warn",
    "no-unreachable-loop": "warn",
    "no-use-before-define": "error",
    "no-useless-concat": "warn",
    "no-useless-return": "warn",
    "no-var": "error",
    "prefer-const": "warn",
    "prefer-spread": "warn",
    // "prefer-rest-params": "warn",
    "space-before-function-paren": ["error", "never"],
    "spaced-comment": ["warn", "always"],
    "strict": ["error", "function"],
    //      "strict": ["error", "global"],
    //      "strict": ["error", "never"],
    "yoda": ["error", "always", { "onlyEquality": true }],

    // keine Warnung für die init() Funktion
    "no-unused-vars": ["error", { "varsIgnorePattern": "init|ignored" }],

    // Layout
    "@stylistic/array-bracket-newline": ["warn", "consistent"],
    "@stylistic/brace-style": ["warn", "1tbs", { "allowSingleLine": true }],
    "@stylistic/comma-dangle": ["warn", "only-multiline"],
    "@stylistic/comma-spacing": ["warn", { "before": false, "after": true }],
    "@/func-call-spacing": ["warn", "never"],
    "@stylistic/indent": ["warn", 2, { "SwitchCase": 1 }],
    "@stylistic/newline-per-chained-call": "warn",
    "@stylistic/no-multi-spaces": "warn",
    "@stylistic/no-multiple-empty-lines": ["warn", { "max": 2, "maxEOF": 0 }],
    "@stylistic/no-tabs": ["warn", { "allowIndentationTabs": true }],
    "@stylistic/no-trailing-spaces": ["warn", { "skipBlankLines": false }],
    "@stylistic/no-whitespace-before-property": "error",
    "@stylistic/quotes": ["error", "double", { "avoidEscape": true }],
    "@stylistic/semi": ["warn", "always"],
    "@stylistic/semi-spacing": ["warn", {"before": false, "after": true}],
    "@stylistic/semi-style": ["warn", "last"],
    "@stylistic/space-before-blocks": "warn",
    "@stylistic/switch-colon-spacing": ["error", {"after": true, "before": false}]
  }
  }
];