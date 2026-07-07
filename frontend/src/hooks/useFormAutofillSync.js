import { useCallback, useEffect, useRef } from "react";

const AUTOFILL_ANIMATION = "myuni-autofill-start";

export function useFormAutofillSync(fieldNames, onSync) {
  const formRef = useRef(null);

  const syncFromDom = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const snapshot = {};
    let hasValue = false;

    for (const name of fieldNames) {
      const field = form.elements.namedItem(name);
      if (field && typeof field.value === "string" && field.value) {
        snapshot[name] = field.value;
        hasValue = true;
      }
    }

    if (hasValue) {
      onSync(snapshot);
    }
  }, [fieldNames, onSync]);

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
