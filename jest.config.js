module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/mocks/**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/android/",
    "/ios/",
    "/__mocks__/",
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/src/__mocks__/svgMock.js",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
