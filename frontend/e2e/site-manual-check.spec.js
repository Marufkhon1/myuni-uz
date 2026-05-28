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
  return { access: body.access, universities: list };
}

async function loginStudent(page) {
  await page.goto(`${WEB}/login`);
  await page.fill('input[name="email"]', studentEmail);
  await page.fill('input[name="password"]', PASSWORD);
  await page.getByRole("button", { name: /^kirish$/i }).click();
  await page.waitForURL(/\/student\/dashboard/, { timeout: 20000 });
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
    await openReviewsSection(page);

    const uniLabel = seedUniversities[0].short_name || seedUniversities[0].name;
    await page.getByRole("button", { name: new RegExp(uniLabel.slice(0, 8), "i") }).first().click({
      timeout: 15000,
    });

    const reviewText =
      "E2E sharh testi — o'qish tajribam yaxshi, ustozlar yordam beradi va tavsiya qilaman.";
    await page.getByPlaceholder(/muhit, ustozlar/i).fill(reviewText);
    await page.getByRole("button", { name: "5 yulduz" }).click();
    await page.getByRole("button", { name: /sharhni yuborish/i }).click();
    await expect(page.getByText(reviewText)).toBeVisible({ timeout: 20000 });

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /o['']chirish/i }).first().click();
    await expect(page.getByText(reviewText)).toHaveCount(0, { timeout: 15000 });
  });

  test("M6 — 404 sahifa", async ({ page }) => {
    await page.goto(`${WEB}/bu-sahifa-yoq-404`);
    await expect(page.getByRole("heading", { name: /topilmadi/i })).toBeVisible();
  });

  test("M3 — login va dashboard (talaba)", async ({ page }) => {
    await loginStudent(page);
    await expect(page.getByText(/Salom/i)).toBeVisible();
    await page.getByRole("button", { name: /^profil$/i }).first().click();
    await expect(page.getByText("Talaba", { exact: true }).first()).toBeVisible();
  });

  test("M8 — qo'llab-quvvatlash chat-bot modali", async ({ page }) => {
    await loginStudent(page);
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
    await loginStudent(page);
    await page.getByRole("button", { name: /taqqoslash/i }).first().click();
    await expect(page.getByText(/qaysi OTM sizga mos/i)).toBeVisible();
    await expect(page.getByText(/2 ta turli universitet/i)).toBeVisible();
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
    await loginStudent(page);

    const universities = await request.get(`${API}/api/universities/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(universities.ok()).toBeTruthy();
    const uniList = await universities.json();
    const uni = uniList[0];
    expect(uni?.id).toBeTruthy();

    await request.post(`${API}/api/universities/${uni.id}/join/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    await page.reload();
    await page.getByRole("button", { name: /^chatlar$/i }).first().click();
    await page.getByRole("button", { name: /^qidiruv$/i }).click();
    const search = page.getByPlaceholder(/universitet qidiring/i);
    await expect(search).toBeVisible({ timeout: 10000 });
    await search.fill((uni.short_name || uni.name).slice(0, 8));
    await page.getByText(uni.name).first().click();

    const joinBtn = page.getByRole("button", { name: /qo'shilish/i });
    if (await joinBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await joinBtn.click();
    }

    const uniqueText = `E2E xabar ${suffix}`;
    const input = page.getByPlaceholder(/xabar yozing/i).first();
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill(uniqueText);
    await page.getByRole("button", { name: /^yuborish$/i }).first().click();
    await expect(page.getByText(uniqueText)).toBeVisible({ timeout: 20000 });
  });

  test("M4b — tarmoq xatosi: chat banner (simulyatsiya)", async ({ page, request }) => {
    await loginStudent(page);

    const uniId = seedUniversities[0]?.id;
    await request.post(`${API}/api/universities/${uniId}/join/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    await page.reload();
    await page.getByRole("button", { name: /^chatlar$/i }).first().click();
    const joinedTab = page.getByRole("button", { name: /qo'shilgan/i });
    if (await joinedTab.isVisible()) {
      await joinedTab.click();
    }
    await page.getByText(seedUniversities[0].name).first().click({ timeout: 15000 });

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
