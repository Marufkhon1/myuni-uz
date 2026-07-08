function getNamedInput(formElement, name) {
  const field = formElement?.elements?.namedItem?.(name);
  if (!field || typeof field !== "object" || !("value" in field)) {
    return null;
  }
  if (typeof field.value !== "string") {
    return null;
  }
  return field;
}

function pickFirstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return "";
}

export function readFormFieldValue(formElement, name, { trim = false } = {}) {
  const input = getNamedInput(formElement, name);
  const raw = input ? input.value : String(new FormData(formElement).get(name) ?? "");
  return trim ? raw.trim() : raw;
}

export function readNamedFormValues(formElement, fieldNames, { trimFields = [] } = {}) {
  const trimSet = new Set(trimFields);

  return Object.fromEntries(
    fieldNames.map((name) => {
      const rawValue = readFormFieldValue(formElement, name);
      return [name, trimSet.has(name) ? rawValue.trim() : rawValue];
    })
  );
}

export function wakeFormFields(formElement, fieldNames) {
  for (const name of fieldNames) {
    const input = getNamedInput(formElement, name);
    if (!input) {
      continue;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

export function mergeLoginPayload(formElement, { usernameRef, passwordRef, state } = {}) {
  const dom = readLoginFormValues(formElement);

  return {
    username: pickFirstNonEmpty(dom.username, usernameRef?.current?.value, state?.username).trim(),
    password: pickFirstNonEmpty(dom.password, passwordRef?.current?.value, state?.password),
  };
}

export async function collectLoginPayloadWithRetry(formElement, options = {}) {
  let payload = mergeLoginPayload(formElement, options);
  if (payload.username && payload.password) {
    return payload;
  }

  wakeFormFields(formElement, ["username", "password"]);

  await new Promise((resolve) => {
    window.requestAnimationFrame(resolve);
  });
  payload = mergeLoginPayload(formElement, options);
  if (payload.username && payload.password) {
    return payload;
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 100);
  });
  return mergeLoginPayload(formElement, options);
}

export function readLoginFormValues(formElement) {
  return readNamedFormValues(formElement, ["username", "password"], {
    trimFields: ["username"],
  });
}

export function readSignupFormValues(formElement) {
  return readNamedFormValues(formElement, ["full_name", "username", "email", "password"], {
    trimFields: ["full_name", "username", "email"],
  });
}

export function validateLoginPayload(payload) {
  const errors = {};
  if (!payload.username) {
    errors.username = "Login yoki email kiriting.";
  }
  if (!payload.password) {
    errors.password = "Parol kiriting.";
  }
  return errors;
}
