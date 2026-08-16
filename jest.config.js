/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/__tests__/**/*.test.ts", "<rootDir>/__tests__/**/*.test.tsx"],
  // Playwright drives its own runner; keep it out of Jest's way.
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/e2e/"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "context/**/*.tsx",
    "components/**/*.tsx",
    "!**/node_modules/**",
  ],
  // `transformIgnorePatterns` is deliberately not overridden: the jest-expo
  // preset ships a pattern that accounts for pnpm's `.pnpm/` store layout, and
  // hand-rolling one here stops React Native's ESM sources being transformed.
};
