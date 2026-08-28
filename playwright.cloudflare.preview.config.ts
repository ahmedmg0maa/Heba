import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/preview',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8790',
    locale: 'ar-EG',
    timezoneId: 'Africa/Cairo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm exec wrangler dev --config dist/server/wrangler.json --var HEBA_DEPLOYMENT_ENV:preview --port 8790',
    url: 'http://127.0.0.1:8790',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: 'cloudflare-preview-chromium', use: { ...devices['Desktop Chrome'] } }],
})
