import { COMPARE_ASPECTS, COMPARE_METRICS } from "./compareRoleContent.js";

export const MIN_COMPARE = 3;
export const MAX_COMPARE = 3;

const COMPOSITE_WEIGHTS = {
  rating: 0.35,
  reviews: 0.25,
  chat: 0.2,
  aspects: 0.2,
};

export function orderCompareUniversities(universities, selectedIds) {
  if (!Array.isArray(universities) || !Array.isArray(selectedIds)) {
    return universities ?? [];
  }
  const order = new Map(selectedIds.map((id, index) => [String(id), index]));
  return [...universities].sort(
    (left, right) => (order.get(String(left.id)) ?? 99) - (order.get(String(right.id)) ?? 99)
  );
}

/** Tavsiya etilgan OTM doim o'rta ustunda (3 ta taqqoslash). */
export function orderCompareUniversitiesWithLeaderCenter(universities, leaderId, selectedIds) {
  const ordered = orderCompareUniversities(universities, selectedIds);
  if (ordered.length !== 3 || leaderId == null) {
    return ordered;
  }

  const leaderIndex = ordered.findIndex((university) => String(university.id) === String(leaderId));
  if (leaderIndex < 0 || leaderIndex === 1) {
    return ordered;
  }

  const leader = ordered[leaderIndex];
  const others = ordered.filter((university) => String(university.id) !== String(leaderId));
  return [others[0], leader, others[1]];
}

const HIGHLIGHT_FIELDS = {
  rating: "average_rating",
  reviews: "review_count",
  chat_activity: "member_count",
};

/** API highlight yo'q bo'lsa ham 3 ta stat kartochka uchun g'olib / durang / bo'sh. */
export function resolveCompareHighlight(universities, highlights, metricKey) {
  const fromApi = highlights?.[metricKey];
  if (fromApi) {
    return { state: "winner", university_id: fromApi.university_id, value: fromApi.value, short_name: fromApi.short_name };
  }

  const field = HIGHLIGHT_FIELDS[metricKey];
  if (!field || !universities?.length) {
    return { state: "empty" };
  }

  const entries = universities.map((university) => ({
    university,
    value: university[field],
  }));

  const numeric = entries
    .map((entry) => ({
      ...entry,
      numeric: entry.value == null || entry.value === "" ? Number.NaN : Number(entry.value),
    }))
    .filter((entry) => !Number.isNaN(entry.numeric));

  if (numeric.length < 2) {
    return { state: "empty" };
  }

  const max = Math.max(...numeric.map((entry) => entry.numeric));
  const winners = numeric.filter((entry) => entry.numeric === max);

  if (winners.length > 1) {
    return {
      state: "tie",
      value: max,
      university_id: winners[0].university.id,
      short_name: winners.map((entry) => entry.university.short_name).join(", "),
    };
  }

  const winner = winners[0].university;
  return {
    state: "winner",
    university_id: winner.id,
    value: max,
    short_name: winner.short_name,
  };
}

export function numericWinner(values, { higherIsBetter = true } = {}) {
  const entries = values
    .map((value, index) => ({
      value: value == null || value === "" ? Number.NaN : Number(value),
      index,
    }))
    .filter((entry) => !Number.isNaN(entry.value));

  if (entries.length < 2) {
    return null;
  }

  const best = entries.reduce((winner, entry) => {
    if (higherIsBetter) {
      return entry.value > winner.value ? entry : winner;
    }
    return entry.value < winner.value ? entry : winner;
  });
  const tied = entries.filter((entry) => entry.value === best.value);
  if (tied.length > 1) {
    return null;
  }
  return best.index;
}

export function hasCompareValue(value, allowZero = false) {
  if (value == null || value === "" || value === "—") {
    return false;
  }
  if (typeof value === "number" && value === 0 && !allowZero) {
    return false;
  }
  return true;
}

export function shouldShowCompareMetric(universities, metric) {
  if (metric.alwaysShow) {
    return true;
  }
  return universities.some((university) =>
    hasCompareValue(university[metric.key], Boolean(metric.allowZero))
  );
}

export function metricMaxValue(values) {
  const numbers = values
    .map((value) => (value == null || value === "" ? Number.NaN : Number(value)))
    .filter((value) => !Number.isNaN(value));
  return numbers.length ? Math.max(...numbers) : 0;
}

function getMetricValues(universities, metricKey, isAspect = false) {
  if (isAspect) {
    return universities.map((university) => university.aspect_averages?.[metricKey]);
  }
  return universities.map((university) => university[metricKey]);
}

function evaluateRow(universities, values, higherIsBetter = true) {
  const numericValues = values.map((value) =>
    value == null || value === "" ? Number.NaN : Number(value)
  );
  const validCount = numericValues.filter((value) => !Number.isNaN(value)).length;

  if (validCount < 2) {
    return { status: "insufficient", winnerId: null };
  }

  const winnerIndex = numericWinner(values, { higherIsBetter });
  if (winnerIndex != null) {
    return { status: "win", winnerId: universities[winnerIndex].id };
  }

  return { status: "tie", winnerId: null };
}

/** Har bir qator bo'yicha g'olib, durang va yetarli emas holatlar. */
export function buildCompareBreakdown(universities) {
  const rows = [];

  COMPARE_METRICS.forEach((metric) => {
    if (metric.text) {
      return;
    }
    const values = getMetricValues(universities, metric.key, false);
    rows.push({
      key: metric.key,
      label: metric.label,
      kind: "metric",
      values,
      ...evaluateRow(universities, values, metric.higherIsBetter !== false),
    });
  });

  COMPARE_ASPECTS.forEach((aspect) => {
    const values = getMetricValues(universities, aspect.key, true);
    rows.push({
      key: aspect.key,
      label: aspect.label,
      kind: "aspect",
      icon: aspect.icon,
      values,
      ...evaluateRow(universities, values),
    });
  });

  return rows;
}

