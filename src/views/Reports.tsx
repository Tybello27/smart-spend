import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { buildInsights, last7Days } from "../lib/insights";
import WeeklyChart from "../components/WeeklyChart";
import { fmt, prettyDate } from "../lib/format";

export default function Reports() {
  const { expenses, settings } = useStore();
  const c = settings.currency;
  const days = last7Days(expenses);
  const insights = buildInsights(expenses);

  const spentDays = days.filter((d) => d.amount > 0);
  const highest = [...days].sort((a, b) => b.amount - a.amount)[0];
  const lowest =
    spentDays.length > 0
      ? [...spentDays].sort((a, b) => a.amount - b.amount)[0]
      : days[0];
  const weekTotal = days.reduce((s, d) => s + d.amount, 0);
  const avg = weekTotal / 7;

  return (
    <div className="space-y-6">
      <motion.div
        className="card rounded-2xl p-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">Weekly spending report</h3>
            <p className="text-xs text-slate-400">Last 7 days</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Week total
            </p>
            <p className="font-display text-2xl font-extrabold">{fmt(weekTotal, c)}</p>
          </div>
        </div>
        <WeeklyChart data={days} currency={c} />
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          icon="📈"
          label="Highest day"
          value={fmt(highest.amount, c)}
          sub={prettyDate(highest.iso)}
          tone="flare"
          delay={0.05}
        />
        <Metric
          icon="📉"
          label="Lowest day"
          value={fmt(lowest.amount, c)}
          sub={prettyDate(lowest.iso)}
          tone="mint"
          delay={0.1}
        />
        <Metric
          icon="⚖️"
          label="Daily average"
          value={fmt(avg, c)}
          sub={`Budget ${fmt(settings.dailyBudget, c)}`}
          tone="ink"
          delay={0.15}
        />
      </div>

      <motion.div
        className="card rounded-2xl p-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-ink-600 to-ink-400 text-sm text-white">
            💡
          </span>
          What the data says
        </h3>
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                ins.tone === "good"
                  ? "border-mint-500/25 bg-mint-500/5"
                  : ins.tone === "warn"
                  ? "border-flare-500/25 bg-flare-500/5"
                  : "border-ink-500/20 bg-ink-500/5"
              }`}
            >
              <span className="text-xl">{ins.icon}</span>
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {ins.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
  tone,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  tone: "ink" | "mint" | "flare";
  delay: number;
}) {
  const bar =
    tone === "mint"
      ? "from-mint-500 to-mint-400"
      : tone === "flare"
      ? "from-flare-500 to-flare-400"
      : "from-ink-600 to-ink-400";
  return (
    <motion.div
      className="card overflow-hidden rounded-2xl p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className={`mb-3 h-1 w-10 rounded-full bg-gradient-to-r ${bar}`} />
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="text-base">{icon}</span> {label}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>
    </motion.div>
  );
}
