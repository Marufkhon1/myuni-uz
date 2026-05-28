import { defineConfig } from "@playwright/test";

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  retries: isCi ? 1 : 0,
  workers: isCi ? 1 : undefined,
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    locale: "uz-UZ",
  },
  webServer: isCi
    ? [
        {
          command: "bash ../backend/scripts/run_ci_server.sh",
          url: "http://127.0.0.1:8000/api/public/universities/",
          timeout: 120000,
          reuseExistingServer: false,
        },
        {
          command: "npm run dev -- --host 127.0.0.1 --port 5173",
          url: "http://127.0.0.1:5173",
          timeout: 120000,
          reuseExistingServer: false,
        },
      ]
    : undefined,
});
