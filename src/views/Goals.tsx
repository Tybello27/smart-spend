import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "../lib/store";
import Ring from "../components/Ring";
import { fmt } from "../lib/format";
import { buildBadges, computeStreak } from "../lib/insights";

export default function Goals() {
  const { expenses, settings, saveSettings, totals } = useStore();
  const c = settings.currency;
  const [goal, setGoal] = useState(String(settings.savingsGoal));
  const [saved, setSaved] = useState(String(settings.savedAmount));
  const [budget, setBudget] = useState(String(settings.dailyBudget));

  const pct = settings.savingsGoal
    ? settings.savedAmount / settings.savingsGoal
    : 0;
  const streak = computeStreak(expenses);
  const underBudgetDays = 5; // demo heuristic
  const badges = buildBadges(streak, pct * 100, underBudgetDays);

  const apply = () => {
    saveSettings({
      savingsGoal: parseFloat(goal) || 0,
      savedAmount: parseFloat(saved) || 0,
      dailyBudget: parseFloat(budget) || 0,
    });
  };

  const remaining = Math.max(0, settings.savingsGoal - settings.savedAmount);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <motion.div
        className="card flex flex-col items-center rounded-2xl p-8 lg:col-span-2"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="mb-6 self-start font-display text-lg font-bold">
          Savings goal
        </h3>
        <Ring progress={pct} size={220} stroke={16}>
          <span className="font-display text-4xl font-extrabold">
            {Math.round(pct * 100)}%
          </span>
          <span className="mt-1 text-xs font-medium text-slate-400">complete</span>
        </Ring>
        <div className="mt-6 w-full space-y-1 text-center">
          <p className="font-display text-xl font-bold">
            {fmt(settings.savedAmount, c)}{" "}
            <span className="text-sm font-medium text-slate-400">
              / {fmt(settings.savingsGoal, c)}
            </span>
          </p>
          <p className="text-sm font-semibold text-mint-600 dark:text-mint-400">
            {pct >= 1
              ? "🎉 Goal smashed! Time to set a bigger one."
              : pct >= 0.75
              ? "You are so close 🔥"
              : pct >= 0.4
              ? "Great progress! Keep going 🚀"
              : "The journey begins 🌱"}
          </p>
          {remaining > 0 && (
            <p className="text-xs text-slate-400">
              {fmt(remaining, c)} left to reach your goal
            </p>
          )}
        </div>
      </motion.div>

      <div className="space-y-6 lg:col-span-3">
        <motion.div
          className="card rounded-2xl p-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h3 className="mb-5 font-display text-lg font-bold">Set your targets</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`Savings goal (${c})`} value={goal} onChange={setGoal} />
            <Field label={`Saved so far (${c})`} value={saved} onChange={setSaved} />
            <Field label={`Daily budget (${c})`} value={budget} onChange={setBudget} />
          </div>
          <button
            onClick={apply}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-ink-600 to-ink-500 py-3 font-display font-semibold text-white shadow-lg shadow-ink-500/30 transition hover:shadow-ink-500/50 active:scale-[0.98] sm:w-auto sm:px-8"
          >
            Save targets
          </button>
          <p className="mt-3 text-xs text-slate-400">
            Today's spend so far: {fmt(totals.today, c)} of {fmt(settings.dailyBudget, c)} budget.
          </p>
        </motion.div>

        <motion.div
          className="card rounded-2xl p-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
        >
          <h3 className="mb-1 font-display text-lg font-bold">Your badges</h3>
          <p className="mb-5 text-xs text-slate-400">
            Earn rewards for staying consistent.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`relative flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center ${
                  b.earned
                    ? "border-mint-500/40 bg-gradient-to-b from-mint-500/10 to-transparent"
                    : "border-dashed border-slate-200 opacity-60 dark:border-white/10"
                }`}
              >
                <span
                  className={`text-3xl ${b.earned ? "" : "grayscale"}`}
                  aria-hidden
                >
                  {b.emoji}
                </span>
                <span className="text-sm font-bold leading-tight">{b.label}</span>
                <span className="text-[11px] text-slate-400">
                  {b.earned ? "Unlocked ✓" : b.hint}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        value={value}
        inputMode="decimal"
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        className="input"
      />
    </label>
  );
}
