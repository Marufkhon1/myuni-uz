import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../ui/EmptyState.jsx";
import { NotificationsListSkeleton } from "../skeletons/PublicPageSkeletons.jsx";
import useFocusTrap from "@/hooks/useFocusTrap.js";

function formatWhen(value) {
  if (!value) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function kindLabel(kind) {
  switch (kind) {
    case "review_approved":
      return "Sharh tasdiqlandi";
    case "review_rejected":
      return "Sharh rad etildi";
    case "review_pending":
      return "Moderatsiya";
    case "review_liked":
      return "Yoqtirish";
    case "chat_unread":
      return "Chat";
    default:
      return "Xabar";
  }
}

export default function NotificationsPanel({
  open,
  onClose,
  containerRef,
  items,
  unreadCount,
  apiUnreadCount,
  chatUnreadTotal,
  isLoading,
  onMarkAllRead,
  onMarkOneRead,
}) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useFocusTrap(open, panelRef, { onEscape: onClose, lockScroll: false });

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onPointerDown(event) {
      if (containerRef?.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, containerRef]);

  if (!open) {
    return null;
  }

  function handleOpen(item) {
    if (!item.is_synthetic) {
      onMarkOneRead?.(item.id);
    }
    onClose();
    if (item.link) {
      navigate(item.link);
    }
  }

  const statusText =
    unreadCount > 0
      ? [
          apiUnreadCount > 0 ? `${apiUnreadCount} ta platforma xabari` : null,
          chatUnreadTotal > 0 ? `${chatUnreadTotal > 99 ? "99+" : chatUnreadTotal} ta chat xabari` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "Hammasi o'qilgan";

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      role="dialog"
      aria-modal="true"
      aria-label="Bildirishnomalar"
      tabIndex={-1}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-950 dark:text-white">Bildirishnomalar</p>
          <p className="truncate text-xs font-semibold text-slate-500">{statusText}</p>
        </div>
        {apiUnreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-black text-primary hover:bg-primary/10"
          >
            O'qilgan deb belgilash
          </button>
        ) : null}
      </div>

      <div className="max-h-[min(24rem,calc(100dvh-10rem))] overflow-y-auto">
        {isLoading && items.length === 0 ? (
          <NotificationsListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            compact
            variant="messages"
            title="Bildirishnoma yo'q"
            description="Sharh holati, yoqtirishlar va chat xabarlari shu yerda ko'rinadi."
            className="mx-3 my-4 border-none bg-transparent dark:bg-transparent"
          />
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleOpen(item)}
                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 ${
                    item.is_read ? "opacity-75" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary ${
                      item.is_read ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                      {kindLabel(item.kind)}
                    </span>
                    <span className="mt-1 block truncate font-black text-slate-950 dark:text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.body}
                    </span>
                    {!item.is_synthetic ? (
                      <span className="mt-1 block text-[11px] font-semibold text-slate-400">
                        {formatWhen(item.created_at)}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
