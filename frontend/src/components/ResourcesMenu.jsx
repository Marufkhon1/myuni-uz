import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { isNavPathActive, RESOURCE_NAV_LINKS } from "@/config/navigation.js";
import { trackHubCta } from "@/lib/analytics.js";

function desktopTriggerClass(isActive, isDark) {
  const base =
    "relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap px-1.5 py-1 text-[12px] font-semibold transition-colors duration-200 xl:px-2 xl:text-[13px] 2xl:text-sm";
  if (isDark) {
    if (isActive) {
      return `${base} font-bold text-white after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-sky-300`;
    }
    return `${base} text-slate-100 hover:text-white`;
  }
  if (isActive) {
    return `${base} font-bold text-primary after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary`;
  }
  return `${base} text-slate-700 hover:text-slate-950`;
}

/**
 * Desktop «Resurslar» mega — Escape, ArrowUp/Down/Home/End, focus return.
 */
export default function ResourcesMenu({ isDark, pathname, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const menuId = useId();
  const active = RESOURCE_NAV_LINKS.some((link) => isNavPathActive(pathname, link.href));

  function closeMenu({ returnFocus = true } = {}) {
    setOpen(false);
    if (returnFocus) {
      buttonRef.current?.focus();
    }
  }

  function openMenu(initialIndex = 0) {
    setFocusIndex(initialIndex);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) {
        closeMenu({ returnFocus: false });
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    itemRefs.current[focusIndex]?.focus();
  }, [open, focusIndex]);

  function moveFocus(delta) {
    const count = RESOURCE_NAV_LINKS.length;
    setFocusIndex((current) => (current + delta + count) % count);
  }

  function onButtonKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(RESOURCE_NAV_LINKS.length - 1);
    }
  }

  function onMenuKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ returnFocus: true });
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(-1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFocusIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setFocusIndex(RESOURCE_NAV_LINKS.length - 1);
      return;
    }
    if (event.key === "Tab") {
      closeMenu({ returnFocus: false });
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={desktopTriggerClass(active || open, isDark)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => (open ? closeMenu({ returnFocus: false }) : openMenu(0))}
        onKeyDown={onButtonKeyDown}
      >
        Resurslar
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Resurslar"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            onKeyDown={onMenuKeyDown}
            className={
              "absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 rounded-2xl border p-2 shadow-lg " +
              (isDark ? "border-white/10 bg-[#0c1f4a]" : "border-slate-200 bg-white")
            }
          >
            {RESOURCE_NAV_LINKS.map((link, index) => {
              const linkActive = isNavPathActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  role="menuitem"
                  tabIndex={focusIndex === index ? 0 : -1}
                  to={link.href}
                  onClick={() => {
                    trackHubCta(link.href, "nav_resources");
                    closeMenu({ returnFocus: false });
                    onNavigate?.();
                  }}
                  onFocus={() => setFocusIndex(index)}
                  className={
                    "block rounded-xl px-3 py-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-primary/50 " +
                    (linkActive
                      ? isDark
                        ? "bg-white/10"
                        : "bg-slate-100"
                      : isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-slate-50")
                  }
                  aria-current={linkActive ? "page" : undefined}
                >
                  <span
                    className={"block text-sm font-bold " + (isDark ? "text-white" : "text-slate-950")}
                  >
                    {link.label}
                  </span>
                  <span
                    className={
                      "mt-0.5 block text-xs font-medium " +
                      (isDark ? "text-slate-400" : "text-slate-500")
                    }
                  >
                    {link.description}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
