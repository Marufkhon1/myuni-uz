export default function FormField({
  id,
  name,
  label,
  type = "text",
  value,
  defaultValue,
  onChange,
  onInput,
  inputRef,
  error,
  hint,
  required = false,
  autoComplete,
  minLength,
  placeholder,
  className = "",
  inputClassName = "",
}) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const isControlled = value !== undefined;

  return (
    <label className={`block ${className}`} htmlFor={id}>
      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden>
            *
          </span>
        )}
      </span>
      <input
        ref={inputRef}
        id={id}
        name={name ?? id}
        type={type}
        {...(isControlled ? { value } : { defaultValue: defaultValue ?? "" })}
        onChange={onChange}
        onInput={onInput ?? onChange}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder={placeholder}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={
          "h-12 w-full rounded-2xl border px-4 text-sm font-semibold outline-none transition focus:ring-4 " +
          (error
            ? "border-danger/50 focus:border-danger focus:ring-danger/15"
            : "border-slate-200 focus:border-primary/50 focus:ring-blue-100/80 dark:border-white/12 dark:focus:ring-blue-400/15") +
          " bg-white text-slate-900 dark:bg-slate-900/80 dark:text-white " +
          inputClassName
        }
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-bold text-danger" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
