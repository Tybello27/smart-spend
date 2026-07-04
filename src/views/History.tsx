import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { CATEGORIES, catOf, type CategoryId, type Expense } from "../lib/types";
import { fmt, prettyDate } from "../lib/format";

export default function History({
  onEdit,
}: {
  onEdit: (e: Expense) => void;
}) {
  const { expenses, settings, deleteExpense } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "high" | "low">("newest");
  const c = settings.currency;

  const rows = useMemo(() => {
    let list = expenses.filter((e) => {
      const matchQ =
        !q ||
        e.title.toLowerCase().includes(q.toLowerCase()) ||
        (e.note ?? "").toLowerCase().includes(q.toLowerCase());
      const matchF = filter === "all" || e.category === filter;
      return matchQ && matchF;
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
      if (sort === "oldest") return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
      if (sort === "high") return b.amount - a.amount;
      return a.amount - b.amount;
    });
    return list;
  }, [expenses, q, filter, sort]);

  const total = rows.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      <div className="card rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search expenses…"
              className="input pl-9"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="input sm:w-44"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="high">Highest amount</option>
            <option value="low">Lowest amount</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </Chip>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              active={filter === cat.id}
              onClick={() => setFilter(cat.id)}
            >
              {cat.emoji} {cat.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-sm">
        <span className="font-semibold text-slate-500">
          {rows.length} {rows.length === 1 ? "expense" : "expenses"}
        </span>
        <span className="font-display font-bold">{fmt(total, c)}</span>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {rows.map((e) => {
            const cat = catOf(e.category);
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="card group flex items-center gap-4 rounded-2xl p-3.5 sm:p-4"
              >
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg"
                  style={{ background: cat.soft }}
                >
                  {cat.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{e.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {cat.label} · {prettyDate(e.date)}
                    {e.note ? ` · ${e.note}` : ""}
                  </p>
                </div>
                <span className="font-display font-bold">{fmt(e.amount, c)}</span>
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(e)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-ink-50 hover:text-ink-600 dark:hover:bg-white/10"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteExpense(e.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-flare-500/10 hover:text-flare-500"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {rows.length === 0 && (
          <div className="card rounded-2xl py-16 text-center">
            <p className="text-4xl">🧾</p>
            <p className="mt-3 font-display font-bold">No expenses found</p>
            <p className="text-sm text-slate-400">Try a different search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-ink-600 text-white shadow-md shadow-ink-500/25"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
