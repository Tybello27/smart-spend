import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { CATEGORIES } from "../lib/types";
import { fmt } from "../lib/format";
import StatCard from "../components/StatCard";
import Ring from "../components/Ring";
import { buildInsights, computeStreak } from "../lib/insights";

export default function Dashboard({ onAdd }: { onAdd: () => void }) {
  const { expenses, settings, totals } = useStore();
  const c = settings.currency;
  const insights = buildInsights(expenses);
  const streak = computeStreak(expenses);
  const savedPct = settings.savingsGoal
    ? settings.savedAmount / settings.savingsGoal
    : 0;

  const overBudget = totals.today - settings.dailyBudget;
  const catTotal = totals.monthTotal || 1;

  return (
    <div className="space-y-6">
      {/* budget warning */}
      {overBudget > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-flare-500/30 bg-flare-500/10 px-4 py-3 text-sm font-semibold text-flare-600 dark:text-flare-400"
        >
          <span className="text-lg">⚠️</span>
          You exceeded today's budget by {fmt(overBudget, c)} — ease off a little!
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-mint-500/30 bg-mint-500/10 px-4 py-3 text-sm font-semibold text-mint-600 dark:text-mint-400"
        >
          <span className="text-lg">✅</span>
          You're {fmt(Math.abs(overBudget), c)} under today's budget. Nice discipline!
        </motion.div>
      )}

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today"
          value={fmt(totals.today, c)}
          sub={`Budget ${fmt(settings.dailyBudget, c)}`}
          icon="📆"
          accent={overBudget > 0 ? "flare" : "ink"}
          delay={0}
        />
        <StatCard
          label="This week"
          value={fmt(totals.week, c)}
          sub="Mon – today"
          icon="🗓️"
          accent="ink"
          delay={0.06}
        />
        <StatCard
          label="This month"
          value={fmt(totals.month, c)}
          sub={`${expenses.length} entries`}
          icon="📊"
          accent="ink"
          delay={0.12}
        />
        <StatCard
          label="Saved"
          value={fmt(settings.savedAmount, c)}
          sub={`${Math.round(savedPct * 100)}% of goal`}
          icon="💰"
          accent="mint"
          delay={0.18}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* category breakdown */}
        <motion.div
          className="card rounded-2xl p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Spending by category</h3>
              <p className="text-xs text-slate-400">This month</p>
            </div>
            <button
              onClick={onAdd}
              className="hidden rounded-xl bg-gradient-to-r from-ink-600 to-ink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-ink-500/25 transition hover:scale-105 sm:block"
            >
              + Add expense
            </button>
          </div>
          <div className="space-y-4">
            {CATEGORIES.map((cat, i) => {
              const amt = totals.byCategory[cat.id];
              const pct = Math.round((amt / catTotal) * 100);
              return (
                <div key={cat.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="text-base">{cat.emoji}</span>
                      {cat.label}
                    </span>
                    <span className="font-semibold text-slate-500">
                      {fmt(amt, c)}{" "}
                      <span className="text-xs text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.9,
                        delay: 0.3 + i * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* savings ring */}
        <motion.div
          className="card flex flex-col items-center justify-center rounded-2xl p-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
        >
          <h3 className="mb-4 self-start font-display text-lg font-bold">
            Savings goal
          </h3>
          <Ring progress={savedPct} size={190}>
            <span className="font-display text-3xl font-extrabold">
              {Math.round(savedPct * 100)}%
            </span>
            <span className="mt-1 text-xs font-medium text-slate-400">
              {fmt(settings.savedAmount, c)} / {fmt(settings.savingsGoal, c)}
            </span>
          </Ring>
          <p className="mt-4 text-center text-sm font-semibold text-mint-600 dark:text-mint-400">
            {savedPct >= 0.75
              ? "Almost there! 🔥"
              : savedPct >= 0.4
              ? "Great progress! Keep going 🚀"
              : "Every naira counts 🌱"}
          </p>
        </motion.div>
      </div>

      {/* insights + streak */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          className="card rounded-2xl p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.5 }}
        >
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-ink-600 to-ink-400 text-sm text-white">
              ✨
            </span>
            Smart insights
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
                  ins.tone === "good"
                    ? "border-mint-500/25 bg-mint-500/5"
                    : ins.tone === "warn"
                    ? "border-flare-500/25 bg-flare-500/5"
                    : "border-ink-500/20 bg-ink-500/5"
                }`}
              >
                <span className="text-lg">{ins.icon}</span>
                <span className="font-medium leading-snug text-slate-600 dark:text-slate-300">
                  {ins.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="card flex flex-col justify-between rounded-2xl bg-gradient-to-br from-ink-600 to-ink-700 p-6 text-white"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div>
            <p className="text-sm font-medium text-white/70">Tracking streak</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-5xl font-extrabold">{streak}</span>
              <span className="mb-1.5 text-lg font-semibold text-white/80">days</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < Math.min(streak, 7) ? "bg-mint-400" : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-sm font-medium text-white/80">
            {streak >= 7
              ? "🔥 One week strong — you're unstoppable!"
              : "Log an expense each day to build your streak."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
