require("dotenv").config();

const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  use: {
    actionTimeout: 30000,
    navigationTimeout: 60000,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        headless: false,
      },
    },
    {
      name: "firefox",
      testMatch: "**/cross-browser.spec.js",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      testMatch: "**/cross-browser.spec.js",
      use: {
        ...devices["Desktop Safari"],
      },
    },
    {
      name: "mobile-chrome",
      testMatch: "**/*.mobile.spec.js",
      use: {
        ...devices["Pixel 7"],
        channel: "chrome",
        headless: true,
      },
    },
  ],
});
