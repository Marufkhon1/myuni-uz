import { useCallback, useEffect, useRef } from "react";

const AUTOFILL_ANIMATION = "myuni-autofill-start";

/**
 * Syncs browser autofill values into React state without causing update loops.
 * `fieldNames` should be a stable array reference (module const or useMemo).
 */
export function useFormAutofillSync(fieldNames, onSync) {
  const formRef = useRef(null);
  const onSyncRef = useRef(onSync);
  const fieldNamesRef = useRef(fieldNames);
  const lastSyncedRef = useRef("");

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  useEffect(() => {
    fieldNamesRef.current = fieldNames;
  }, [fieldNames]);

  const syncFromDom = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const names = fieldNamesRef.current;
    const snapshot = {};
    let hasValue = false;

    for (const name of names) {
      const field = form.elements.namedItem(name);
      if (field && typeof field.value === "string" && field.value) {
        snapshot[name] = field.value;
        hasValue = true;
      }
    }

    if (!hasValue) {
      return;
    }

    const signature = names.map((name) => `${name}:${snapshot[name] ?? ""}`).join("|");
    if (signature === lastSyncedRef.current) {
      return;
    }
    lastSyncedRef.current = signature;
    onSyncRef.current(snapshot);
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return undefined;
    }

    function handleAutofillAnimation(event) {
      if (event.animationName === AUTOFILL_ANIMATION) {
        syncFromDom();
      }
    }

    syncFromDom();
    const timers = [0, 50, 150, 400, 800, 1200, 2000].map((delayMs) =>
      window.setTimeout(syncFromDom, delayMs)
    );

    function handleFormInput() {
      syncFromDom();
    }

    form.addEventListener("input", handleFormInput);
    form.addEventListener("change", handleFormInput);
    form.addEventListener("animationstart", handleAutofillAnimation, true);

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      form.removeEventListener("input", handleFormInput);
      form.removeEventListener("change", handleFormInput);
      form.removeEventListener("animationstart", handleAutofillAnimation, true);
    };
  }, [syncFromDom]);

  return formRef;
}