export function computeWinCounts(universities) {
  const counts = Object.fromEntries(universities.map((university) => [university.id, 0]));

  buildCompareBreakdown(universities).forEach((row) => {
    if (row.status === "win" && row.winnerId != null) {
      counts[row.winnerId] += 1;
    }
  });

  return counts;
}

/** Umumiy ball (0–100) — durang bo'lganda ham adolatli yetakchi. */
export function computeCompositeScores(universities) {
  if (!universities.length) {
    return [];
  }

  const maxReviews = Math.max(...universities.map((university) => university.review_count ?? 0), 1);
  const maxMembers = Math.max(...universities.map((university) => university.member_count ?? 0), 1);

  return universities.map((university) => {
    const ratingPart =
      university.average_rating != null ? Number(university.average_rating) / 5 : null;
    const reviewPart = (university.review_count ?? 0) / maxReviews;
    const chatPart = (university.member_count ?? 0) / maxMembers;

    const aspectValues = COMPARE_ASPECTS.map(
      (aspect) => university.aspect_averages?.[aspect.key]
    ).filter((value) => value != null && !Number.isNaN(Number(value)));

    const aspectPart =
      aspectValues.length > 0
        ? aspectValues.reduce((sum, value) => sum + Number(value), 0) / aspectValues.length / 5
        : null;

    const parts = [];
    const weights = [];

    if (ratingPart != null) {
      parts.push(ratingPart);
      weights.push(COMPOSITE_WEIGHTS.rating);
    }
    parts.push(reviewPart);
    weights.push(COMPOSITE_WEIGHTS.reviews);
    parts.push(chatPart);
    weights.push(COMPOSITE_WEIGHTS.chat);
    if (aspectPart != null) {
      parts.push(aspectPart);
      weights.push(COMPOSITE_WEIGHTS.aspects);
    }

    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const score =
      weightSum > 0
        ? parts.reduce((sum, part, index) => sum + part * weights[index], 0) / weightSum
        : 0;

    return {
      universityId: university.id,
      score: Math.round(score * 100),
    };
  });
}

export function buildCompareSummary(universities) {
  const rows = buildCompareBreakdown(universities);
  const winCounts = computeWinCounts(universities);
  const decidedRows = rows.filter((row) => row.status === "win").length;
  const tieRows = rows.filter((row) => row.status === "tie").length;
  const comparableRows = rows.filter((row) => row.status !== "insufficient").length;
  const compositeScores = computeCompositeScores(universities);

  const sortedByWins = [...universities].sort(
    (left, right) => (winCounts[right.id] ?? 0) - (winCounts[left.id] ?? 0)
  );
  const topWins = winCounts[sortedByWins[0]?.id] ?? 0;
  const secondWins = winCounts[sortedByWins[1]?.id] ?? 0;

  let leader = null;
  let leaderSource = null;

  if (topWins > 0 && topWins > secondWins) {
    const composite = compositeScores.find((item) => item.universityId === sortedByWins[0].id);
    leader = {
      university: sortedByWins[0],
      wins: topWins,
      compositeScore: composite?.score ?? null,
    };
    leaderSource = "wins";
  } else {
    const sortedByComposite = [...compositeScores].sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      const uniA = universities.find((university) => university.id === left.universityId);
      const uniB = universities.find((university) => university.id === right.universityId);
      const reviewDiff = (uniB?.review_count ?? 0) - (uniA?.review_count ?? 0);
      if (reviewDiff !== 0) {
        return reviewDiff;
      }
      return (uniB?.member_count ?? 0) - (uniA?.member_count ?? 0);
    });
    const top = sortedByComposite[0];
    const second = sortedByComposite[1];
    if (top && (!second || top.score > second.score || top.universityId !== second.universityId)) {
      const topUniversity = universities.find((university) => university.id === top.universityId);
      if (topUniversity) {
        leader = {
          university: topUniversity,
          wins: winCounts[top.universityId] ?? 0,
          compositeScore: top.score,
        };
        leaderSource =
          topWins > 0 && topWins === secondWins
            ? "composite_tiebreak"
            : top.score === second?.score
              ? "composite_tiebreak"
              : "composite";
      }
    }
  }

  return {
    rows,
    winCounts,
    decidedRows,
    tieRows,
    comparableRows,
    totalRows: rows.length,
    compositeScores,
    leader,
    leaderSource,
  };
}

export function getCompareLeader(universities) {
  return buildCompareSummary(universities).leader;
}

export function rowHasDifference(values) {
  const normalized = values.map((value) => (value == null ? "—" : String(value)));
  return new Set(normalized).size > 1;
}

export function hasAspectComparison(universities) {
  return buildCompareBreakdown(universities).some(
    (row) => row.kind === "aspect" && row.status !== "insufficient"
  );
}

export function relativeBarPercents(values) {
  const numbers = values.map((value) => {
    if (value == null || value === "" || Number.isNaN(Number(value))) {
      return 0;
    }
    return Number(value);
  });
  const max = Math.max(...numbers, 1);
  return numbers.map((value) => Math.round((value / max) * 100));
}

export function formatCompareRating(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(1).replace(/\.0$/, "");
}

/** G'alabalar ulushi — jadvaldagi hal qilingan qatorlarga nisbatan (100% noto'g'ri bo'lmasin). */
export function winSharePercent(wins, decidedRows) {
  if (!decidedRows || decidedRows <= 0) {
    return 0;
  }
  return Math.round((wins / decidedRows) * 100);
}
