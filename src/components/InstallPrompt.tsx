import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  dismissInstall,
  installDismissed,
  useInstallPrompt,
} from "../lib/pwa";

export default function InstallPrompt() {
  const { canInstall, installed, isIOS, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);

  // Decide when to reveal the banner.
  useEffect(() => {
    if (installed) return;
    if (installDismissed()) return;
    // Android/Chrome: only when the native prompt is ready.
    // iOS: Safari never fires beforeinstallprompt, so we surface guidance
    // shortly after load instead.
    if (canInstall) {
      setOpen(true);
      return;
    }
    if (isIOS) {
      const t = setTimeout(() => setOpen(true), 2500);
      return () => clearTimeout(t);
    }
  }, [canInstall, isIOS, installed]);

  const close = () => {
    setOpen(false);
    dismissInstall();
  };

  const handleInstall = async () => {
    if (isIOS && !canInstall) {
      setShowIosSheet(true);
      return;
    }
    await promptInstall();
    setOpen(false);
  };

  if (installed) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:pb-6 lg:bottom-4 lg:left-auto lg:right-4 lg:w-96 lg:px-0"
          >
            <div className="card mx-auto flex max-w-md items-center gap-3 rounded-2xl p-3.5 sm:p-4 lg:max-w-none">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-ink-600 to-mint-500 font-display text-lg font-black text-white shadow-lg shadow-ink-500/30">
                S
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold leading-tight">
                  Install SmartSpend App
                </p>
                <p className="truncate text-xs text-slate-400">
                  Add to your home screen for a faster, offline-ready app.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={handleInstall}
                  className="rounded-xl bg-gradient-to-r from-ink-600 to-ink-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-ink-500/30 transition hover:scale-105 active:scale-95"
                >
                  Install
                </button>
                <button
                  onClick={close}
                  aria-label="Dismiss install prompt"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS "Add to Home Screen" guidance */}
      <AnimatePresence>
        {showIosSheet && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
              onClick={() => setShowIosSheet(false)}
            />
            <motion.div
              className="card relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl"
              initial={{ y: 60, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="flex items-center justify-between px-6 pt-6">
                <h3 className="font-display text-xl font-bold">Install on iPhone</h3>
                <button
                  onClick={() => setShowIosSheet(false)}
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 px-6 pb-8 pt-5">
                <p className="text-sm text-slate-500">
                  Add SmartSpend to your Home Screen in two quick steps:
                </p>
                <Step
                  n={1}
                  icon="⬆️"
                  text="Tap the Share button in Safari's toolbar."
                />
                <Step
                  n={2}
                  icon="➕"
                  text={'Choose "Add to Home Screen", then tap Add.'}
                />
                <button
                  onClick={() => {
                    setShowIosSheet(false);
                    close();
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-ink-600 to-ink-500 py-3 font-display font-semibold text-white shadow-lg shadow-ink-500/30 transition active:scale-[0.98]"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ n, icon, text }: { n: number; icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-500/20 bg-ink-500/5 p-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-ink-600 to-ink-500 text-sm font-bold text-white">
        {n}
      </div>
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {text}
      </span>
    </div>
  );
}
