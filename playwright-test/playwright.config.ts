import { defineConfig, devices } from '@playwright/test';
import * as process from 'process';

export default defineConfig({
  testDir: './tests',
  // Adjusted timeout for parallel execution
  timeout: 120000, 
  expect: {
    timeout: 10000, 
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Increase retries in CI to handle flaky tests
  retries: process.env.CI ? 1 : 1,
  // Configure sharding and workers based on environment
  workers: process.env.CI ? undefined : 1, // undefined in CI to let GitHub Actions control sharding
  // Use multiple reporters for better visibility
  reporter: process.env.CI 
    ? [
        ['html'], 
        ['github'], 
        ['list']
      ] 
    : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Add additional settings for CI
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment these if you want to run tests in multiple browsers in CI
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  // Output folder for test results that will be merged in GitHub Actions
  outputDir: 'test-results',
}); 