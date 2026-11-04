function formatDayDateMonth(rawDate?: string): string {
  if (!rawDate || typeof rawDate !== "string") return "";
  const trimmed = rawDate.trim();
  if (!trimmed) return "";

  const timeMatch = trimmed.match(/\s+at\s+([0-9:]+\s*[APMapm]+(?:\s*to\s*[0-9:]+\s*[APMapm]+)?)/i);
  const timeSuffix = timeMatch ? ` at ${timeMatch[1]}` : "";
  const dateOnly = trimmed.replace(/\s+at\s+[0-9:]+\s*[APMapm]+(?:\s*to\s*[0-9:]+\s*[APMapm]+)?/i, "").trim();

  const ddmmyyyy = dateOnly.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  let d: Date | null = null;
  if (ddmmyyyy) {
    d = new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
  } else {
    const parsed = new Date(dateOnly);
    if (!isNaN(parsed.getTime())) d = parsed;
  }

  if (d && !isNaN(d.getTime())) {
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    return `${weekday}, ${day} ${month}${timeSuffix}`;
  }

  return trimmed;
}

export { formatDayDateMonth };

