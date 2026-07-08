import { defineConfig } from "@playwright/test";

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  timeout: isCi ? 90000 : 60000,
  retries: isCi ? 1 : 0,
  expect: {
    timeout: isCi ? 20000 : 10000,
  },
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    locale: "uz-UZ",
  },
  // Prefer already-running servers (local DX + CI API-smoke prestart).
  // If nothing is listening, Playwright still boots them.
  webServer: [
    {
      command: "bash ../backend/scripts/run_ci_server.sh",
      url: "http://127.0.0.1:8000/api/public/universities/",
      timeout: 120000,
      reuseExistingServer: true,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173",
      timeout: 120000,
      reuseExistingServer: true,
    },
  ],
});
