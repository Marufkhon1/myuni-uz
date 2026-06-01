import { useSupportChat } from "../../hooks/useSupportChat.js";
import SupportChatModal from "./SupportChatModal.jsx";

export default function DashboardMobileSupport({ isStudent = false }) {
  const {
    isChatModalOpen,
    openChatModal,
    closeChatModal,
    draft,
    setDraft,
    messages,
    setMessages,
  } = useSupportChat(isStudent);

  return (
    <>
      <button
        type="button"
        onClick={openChatModal}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-white shadow-glow transition hover:scale-105 active:scale-95 lg:hidden"
        aria-label="Yordam va qo'llab-quvvatlash"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3c-4.4 0-8 3.1-8 7 0 1.6.6 3.1 1.7 4.3L4 21l4.8-1.2c1 .5 2.1.8 3.2.8 4.4 0 8-3.1 8-7s-3.6-7-8-7Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <SupportChatModal
        isOpen={isChatModalOpen}
        isStudent={isStudent}
        onClose={closeChatModal}
        messages={messages}
        onMessagesChange={setMessages}
        draft={draft}
        onDraftChange={setDraft}
      />
    </>
  );
}
