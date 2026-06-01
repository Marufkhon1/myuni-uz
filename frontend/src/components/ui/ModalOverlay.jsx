import { useRef } from "react";
import useFocusTrap from "../../hooks/useFocusTrap.js";

export default function ModalOverlay({
  onClose,
  children,
  panelClassName = "",
  zIndexClass = "z-50",
  closeLabel = "Modalni yopish",
  labelledBy,
  initialFocusRef = null,
}) {
  const trapRef = useRef(null);
  useFocusTrap(Boolean(onClose), trapRef, { onEscape: onClose, initialFocusRef });

  return (
    <div ref={trapRef} className={`fixed inset-0 ${zIndexClass} grid place-items-center p-4`}>
      <div
        role="presentation"
        aria-hidden="true"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        {...(labelledBy ? { "aria-labelledby": labelledBy } : {})}
        className={`relative z-10 outline-none ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
