import { expect, test } from "@playwright/test";
import {
  API,
  E2E_PASSWORD,
  WEB,
  fetchUniversities,
  loginViaUi,
  registerAccount,
} from "./helpers/auth.js";

const suffix = `${Date.now()}`;
const studentEmail = `e2e.student.${suffix}@sitecheck.test`;

async function registerStudent(request) {
  const list = await fetchUniversities(request);
  const { access } = await registerAccount(request, {
    email: studentEmail,
    password: E2E_PASSWORD,
    role: "student",
    universityName: list[0].name,
  });
  return { access, universities: list };
}

async function loginStudent(page) {
  await loginViaUi(page, {
    email: studentEmail,
    password: E2E_PASSWORD,
    dashboardPattern: /\/student\/dashboard/,
  });
}

async function openReviewsSection(page) {
  await page.getByRole("button", { name: /sharh yozish/i }).first().click();
}

test.describe("MyUni brauzer tekshiruvi (M1–M7)", () => {
  test.describe.configure({ mode: "serial" });

  let accessToken = "";
  let seedUniversities = [];

  test.beforeAll(async ({ request }) => {
    const registered = await registerStudent(request);
    accessToken = registered.access;
    seedUniversities = registered.universities;
  });

  test("M1 — landing va CTA matni", async ({ page }) => {
    await page.goto(WEB);
    await expect(page.getByText(/talabalar platformasi/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /ro'yxatga qo'shilish/i }).first()).toBeVisible();
  });

  test("M2 — signup: universitet dropdown", async ({ page }) => {
    await page.goto(`${WEB}/signup`);
    await expect(page.getByText("Talaba")).toBeVisible();
    await expect(page.getByText("Abituriyent")).toBeVisible();
    const universityField = page.getByRole("combobox");
    await expect(universityField).toBeEnabled({ timeout: 15000 });
    await universityField.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    const options = await page.getByRole("option").count();
    expect(options).toBeGreaterThan(0);
    await page.getByRole("option").first().click();
    await expect(universityField).not.toHaveValue("");
  });

  test("M10 — sharh yozish va o'chirish", async ({ page }) => {
    await loginStudent(page);
    await expect(page.getByRole("heading", { name: /Salom/i })).toBeVisible({ timeout: 30000 });
    await openReviewsSection(page);

    const uni = seedUniversities[0];
    const uniPick = uni.short_name || uni.name.slice(0, 12);
    await page
      .getByRole("button", { name: new RegExp(`^${uniPick.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") })
      .first()
      .click();

    const reviewText = `E2E sharh ${suffix} — o'qish tajribam yaxshi, ustozlar yordam beradi va tavsiya qilaman.`;
    const reviewInput = page.locator('textarea[placeholder*="muhit"]');
    await expect(reviewInput).toBeVisible({ timeout: 20000 });
    await reviewInput.fill(reviewText);
    await page
      .getByRole("radiogroup", { name: /qanday baho ber/i })
      .getByRole("button", { name: "5 yulduz", exact: true })
      .click();
    for (const aspectLabel of ["O'qituvchilar", "Yotoqxona", "Infratuzilma"]) {
      await page
        .locator("div")
        .filter({ has: page.getByText(aspectLabel, { exact: true }) })
        .getByRole("button", { name: "5 yulduz", exact: true })
        .click();
    }
    await page.getByRole("button", { name: /sharhni yuborish/i }).click();
    const postedReview = page
      .getByRole("article")
      .filter({ hasText: reviewText })
      .filter({ has: page.getByRole("button", { name: "O'chirish" }) })
      .first();
    await expect(postedReview).toBeVisible({ timeout: 20000 });

    page.once("dialog", (dialog) => dialog.accept());
    await postedReview.getByRole("button", { name: "O'chirish" }).click();
    await expect(
      page.getByRole("article").filter({ hasText: reviewText })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test("M6 — 404 sahifa", async ({ page }) => {
    await page.goto(`${WEB}/bu-sahifa-yoq-404`);
    await expect(page.getByRole("heading", { name: /topilmadi/i })).toBeVisible();
  });

  test("M3 — login va dashboard (talaba)", async ({ page }) => {
    await loginStudent(page);
    await expect(page.getByText(/Salom/i)).toBeVisible();
    await page.getByRole("navigation").getByRole("button", { name: /^profil/i }).click();
    await expect(page.getByText("Raqamli ID")).toBeVisible();
    await expect(page.getByText("Talaba").first()).toBeVisible();
  });

  test("M8 — qo'llab-quvvatlash chat-bot modali", async ({ page }) => {
    await loginStudent(page);
    await page.getByRole("button", { name: /yordamchi bilan yozing/i }).click();
    const supportDialog = page.getByRole("dialog", { name: /MyUni yordamchi/i });
    await expect(supportDialog).toBeVisible();
    await page.getByPlaceholder(/savolingizni yozing/i).fill("parol");
    await page.getByRole("button", { name: /^yuborish$/i }).click();
    await expect(page.getByText(/parolni tiklash/i)).toBeVisible();
    await page.getByRole("button", { name: /chatni yopish/i }).click();
    await expect(supportDialog).toHaveCount(0);
  });

  test("M9 — taqqoslash bo'limi", async ({ page }) => {
    await loginStudent(page);
    await page.getByRole("button", { name: /taqqoslash/i }).first().click();
    await expect(page.getByRole("heading", { name: /OTMlarni solishtiring/i })).toBeVisible();
    await expect(page.getByText(/Ikkita turli OTM/i)).toBeVisible();
  });

  test("M4 — qorong'u rejim", async ({ page }) => {
    await loginStudent(page);
    const html = page.locator("html");
    const before = await html.evaluate((el) => el.classList.contains("dark"));
    const toggle = page.getByRole("button", { name: /rang rejimini almashtirish/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const after = await html.evaluate((el) => el.classList.contains("dark"));
    expect(after).not.toBe(before);
  });

  test("M5 — mobil: pastki navigatsiya", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginStudent(page);
    await expect(page.getByRole("navigation", { name: "Asosiy menyu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Chatlar" })).toBeVisible();
  });

  test("M7 — chat: qo'shilish va xabar", async ({ page, request }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await loginStudent(page);

    const uni = seedUniversities[0];
    expect(uni?.id).toBeTruthy();

    await request.post(`${API}/api/universities/${uni.id}/join/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    await page.reload();
    await expect(page.getByRole("heading", { name: /Salom/i })).toBeVisible({ timeout: 30000 });
    await page.getByRole("navigation").getByRole("button", { name: /^chatlar/i }).click();
    await page.getByRole("button", { name: "Qo'shilgan", exact: true }).click();
    const uniPick = (uni.short_name || uni.name).slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await page.getByRole("button", { name: new RegExp(`^${uniPick}`, "i") }).first().click();

    const uniqueText = `E2E xabar ${suffix}`;
    const input = page.getByPlaceholder(/xabar yozing/i).first();
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill(uniqueText);
    await page.getByRole("button", { name: /^yuborish$/i }).first().click();
    await expect(page.getByText(uniqueText)).toBeVisible({ timeout: 20000 });
  });

  test("M4b — tarmoq xatosi: chat banner (simulyatsiya)", async ({ page, request }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await loginStudent(page);

    const uniId = seedUniversities[0]?.id;
    await request.post(`${API}/api/universities/${uniId}/join/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    await page.reload();
    await expect(page.getByRole("heading", { name: /Salom/i })).toBeVisible({ timeout: 30000 });
    await page.getByRole("navigation").getByRole("button", { name: /^chatlar/i }).click();
    await page.getByRole("button", { name: "Qo'shilgan", exact: true }).click();
    const uni = seedUniversities[0];
    const uniPick = (uni.short_name || uni.name).slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await page.getByRole("button", { name: new RegExp(`^${uniPick}`, "i") }).first().click();

    await page.route("**/api/universities/*/messages/**", (route) => {
      if (route.request().method() === "POST") {
        route.abort("failed");
        return;
      }
      route.continue();
    });

    const input = page.getByPlaceholder(/xabar yozing/i).first();
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("Tarmoq xato test");
    await page.getByRole("button", { name: /^yuborish$/i }).first().click();
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });
  });
});
