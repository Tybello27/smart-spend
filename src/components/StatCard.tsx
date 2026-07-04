import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  accent?: "ink" | "mint" | "flare";
  delay?: number;
}

const accents = {
  ink: "from-ink-600 to-ink-400 shadow-ink-500/30",
  mint: "from-mint-500 to-mint-400 shadow-mint-500/30",
  flare: "from-flare-500 to-flare-400 shadow-flare-500/30",
};

export default function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "ink",
  delay = 0,
}: Props) {
  return (
    <motion.div
      className="card group relative overflow-hidden rounded-2xl p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${accents[accent]} opacity-10 blur-xl transition-opacity group-hover:opacity-25`}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${accents[accent]} text-base shadow-lg`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
    </motion.div>
  );
}
