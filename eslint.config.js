const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      "node_modules/*",
      "playwright-report/*",
      "test-results/*",
      // Design explorations Adhvaith worked from — reference material, not
      // shipped code, and not written against this lint config.
      "attached_assets/*",
    ],
  },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@expo/vector-icons",
              message:
                "Import the specific family instead (e.g. '@expo/vector-icons/Feather') — the barrel bundles every icon font, ~3 MB of unused .ttf.",
            },
          ],
        },
      ],
      // These two rules keep the security boundaries from eroding: every
      // outbound URL must be sanitised, and every persisted read must be
      // schema-validated. The modules that implement those guarantees are
      // exempted below, as are the tests that verify them.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='Linking'][property.name='openURL']",
          message:
            "Use openExternalUrl from '@/lib/safeLink' so the URL is validated before it is opened.",
        },
        {
          selector:
            "CallExpression[callee.object.name='AsyncStorage'][callee.property.name='getItem']",
          message:
            "Use readValidated from '@/lib/storage' so persisted data is schema-checked on read.",
        },
      ],
    },
  },
  {
    // The implementations of the guarantees above.
    files: ["lib/safeLink.ts", "lib/storage.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["__tests__/**/*.{ts,tsx}", "jest.setup.js", "jest.config.js"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        module: "writable",
        require: "readonly",
      },
    },
    rules: {
      "no-restricted-syntax": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["e2e/**/*.ts", "playwright.config.ts"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly" },
    },
    rules: { "no-restricted-syntax": "off" },
  },
]);
