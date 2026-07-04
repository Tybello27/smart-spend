import type { CategoryId, Expense } from "./types";
import { catOf } from "./types";
import { dayLabel, isoDaysAgo } from "./format";

export interface DayPoint {
  iso: string;
  label: string;
  amount: number;
  isToday: boolean;
}

/** last 7 days including today, oldest -> newest */
export function last7Days(expenses: Expense[]): DayPoint[] {
  const days: DayPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const iso = isoDaysAgo(i);
    const amount = expenses
      .filter((e) => e.date === iso)
      .reduce((s, e) => s + e.amount, 0);
    days.push({ iso, label: dayLabel(iso), amount, isToday: i === 0 });
  }
  return days;
}

export interface Insight {
  icon: string;
  text: string;
  tone: "info" | "good" | "warn";
}

function sumBy(expenses: Expense[], from: string, to: string) {
  const by: Record<CategoryId, number> = {
    food: 0,
    transport: 0,
    bills: 0,
    shopping: 0,
    others: 0,
  };
  for (const e of expenses) {
    if (e.date >= from && e.date <= to) by[e.category] += e.amount;
  }
  return by;
}

export function buildInsights(expenses: Expense[]): Insight[] {
  const out: Insight[] = [];
  const thisWeek = sumBy(expenses, isoDaysAgo(6), isoDaysAgo(0));
  const lastWeek = sumBy(expenses, isoDaysAgo(13), isoDaysAgo(7));

  // top category this week
  const entries = Object.entries(thisWeek) as [CategoryId, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const top = entries.sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] > 0) {
    const pct = Math.round((top[1] / total) * 100);
    out.push({
      icon: catOf(top[0]).emoji,
      text: `Most of your money (${pct}%) goes into ${catOf(top[0]).label}.`,
      tone: "info",
    });
  }

  // category week-over-week deltas
  for (const [id, now] of entries) {
    const prev = lastWeek[id];
    if (prev > 0 && now > 0) {
      const delta = Math.round(((now - prev) / prev) * 100);
      if (Math.abs(delta) >= 10) {
        out.push({
          icon: catOf(id).emoji,
          text:
            delta > 0
              ? `You spent ${delta}% more on ${catOf(id).label} this week.`
              : `${catOf(id).label} spending decreased by ${Math.abs(delta)}%.`,
          tone: delta > 0 ? "warn" : "good",
        });
      }
    }
  }

  // weekend heavy check
  let weekend = 0,
    weekday = 0;
  for (const e of expenses) {
    if (e.date >= isoDaysAgo(13)) {
      const day = new Date(e.date + "T00:00:00").getDay();
      if (day === 0 || day === 6) weekend += e.amount;
      else weekday += e.amount;
    }
  }
  if (weekend > weekday * 0.6 && weekend > 0) {
    out.push({
      icon: "🎉",
      text: "You tend to spend heavily on weekends — plan a weekend cap.",
      tone: "warn",
    });
  }

  if (out.length < 3) {
    out.push({
      icon: "🌱",
      text: "Log a few more expenses to unlock deeper insights.",
      tone: "info",
    });
  }

  return out.slice(0, 4);
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
  hint: string;
}

export function computeStreak(expenses: Expense[]): number {
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const iso = isoDaysAgo(i);
    const has = expenses.some((e) => e.date === iso);
    if (has) streak++;
    else if (i === 0) continue; // today may be empty, keep looking
    else break;
  }
  return streak;
}

export function buildBadges(
  streak: number,
  savedPct: number,
  underBudgetDays: number,
): Badge[] {
  return [
    {
      id: "smart",
      label: "Smart Spender",
      emoji: "🧠",
      earned: streak >= 3,
      hint: "Track 3 days in a row",
    },
    {
      id: "budget",
      label: "Budget Master",
      emoji: "🎯",
      earned: underBudgetDays >= 5,
      hint: "Stay under budget 5 days",
    },
    {
      id: "saver",
      label: "Saver Pro",
      emoji: "💎",
      earned: savedPct >= 40,
      hint: "Reach 40% of savings goal",
    },
    {
      id: "streak30",
      label: "Consistency King",
      emoji: "👑",
      earned: streak >= 30,
      hint: "30-day tracking streak",
    },
  ];
}
