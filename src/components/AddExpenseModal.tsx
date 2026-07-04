import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CATEGORIES, type CategoryId, type Expense } from "../lib/types";
import { todayISO } from "../lib/format";
import { useStore } from "../lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Expense | null;
  onSaved?: () => void;
}

export default function AddExpenseModal({
  open,
  onClose,
  editing,
  onSaved,
}: Props) {
  const { addExpense, updateExpense } = useStore();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setTitle(editing.title);
        setAmount(String(editing.amount));
        setCategory(editing.category);
        setDate(editing.date);
        setNote(editing.note ?? "");
      } else {
        setTitle("");
        setAmount("");
        setCategory("food");
        setDate(todayISO());
        setNote("");
      }
      setSuccess(false);
    }
  }, [open, editing]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!title.trim() || !amt || amt <= 0) return;
    if (editing) {
      updateExpense(editing.id, {
        title: title.trim(),
        amount: amt,
        category,
        date,
        note: note.trim(),
      });
      onSaved?.();
      onClose();
      return;
    }
    addExpense({ title: title.trim(), amount: amt, category, date, note: note.trim() });
    setSuccess(true);
    onSaved?.();
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1100);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="card relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <AnimatePresence>
              {success && (
                <motion.div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#14141f]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-mint-500 text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  >
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                      <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                      />
                    </svg>
                  </motion.div>
                  <p className="font-display text-lg font-bold">Expense added!</p>
                  <p className="text-sm text-slate-500">Dashboard updated ✨</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between px-6 pt-6">
              <h3 className="font-display text-xl font-bold">
                {editing ? "Edit expense" : "Add expense"}
              </h3>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4 px-6 pb-8 pt-5">
              <Field label="Title">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lunch at cafe"
                  className="input"
                />
              </Field>
              <Field label="Amount">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  inputMode="decimal"
                  placeholder="0"
                  className="input"
                />
              </Field>
              <Field label="Category">
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[11px] font-semibold transition ${
                        category === c.id
                          ? "border-ink-500 bg-ink-50 text-ink-700 dark:border-ink-400 dark:bg-ink-500/15 dark:text-ink-200"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
                      }`}
                    >
                      <span className="text-lg">{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Note (optional)">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note"
                    className="input"
                  />
                </Field>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-ink-600 to-ink-500 py-3 font-display font-semibold text-white shadow-lg shadow-ink-500/30 transition hover:shadow-ink-500/50 active:scale-[0.98]"
              >
                {editing ? "Save changes" : "Add expense"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
