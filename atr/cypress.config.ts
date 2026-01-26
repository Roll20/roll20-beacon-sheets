import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:4173",
    video: false,
    screenshotOnRunFailure: false,
    scrollBehavior: "center",
    numTestsKeptInMemory: 0,
    experimentalRunAllSpecs: true
  }
});
