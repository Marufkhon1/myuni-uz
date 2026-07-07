import { expect } from "@playwright/test";

export const API = "http://127.0.0.1:8000";
export const WEB = "http://127.0.0.1:5173";
export const E2E_PASSWORD = "TestPass123!";

export async function fetchUniversities(request) {
  const response = await request.get(`${API}/api/public/universities/`);
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  const list = Array.isArray(payload) ? payload : payload.results ?? [];
  expect(list.length).toBeGreaterThan(0);
  return list;
}

export async function loginAccessToken(request, { username, email, password = E2E_PASSWORD }) {
  const login = await request.post(`${API}/api/auth/login/`, {
    data: { username: username || email, password },
  });
  expect(login.ok()).toBeTruthy();
  return (await login.json()).access;
}

export async function registerAccount(
  request,
  { username, email, password = E2E_PASSWORD, role, universityName, fullName = "E2E Tekshiruv" }
) {
  const resolvedUsername =
    username ||
    (email ? email.split("@")[0].replace(/[^a-z0-9._-]/gi, "_").slice(0, 30) : `e2e_${Date.now()}`);
  const resolvedEmail = email || `${resolvedUsername}@sitecheck.test`;

  const register = await request.post(`${API}/api/auth/register/`, {
    data: {
      full_name: fullName,
      username: resolvedUsername,
      email: resolvedEmail,
      password,
      role,
      university: universityName,
    },
  });
  expect(register.status()).toBe(201);
  const body = await register.json();
  const access = body.access || (await loginAccessToken(request, { username: resolvedUsername, password }));
  return { access, body, username: resolvedUsername };
}

export async function skipOnboardingForE2e(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem("myuni_onboarding_v1_done", "1");
    } catch {
      // ignore
    }
  });
}

export async function dismissOnboardingIfOpen(page) {
  const onboardingDialog = page.getByRole("dialog").filter({ has: page.locator("#onboarding-title") });
  try {
    await onboardingDialog.waitFor({ state: "visible", timeout: 15000 });
  } catch {
    return;
  }

  const finishLater = page.getByRole("button", { name: /^keyinroq$/i });
  if (await finishLater.isVisible().catch(() => false)) {
    await finishLater.click();
  } else {
    await page.getByRole("button", { name: /yo'riqnomani yopish/i }).click({ force: true });
  }

  await expect(onboardingDialog).toHaveCount(0, { timeout: 5000 });
}

export async function waitForDashboardReady(page) {
  await expect(page.getByRole("heading", { name: /Salom/i }).first()).toBeVisible({ timeout: 30000 });
}

export async function loginViaUi(page, { username, email, password = E2E_PASSWORD, dashboardPattern }) {
  await page.goto(`${WEB}/login`);
  await skipOnboardingForE2e(page);
  await page.fill('input[name="username"]', username || email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: /^kirish$/i }).click();
  await page.waitForURL(dashboardPattern, { timeout: 20000 });
  await waitForDashboardReady(page);
  await skipOnboardingForE2e(page);
  await dismissOnboardingIfOpen(page);
}
