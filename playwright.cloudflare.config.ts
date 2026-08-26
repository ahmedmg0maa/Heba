import { defineConfig, devices } from '@playwright/test'

// The Worker is started independently from the already-built, isolated dist/
// output. This keeps Cloudflare-runtime regression evidence separate from the
// ordinary Next development-server suite.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8787',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'ar-EG',
    timezoneId: 'Africa/Cairo',
  },
  projects: [
    { name: 'cloudflare-desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'cloudflare-mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
})
