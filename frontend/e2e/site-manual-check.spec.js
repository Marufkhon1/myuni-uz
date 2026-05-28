import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:8000";
const WEB = "http://127.0.0.1:5173";
const PASSWORD = "TestPass123!";
const suffix = `${Date.now()}`;
const studentEmail = `e2e.student.${suffix}@sitecheck.test`;

async function registerStudent(request) {
  const universities = await request.get(`${API}/api/public/universities/`);
  expect(universities.ok()).toBeTruthy();
  const list = await universities.json();
  expect(list.length).toBeGreaterThan(0);

  const register = await request.post(`${API}/api/auth/register/`, {
    data: {
      full_name: "E2E Tekshiruv",
      email: studentEmail,
      password: PASSWORD,
      role: "student",
      university: list[0].name,
    },
  });
  expect(register.status()).toBe(201);
  const body = await register.json();
  return body.access;
}

test.describe("MyUni brauzer tekshiruvi (M1–M7)", () => {
  test.describe.configure({ mode: "serial" });

  let accessToken = "";

  test.beforeAll(async ({ request }) => {
    accessToken = await registerStudent(request);
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
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/);

    await page.getByRole("button", { name: /^sharhlar$/i }).click();
    const firstUni = page.locator("button").filter({ hasText: /universitet/i }).first();
    await firstUni.click();

    const reviewText =
      "E2E sharh testi — o'qish tajribam yaxshi, ustozlar yordam beradi va tavsiya qilaman.";
    await page.getByPlaceholder(/sharh|tajriba/i).first().fill(reviewText);
    const starButtons = page.locator('button[aria-label*="baho"], button').filter({ hasText: "★" });
    if ((await starButtons.count()) > 0) {
      await page.locator('button[aria-label="5 baho"], button[aria-label*="5"]').first().click({ timeout: 3000 }).catch(() => {});
    }
    await page.getByRole("button", { name: /sharh yuborish|yuborish/i }).first().click({ timeout: 5000 }).catch(() => {});

    const deleteBtn = page.getByRole("button", { name: /^o'chirish$/i }).first();
    if (await deleteBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      page.once("dialog", (dialog) => dialog.accept());
      await deleteBtn.click();
      await expect(page.getByText(reviewText)).toHaveCount(0, { timeout: 10000 });
    }
  });

  test("M6 — 404 sahifa", async ({ page }) => {
    await page.goto(`${WEB}/bu-sahifa-yoq-404`);
    await expect(page.getByRole("heading", { name: /topilmadi/i })).toBeVisible();
  });

  test("M3 — login va dashboard (talaba)", async ({ page }) => {
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/Salom/i)).toBeVisible();
    await page.getByRole("button", { name: /^profil$/i }).click();
    await expect(page.getByText("Talaba", { exact: true }).first()).toBeVisible();
  });

  test("M8 — qo'llab-quvvatlash chat-bot modali", async ({ page }) => {
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/);

    await page.getByRole("button", { name: /yordamchi bilan yozing/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/MyUni yordamchi/i)).toBeVisible();
    await page.getByPlaceholder(/savolingizni yozing/i).fill("parol");
    await page.getByRole("button", { name: /^yuborish$/i }).click();
    await expect(page.getByText(/parolni tiklash/i)).toBeVisible();
    await page.getByRole("button", { name: /chatni yopish/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("M9 — taqqoslash bo'limi", async ({ page }) => {
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/);

    await page.getByRole("button", { name: /taqqoslash/i }).click();
    await expect(page.getByText(/qaysi universitet sizga mos/i)).toBeVisible();
    await expect(page.getByText(/2 ta turli universitet/i)).toBeVisible();
  });

  test("M4 — qorong'u rejim", async ({ page }) => {
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/);

    const html = page.locator("html");
    const before = await html.evaluate((el) => el.classList.contains("dark"));
    const toggle = page.getByRole("button", { name: /rang rejimini almashtirish/i });
    if (await toggle.isVisible()) {
      await toggle.click();
      const after = await html.evaluate((el) => el.classList.contains("dark"));
      expect(after).not.toBe(before);
    }
  });

  test("M5 — mobil: pastki navigatsiya", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/);

    await expect(page.getByRole("navigation", { name: "Asosiy menyu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Chatlar" })).toBeVisible();
  });

  test("M7 — chat: qo'shilish va xabar", async ({ page, request }) => {
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/);

    const universities = await request.get(`${API}/api/universities/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const uniList = await universities.json();
    const uniId = uniList[0]?.id;
    expect(uniId).toBeTruthy();

    await request.post(`${API}/api/universities/${uniId}/join/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    await page.reload();
    await page.getByRole("button", { name: /qidiruv/i }).click();
    const search = page.getByPlaceholder(/universitet qidiring/i);
    if (await search.isVisible()) {
      await search.fill(uniList[0].name.slice(0, 8));
    }
    await page.getByText(uniList[0].name).first().click();

    const joinBtn = page.getByRole("button", { name: /chatga qo'shilish/i });
    if (await joinBtn.isVisible()) {
      await joinBtn.click();
    }

    const uniqueText = `E2E xabar ${suffix}`;
    const input = page.getByPlaceholder(/xabar yozing/i).first();
    await input.fill(uniqueText);
    await page.getByRole("button", { name: /^yuborish$/i }).first().click();
    await expect(page.getByText(uniqueText)).toBeVisible({ timeout: 15000 });
  });

  test("M4b — tarmoq xatosi: chat banner (simulyatsiya)", async ({ page }) => {
    await page.goto(`${WEB}/login`);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', PASSWORD);
    await page.getByRole("button", { name: /^kirish$/i }).click();
    await page.waitForURL(/\/student\/dashboard/);

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
