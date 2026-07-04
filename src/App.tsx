import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { StoreProvider, useStore } from "./lib/store";
import { useTheme } from "./lib/theme";
import type { Expense } from "./lib/types";
import { fmt } from "./lib/format";
import Dashboard from "./views/Dashboard";
import History from "./views/History";
import Reports from "./views/Reports";
import Goals from "./views/Goals";
import AddExpenseModal from "./components/AddExpenseModal";
import InstallPrompt from "./components/InstallPrompt";
import { useInstallPrompt } from "./lib/pwa";

type Tab = "dashboard" | "history" | "reports" | "goals";

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "history", label: "History", icon: "≡" },
  { id: "reports", label: "Reports", icon: "◔" },
  { id: "goals", label: "Goals", icon: "◎" },
];

function Shell() {
  const { dark, toggle } = useTheme();
  const { settings, totals } = useStore();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setModalOpen(true);
  };

  const titles: Record<Tab, string> = {
    dashboard: "Dashboard",
    history: "Expense History",
    reports: "Weekly Report",
    goals: "Savings & Goals",
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -left-24 top-10 h-72 w-72 rounded-full bg-ink-400/20 blur-3xl" />
        <div className="animate-float-slow absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-mint-400/15 blur-3xl [animation-delay:-4s]" />
      </div>

      {/* sidebar (desktop) */}
      <aside className="sticky top-0 z-20 hidden h-screen w-64 shrink-0 flex-col border-r border-black/5 px-5 py-7 lg:flex dark:border-white/5">
        <Brand />
        <nav className="mt-10 flex flex-col gap-1.5">
          {NAV.map((n) => (
            <NavItem
              key={n.id}
              active={tab === n.id}
              icon={n.icon}
              label={n.label}
              onClick={() => setTab(n.id)}
            />
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-ink-600 to-ink-700 p-4 text-white">
            <p className="text-xs text-white/70">Spent today</p>
            <p className="font-display text-xl font-extrabold">
              {fmt(totals.today, settings.currency)}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-mint-400 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (totals.today / (settings.dailyBudget || 1)) * 100,
                  )}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-white/60">
              Budget {fmt(settings.dailyBudget, settings.currency)}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="w-full rounded-xl bg-gradient-to-r from-ink-600 to-ink-500 py-3 font-display text-sm font-semibold text-white shadow-lg shadow-ink-500/30 transition hover:scale-[1.02]"
          >
            + Add expense
          </button>
          {!installed && canInstall && (
            <button
              onClick={() => promptInstall()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-500/30 bg-ink-500/5 py-2.5 font-display text-xs font-semibold text-ink-600 transition hover:bg-ink-500/10 dark:text-ink-300"
            >
              <span>⬇️</span> Install SmartSpend App
            </button>
          )}
        </div>
      </aside>

      {/* main */}
      <div className="relative z-10 flex-1 pb-28 lg:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 px-5 py-4 backdrop-blur-xl sm:px-8 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {titles[tab]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-white/60 text-lg transition hover:scale-105 dark:border-white/10 dark:bg-white/5"
              title="Toggle theme"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <div className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-white/60 py-1.5 pl-1.5 pr-3.5 dark:border-white/10 dark:bg-white/5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-ink-600 to-mint-500 font-display text-sm font-bold text-white">
                {settings.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none">Hi, {settings.name}</p>
                <p className="text-[11px] text-slate-400">Welcome back 👋</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <h1 className="mb-5 font-display text-2xl font-bold tracking-tight lg:hidden">
            {titles[tab]}
          </h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "dashboard" && <Dashboard onAdd={openAdd} />}
              {tab === "history" && <History onEdit={openEdit} />}
              {tab === "reports" && <Reports />}
              {tab === "goals" && <Goals />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-black/5 bg-white/80 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#0d0d16]/85">
        {NAV.slice(0, 2).map((n) => (
          <MobileTab key={n.id} n={n} active={tab === n.id} onClick={() => setTab(n.id)} />
        ))}
        <button
          onClick={openAdd}
          className="-mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-ink-600 to-ink-500 text-2xl text-white shadow-xl shadow-ink-500/40 transition active:scale-90"
        >
          +
        </button>
        {NAV.slice(2).map((n) => (
          <MobileTab key={n.id} n={n} active={tab === n.id} onClick={() => setTab(n.id)} />
        ))}
      </nav>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
      />

      <InstallPrompt />
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-ink-600 to-mint-500 shadow-lg shadow-ink-500/30">
        <span className="font-display text-lg font-black text-white">S</span>
      </div>
      {!compact && (
        <div>
          <p className="font-display text-lg font-extrabold leading-none tracking-tight">
            Smart<span className="text-ink-500">Spend</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            spend smarter
          </p>
        </div>
      )}
      {compact && (
        <p className="font-display text-lg font-extrabold tracking-tight">
          Smart<span className="text-ink-500">Spend</span>
        </p>
      )}
    </div>
  );
}

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
        active
          ? "text-ink-700 dark:text-white"
          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      }`}
    >
      {active && (
        <motion.span
          layoutId="navpill"
          className="absolute inset-0 rounded-xl bg-ink-50 dark:bg-white/8"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative text-base">{icon}</span>
      <span className="relative">{label}</span>
    </button>
  );
}

function MobileTab({
  n,
  active,
  onClick,
}: {
  n: { label: string; icon: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold transition ${
        active ? "text-ink-600 dark:text-ink-300" : "text-slate-400"
      }`}
    >
      <span className="text-lg">{n.icon}</span>
      {n.label}
    </button>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
