/**
 * Lightweight contrast helpers for a11y regression tests.
 * Not a full WCAG engine — guards our design-token invariants.
 */

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function relativeLuminance({ r, g, b }) {
  const channel = [r, g, b].map((value) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channel[0] + 0.7152 * channel[1] + 0.0722 * channel[2];
}

export function contrastRatio(foregroundHex, backgroundHex) {
  const lighter = Math.max(relativeLuminance(hexToRgb(foregroundHex)), relativeLuminance(hexToRgb(backgroundHex)));
  const darker = Math.min(relativeLuminance(hexToRgb(foregroundHex)), relativeLuminance(hexToRgb(backgroundHex)));
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA normal text threshold */
export const WCAG_AA_NORMAL = 4.5;

/** Product tokens mirrored from styles/index.css :root / .dark */
export const CONTRAST_TOKENS = {
  light: {
    fg: "#0f172a",
    muted: "#475569",
    surface: "#ffffff",
  },
  dark: {
    fg: "#f8fafc",
    muted: "#cbd5e1",
    surface: "#0f172a",
  },
  /** Bottom-nav idle tab colors */
  bottomNavIdleLight: "#475569", // slate-600
  bottomNavIdleDark: "#cbd5e1", // slate-300
};
