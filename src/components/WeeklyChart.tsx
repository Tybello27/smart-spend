import { motion } from "framer-motion";
import type { DayPoint } from "../lib/insights";
import { fmt } from "../lib/format";
import { useState } from "react";

export default function WeeklyChart({
  data,
  currency,
}: {
  data: DayPoint[];
  currency: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex h-52 items-end gap-2 sm:gap-3">
      {data.map((d, i) => {
        const h = (d.amount / max) * 100;
        const active = hover === i;
        return (
          <div
            key={d.iso}
            className="group relative flex flex-1 flex-col items-center gap-2"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {/* tooltip */}
            <div
              className={`pointer-events-none absolute -top-9 z-10 rounded-lg bg-ink-900 px-2 py-1 text-[11px] font-semibold text-white shadow-lg transition-all dark:bg-white dark:text-ink-900 ${
                active ? "opacity-100 -translate-y-0" : "opacity-0 translate-y-1"
              }`}
            >
              {fmt(d.amount, currency)}
            </div>
            <div className="relative flex h-full w-full items-end justify-center">
              <motion.div
                className={`w-full max-w-[34px] rounded-t-xl ${
                  d.isToday
                    ? "bg-gradient-to-t from-ink-600 to-ink-400"
                    : "bg-gradient-to-t from-ink-300 to-ink-200 dark:from-ink-700 dark:to-ink-600"
                } ${active ? "brightness-110" : ""}`}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, 3)}%` }}
                transition={{
                  duration: 0.9,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </div>
            <span
              className={`text-[11px] font-semibold ${
                d.isToday
                  ? "text-ink-600 dark:text-ink-300"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
