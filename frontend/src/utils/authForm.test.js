import { describe, expect, it } from "vitest";
import {
  collectLoginPayloadWithRetry,
  mergeLoginPayload,
  readFormFieldValue,
  readLoginFormValues,
  readSignupFormValues,
  validateLoginPayload,
} from "@/utils/authForm.js";
import { emailValidationMessage } from "@/utils/email.js";

describe("readFormFieldValue", () => {
  it("prefers live input value over stale form data", () => {
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.name = "username";
    input.value = "marufxon4930";
    form.appendChild(input);

    expect(readFormFieldValue(form, "username", { trim: true })).toBe("marufxon4930");
  });
});

describe("mergeLoginPayload", () => {
  it("merges dom, refs, and react state values", () => {
    const form = document.createElement("form");
    const usernameInput = document.createElement("input");
    usernameInput.name = "username";
    usernameInput.value = "dom_user";
    form.appendChild(usernameInput);

    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "";
    form.appendChild(passwordInput);

    const payload = mergeLoginPayload(form, {
      usernameRef: { current: { value: "ref_user" } },
      passwordRef: { current: { value: "secret-pass" } },
      state: { username: "state_user", password: "" },
    });

    expect(payload).toEqual({
      username: "dom_user",
      password: "secret-pass",
    });
  });
});

describe("collectLoginPayloadWithRetry", () => {
  it("retries until password field is readable", async () => {
    const form = document.createElement("form");
    const usernameInput = document.createElement("input");
    usernameInput.name = "username";
    usernameInput.value = "marufxon4930";
    form.appendChild(usernameInput);

    const passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.value = "";
    form.appendChild(passwordInput);

    window.setTimeout(() => {
      passwordInput.value = "SecurePass123!";
    }, 20);

    const payload = await collectLoginPayloadWithRetry(form);
    expect(payload).toEqual({
      username: "marufxon4930",
      password: "SecurePass123!",
    });
  });
});

describe("validateLoginPayload", () => {
  it("returns uzbek field errors for missing values", () => {
    expect(validateLoginPayload({ username: "", password: "" })).toEqual({
      username: "Login yoki email kiriting.",
      password: "Parol kiriting.",
    });
  });
});

describe("readLoginFormValues", () => {
  it("reads current input values including browser autofill", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input name="username" value="ali@example.com" />
      <input name="password" value="secret-pass" />
    `;

    expect(readLoginFormValues(form)).toEqual({
      username: "ali@example.com",
      password: "secret-pass",
    });
  });
});

describe("readSignupFormValues", () => {
  it("reads signup fields including email from form data", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input name="full_name" value="Ali Valiyev" />
      <input name="username" value="ali_valiyev" />
      <input name="email" value="ali@example.com" />
      <input name="password" value="secret-pass" />
    `;

    expect(readSignupFormValues(form)).toEqual({
      full_name: "Ali Valiyev",
      username: "ali_valiyev",
      email: "ali@example.com",
      password: "secret-pass",
    });
  });
});

describe("emailValidationMessage", () => {
  it("requires email", () => {
    expect(emailValidationMessage("")).toBe("Email kiriting.");
  });

  it("rejects invalid email", () => {
    expect(emailValidationMessage("not-an-email")).toBe("Email manzili noto'g'ri.");
  });

  it("accepts valid email", () => {
    expect(emailValidationMessage("ali@example.com")).toBe("");
  });
});
