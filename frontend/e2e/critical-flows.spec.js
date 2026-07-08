import { expect, test } from "@playwright/test";
import {
  E2E_PASSWORD,
  WEB,
  fetchUniversities,
  loginViaUi,
  registerAccount,
} from "./helpers/auth.js";

test.describe("Kritik ochiq sahifalar", () => {
  test("K1 — universitetlar katalogi", async ({ page }) => {
    await page.goto(`${WEB}/universitetlar`);
    await expect(page.getByRole("heading", { name: /universitet/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("K2 — FAQ sahifasi", async ({ page }) => {
    await page.goto(`${WEB}/savollar-javob`);
    await expect(page.getByRole("heading", { name: /savol/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("K3 — ishonch va xavfsizlik", async ({ page }) => {
    await page.goto(`${WEB}/ishonch-xavfsizlik`);
    await expect(page.getByRole("heading", { name: /ishonch va xavfsizlik/i })).toBeVisible();
  });

  test("K4 — huquqiy hujjat (maxfiylik)", async ({ page }) => {
    await page.goto(`${WEB}/maxfiylik-siyosati`);
    await expect(page.getByRole("heading", { name: /maxfiylik/i })).toBeVisible();
  });

  test("K5 — API schema (dev)", async ({ request }) => {
    const response = await request.get("http://127.0.0.1:8000/api/schema/");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("openapi");
  });
});

test.describe("Abituriyent kritik flow", () => {
  const suffix = `${Date.now()}`;
  const applicantEmail = `e2e.applicant.${suffix}@sitecheck.test`;

  test("K6 — abituriyent ro'yxatdan o'tish va dashboard", async ({ page, request }) => {
    const list = await fetchUniversities(request);

    await registerAccount(request, {
      email: applicantEmail,
      password: E2E_PASSWORD,
      role: "applicant",
      universityName: list[0].name,
      universityId: list[0].id,
      fullName: "E2E Abituriyent",
    });

    await loginViaUi(page, {
      email: applicantEmail,
      password: E2E_PASSWORD,
      dashboardPattern: /\/applicant\/dashboard/,
    });
    await expect(page.getByRole("heading", { name: /Salom/i }).first()).toBeVisible({ timeout: 20000 });
  });
});

test.describe("Guest compare + methodology", () => {
  test("K7 — ochiq taqqoslash sahifa", async ({ page, request }) => {
    const list = await fetchUniversities(request);
    expect(list.length).toBeGreaterThanOrEqual(2);
    const ids = `${list[0].id},${list[1].id}`;
    await page.goto(`${WEB}/taqqoslash?ids=${ids}`);
    await expect(page.getByText(/MyUni\.uz taqqoslash/i).first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /Boshqa OTM/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("K8 — metodologiya", async ({ page }) => {
    await page.goto(`${WEB}/metodologiya`);
    await expect(page.getByRole("heading", { name: /metodologiya/i }).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
