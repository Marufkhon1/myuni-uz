export function sortTypingQueue(users) {
  return [...(users || [])]
    .filter((item) => item?.name)
    .sort((left, right) => {
      const leftTime = left.at ? new Date(left.at).getTime() : 0;
      const rightTime = right.at ? new Date(right.at).getTime() : 0;
      if (leftTime !== rightTime) {
        return leftTime - rightTime;
      }
      return (left.id ?? 0) - (right.id ?? 0);
    });
}

export function pickActiveTyper(sortedUsers, preferredIndex = 0) {
  if (!sortedUsers.length) {
    return { typer: null, index: 0 };
  }

  const safeIndex = preferredIndex % sortedUsers.length;
  const preferred = sortedUsers[safeIndex];
  if (preferred && sortedUsers.some((item) => item.id === preferred.id)) {
    return { typer: preferred, index: safeIndex };
  }

  return { typer: sortedUsers[0], index: 0 };
}
