import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

export default function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-[130] border-b border-amber-300/40 bg-amber-50 px-4 py-2 text-center text-sm font-bold text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100"
      role="status"
    >
      Internet aloqasi yo&apos;q — ba&apos;zi funksiyalar cheklangan. Offline rejimda faqat ochilgan sahifalar ko&apos;rinadi.
    </div>
  );
}
