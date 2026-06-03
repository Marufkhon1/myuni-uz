const SIZE_STYLES = {
  sm: { box: "h-7 w-7", icon: "h-3 w-3" },
  md: { box: "h-8 w-8", icon: "h-3.5 w-3.5" },
  lg: { box: "h-9 w-9", icon: "h-4 w-4" },
};

export default function IconDeleteButton({
  onClick,
  disabled = false,
  className = "",
  size = "md",
  ariaLabel = "O'chirish",
  title,
}) {
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`grid place-items-center rounded-full bg-slate-950 text-white shadow-lg ring-1 ring-black/10 transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#121826] dark:ring-white/10 dark:hover:bg-red-600 ${sizeStyle.box} ${className}`}
      title={title ?? ariaLabel}
      aria-label={ariaLabel}
    >
      <svg
        viewBox="0 0 24 24"
        className={sizeStyle.icon}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m-1 0v14H9V6" />
      </svg>
    </button>
  );
}
