import { useEffect, useRef, useState } from "react";

export default function RateLimitNotice({
  message,
  retryAfterSeconds = 0,
  className = "",
  onExpired,
}) {
  const [remaining, setRemaining] = useState(retryAfterSeconds);
  const previousRemainingRef = useRef(retryAfterSeconds);

  useEffect(() => {
    setRemaining(retryAfterSeconds);
    previousRemainingRef.current = retryAfterSeconds;
  }, [retryAfterSeconds, message]);

  useEffect(() => {
    if (remaining <= 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setRemaining((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  useEffect(() => {
    if (previousRemainingRef.current > 0 && remaining === 0) {
      onExpired?.();
    }
    previousRemainingRef.current = remaining;
  }, [remaining, onExpired]);

  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-100 ${className}`}
    >
      <p>{message}</p>
      {remaining > 0 ? (
        <p className="mt-1 text-xs font-bold tabular-nums opacity-90">
          Qayta urinish: {remaining} soniya
        </p>
      ) : null}
    </div>
  );
}
