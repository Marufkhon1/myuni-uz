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

export async function loginAccessToken(request, { email, password = E2E_PASSWORD }) {
  const login = await request.post(`${API}/api/auth/login/`, {
    data: { email, password },
  });
  expect(login.ok()).toBeTruthy();
  return (await login.json()).access;
}

export async function registerAccount(
  request,
  { email, password = E2E_PASSWORD, role, universityName, fullName = "E2E Tekshiruv" }
) {
  const register = await request.post(`${API}/api/auth/register/`, {
    data: {
      full_name: fullName,
      email,
      password,
      role,
      university: universityName,
    },
  });
  expect(register.status()).toBe(201);
  const body = await register.json();
  const access = body.access || (await loginAccessToken(request, { email, password }));
  return { access, body };
}

export async function loginViaUi(page, { email, password = E2E_PASSWORD, dashboardPattern }) {
  await page.goto(`${WEB}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: /^kirish$/i }).click();
  await page.waitForURL(dashboardPattern, { timeout: 20000 });
}
