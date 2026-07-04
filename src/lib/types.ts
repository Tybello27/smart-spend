export type CategoryId =
  | "food"
  | "transport"
  | "bills"
  | "shopping"
  | "others";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** tailwind text/bg tokens as raw hex for charts */
  color: string;
  soft: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: CategoryId;
  date: string; // ISO yyyy-mm-dd
  note?: string;
  createdAt: number;
}

export interface Settings {
  dailyBudget: number;
  savingsGoal: number;
  savedAmount: number;
  currency: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food", emoji: "🍔", color: "#f97316", soft: "#fff1e6" },
  { id: "transport", label: "Transport", emoji: "🚗", color: "#5b5ef2", soft: "#ecedff" },
  { id: "bills", label: "Bills", emoji: "💡", color: "#eab308", soft: "#fef7dd" },
  { id: "shopping", label: "Shopping", emoji: "🛒", color: "#ec4899", soft: "#fde7f2" },
  { id: "others", label: "Others", emoji: "📦", color: "#10b981", soft: "#e2f7ee" },
];

export const catOf = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[4];
