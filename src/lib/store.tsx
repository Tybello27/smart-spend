import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CategoryId, Expense, Settings } from "./types";
import { isoDaysAgo, startOfMonth, startOfWeek, todayISO } from "./format";

const EXPENSE_KEY = "smartspend.expenses.v1";
const SETTINGS_KEY = "smartspend.settings.v1";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function seed(): Expense[] {
  const now = Date.now();
  const rows: Array<[string, number, CategoryId, number, string?]> = [
    ["Jollof rice & chicken", 2500, "food", 0, "Lunch"],
    ["Bus to campus", 800, "transport", 0],
    ["Coffee", 1200, "food", 0],
    ["Groceries", 6400, "shopping", 1],
    ["Data subscription", 3500, "bills", 1],
    ["Ride to work", 1500, "transport", 2],
    ["Movie night", 4000, "shopping", 2, "With friends"],
    ["Dinner", 3200, "food", 3],
    ["Electricity token", 5000, "bills", 4],
    ["Snacks", 900, "food", 4],
    ["Taxi", 2200, "transport", 5],
    ["New notebook", 1800, "shopping", 6],
    ["Breakfast", 1400, "food", 6],
  ];
  return rows.map(([title, amount, category, ago, note], i) => ({
    id: uid(),
    title,
    amount,
    category,
    date: isoDaysAgo(ago),
    note,
    createdAt: now - i * 3600_000,
  }));
}

const defaultSettings: Settings = {
  dailyBudget: 5000,
  savingsGoal: 100000,
  savedAmount: 42000,
  currency: "₦",
  name: "Israel",
};

interface Ctx {
  expenses: Expense[];
  settings: Settings;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  saveSettings: (s: Partial<Settings>) => void;
  totals: {
    today: number;
    week: number;
    month: number;
    byCategory: Record<CategoryId, number>;
    monthTotal: number;
  };
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const raw = localStorage.getItem(EXPENSE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seed();
  });
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name === "Ada") parsed.name = "Israel";
        return { ...defaultSettings, ...parsed };
      }
    } catch {}
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const addExpense: Ctx["addExpense"] = (e) =>
    setExpenses((prev) => [{ ...e, id: uid(), createdAt: Date.now() }, ...prev]);

  const updateExpense: Ctx["updateExpense"] = (id, e) =>
    setExpenses((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x)));

  const deleteExpense: Ctx["deleteExpense"] = (id) =>
    setExpenses((prev) => prev.filter((x) => x.id !== id));

  const saveSettings: Ctx["saveSettings"] = (s) =>
    setSettings((prev) => ({ ...prev, ...s }));

  const totals = useMemo(() => {
    const t = todayISO();
    const w = startOfWeek();
    const m = startOfMonth();
    const byCategory: Record<CategoryId, number> = {
      food: 0,
      transport: 0,
      bills: 0,
      shopping: 0,
      others: 0,
    };
    let today = 0,
      week = 0,
      month = 0,
      monthTotal = 0;
    for (const e of expenses) {
      if (e.date === t) today += e.amount;
      if (e.date >= w) week += e.amount;
      if (e.date >= m) {
        month += e.amount;
        monthTotal += e.amount;
        byCategory[e.category] += e.amount;
      }
    }
    return { today, week, month, byCategory, monthTotal };
  }, [expenses]);

  const value: Ctx = {
    expenses,
    settings,
    addExpense,
    updateExpense,
    deleteExpense,
    saveSettings,
    totals,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
