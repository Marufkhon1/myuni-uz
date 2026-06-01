import { MAIN_CONTENT_ID } from "../../utils/mainContent.js";
import { prefersReducedMotion } from "../../utils/prefersReducedMotion.js";

export default function SkipToContent() {
  function handleSkip(event) {
    event.preventDefault();
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (!main) {
      return;
    }

    main.focus({ preventScroll: true });
    main.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <a href={`#${MAIN_CONTENT_ID}`} className="skip-link" onClick={handleSkip}>
      Asosiy kontentga o&apos;tish
    </a>
  );
}
