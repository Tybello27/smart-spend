export const fmt = (n: number, currency = "₦") =>
  currency +
  Math.round(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const isoDaysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString().slice(0, 10);
};

export const startOfWeek = () => {
  const dt = new Date();
  const day = (dt.getDay() + 6) % 7; // Mon=0
  dt.setDate(dt.getDate() - day);
  return dt.toISOString().slice(0, 10);
};

export const startOfMonth = () => {
  const dt = new Date();
  return new Date(dt.getFullYear(), dt.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

export const dayLabel = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

export const prettyDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
