import { hasMatchedUniversity, matchUniversityByText } from "./universityMatch.js";

const STORAGE_KEY = "myuni_applicant_checklist_v1";

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStored(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function markApplicantChecklistStep(stepId) {
  if (!stepId) {
    return;
  }
  const stored = readStored();
  if (stored[stepId]) {
    return;
  }
  writeStored({ ...stored, [stepId]: true });
}

export function getApplicantChecklistSteps({ profile, joinedChatCount, universities = [] }) {
  return getDashboardChecklistSteps({
    isStudent: false,
    profile,
    joinedChatCount,
    universities,
  });
}

export function getDashboardChecklistSteps({
  isStudent = false,
  profile,
  joinedChatCount,
  universities = [],
}) {
  const stored = readStored();
  const hasProfile = Boolean(profile?.full_name?.trim());
  const hasUniversity = hasMatchedUniversity(universities, profile?.university);
  const hasJoinedChat = joinedChatCount > 0;

  return [
    {
      id: "profile",
      label: "Profilni to'ldiring",
      description: "Ismingizni kiriting",
      done: hasProfile,
      section: "profile",
    },
    {
      id: "university",
      label: "Universitetni tanlang",
      description: isStudent ? "O'qiyotgan OTMni belgilang" : "Qiziqilgan OTMni belgilang",
      done: hasUniversity,
      section: "profile",
    },
    {
      id: "chat",
      label: "Chatga qo'shiling",
      description: isStudent ? "Guruh va shaxsiy xabarlar" : "Talabalardan savol bering",
      done: hasJoinedChat,
      section: "chats",
    },
    {
      id: "reviews",
      label: isStudent ? "Sharh qoldiring" : "Sharhlarni o'qing",
      description: isStudent ? "Tajribangizni ulashing" : "Talabalar tajribasini ko'ring",
      done: Boolean(stored.reviews),
      section: "reviews",
    },
    {
      id: "compare",
      label: "Universitetlarni solishtiring",
      description: "Tanlov uchun taqqoslang",
      done: Boolean(stored.compare),
      section: "compare",
    },
  ];
}

export function getApplicantChecklistProgress(steps) {
  const doneCount = steps.filter((step) => step.done).length;
  return {
    doneCount,
    totalCount: steps.length,
    isComplete: doneCount === steps.length,
  };
}

export function getCompareSuggestion(universities, userUniversityName) {
  if (!universities?.length) {
    return null;
  }

  const myUniversity = matchUniversityByText(universities, userUniversityName);

  const sorted = [...universities].sort((left, right) => {
    const ratingDiff = (right.average_rating ?? 0) - (left.average_rating ?? 0);
    if (ratingDiff !== 0) {
      return ratingDiff;
    }
    return (right.member_count ?? 0) - (left.member_count ?? 0);
  });

  const partner = sorted.find((item) => item.id !== myUniversity?.id) ?? sorted[1] ?? sorted[0];

  if (!myUniversity || !partner || myUniversity.id === partner.id) {
    if (sorted.length >= 2) {
      return { anchor: sorted[0], other: sorted[1] };
    }
    return null;
  }

  return { anchor: myUniversity, other: partner };
}

export function getRecentJoinedChats(universities, joinedUniversityIds, limit = 3) {
  return universities
    .filter((university) => joinedUniversityIds.has(university.id))
    .sort((left, right) => {
      const leftTime = left.last_message?.created_at
        ? new Date(left.last_message.created_at).getTime()
        : 0;
      const rightTime = right.last_message?.created_at
        ? new Date(right.last_message.created_at).getTime()
        : 0;
      return rightTime - leftTime;
    })
    .slice(0, limit);
}
