import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4173/zodiac-engine-docs/',
    browserName: 'chromium',
    colorScheme: 'light',
  },
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://127.0.0.1:4173/zodiac-engine-docs/',
    reuseExistingServer: !process.env.CI,
  },
});
