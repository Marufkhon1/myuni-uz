export default function ModalOverlay({
  onClose,
  children,
  panelClassName = "",
  zIndexClass = "z-50",
  closeLabel = "Modalni yopish",
  labelledBy,
}) {
  return (
    <div className={`fixed inset-0 ${zIndexClass} grid place-items-center p-4`}>
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        {...(labelledBy ? { "aria-labelledby": labelledBy } : {})}
        className={`relative z-10 ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
