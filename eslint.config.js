const { FlatCompat } = require("@eslint/eslintrc");
const globals = require("globals");
const tseslint = require("typescript-eslint");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const globalIgnores = {
  ignores: [
    "node_modules/",
    ".expo/",
    "dist/",
    "build/",
    "**/.*",
    ".config/*",
    "babel.config.js",
    "jest.config.js",
    "metro.config.js",
    "patches/",
    // Ignore problematic files completely for now
    "**/src/components/Avatar/LyoAvatar.tsx",
    "**/src/components/Avatar/__tests__/Avatar.test.tsx",
  ],
};

module.exports = tseslint.config(
  globalIgnores,

  ...compat.extends("universe/native"),

  // TypeScript configurations
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended, // Recommended rules from @typescript-eslint/eslint-plugin
      ...tseslint.configs.stylistic, // Stylistic rules from @typescript-eslint/eslint-plugin
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    rules: {
      // Override or add specific rules after extending recommended configs
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn", // Changed from error to warn
      "@typescript-eslint/consistent-type-definitions": "off", // Turn off interface vs type requirement
      "node/handle-callback-err": "off",
      "react-native-community/no-physical-props": "off",
      // Add any other TypeScript-specific overrides here
    },
  },

  // Configuration for JavaScript files
  {
    files: ["*.js", "scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        __dirname: "readonly",
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "node/handle-callback-err": "off",
    },
  },

  // General rules (plugins for these rules are expected from universe/native or other configs)
  {
    rules: {
      "react-native-community/no-physical-props": "off",
      "react-native/no-color-literals": "off",
      "react-native/no-raw-text": "off",
      "react-native/no-inline-styles": "warn",
      "prettier/prettier": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always-and-inside-groups",
        },
      ],
      "no-useless-escape": "warn",
    },
  },

  // Special rules for StyleSheets
  {
    files: ["**/styles.js", "**/styles.ts", "**/*.styles.js", "**/*.styles.ts", "**/*.tsx", "**/*.jsx"],
    rules: {
      // Disable physical property warnings in StyleSheet objects
      "react-native-community/no-physical-props": "off",
      "react-native/no-color-literals": "off",
    }
  },

  // Test file specific configurations
  {
    files: [
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
    rules: {
      // Loosen rules for test files
      "node/handle-callback-err": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
