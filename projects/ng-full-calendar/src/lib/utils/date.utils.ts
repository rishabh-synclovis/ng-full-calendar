export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Adds whole months to `date`, clamping the day-of-month to the last valid day
 * of the target month instead of letting it overflow into the following month
 * (e.g. Jan 31 + 1 month lands on Feb 28/29, not Mar 3).
 */
export function addMonths(date: Date, months: number): Date {
  const targetMonth = date.getMonth() + months;
  const daysInTargetMonth = new Date(date.getFullYear(), targetMonth + 1, 0).getDate();
  const d = new Date(date);
  d.setDate(Math.min(d.getDate(), daysInTargetMonth));
  d.setMonth(targetMonth);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** Sunday = 0 ... Saturday = 6. Returns the first day of the week containing `date`. */
export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 0): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(d, -diff);
}

export function endOfWeek(date: Date, weekStartsOn: 0 | 1 = 0): Date {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Builds the full 6-week (42 day) grid used by month view, including leading/trailing days. */
export function buildMonthGrid(date: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  const firstOfMonth = startOfMonth(date);
  const gridStart = startOfWeek(firstOfMonth, weekStartsOn);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function buildWeekGrid(date: Date, weekStartsOn: 0 | 1 = 0): Date[] {
  const start = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function clampToDay(date: Date, day: Date): Date {
  const clamped = new Date(date);
  if (!isSameDay(date, day)) {
    return date < day ? startOfDay(day) : endOfDay(day);
  }
  return clamped;
}

export function formatMonthTitle(date: Date, monthNamesLong: readonly string[]): string {
  return `${monthNamesLong[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatWeekRangeTitle(
  date: Date,
  weekStartsOn: 0 | 1 = 0,
  monthNamesShort: readonly string[]
): string {
  const start = startOfWeek(date, weekStartsOn);
  const end = endOfWeek(date, weekStartsOn);
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = `${monthNamesShort[start.getMonth()]} ${start.getDate()}`;
  const endStr = sameMonth
    ? `${end.getDate()}, ${end.getFullYear()}`
    : `${monthNamesShort[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  return `${startStr} – ${endStr}`;
}

export function formatDayTitle(
  date: Date,
  weekdayNamesLong: readonly string[],
  monthNamesLong: readonly string[]
): string {
  return `${weekdayNamesLong[date.getDay()]}, ${monthNamesLong[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Formats a time-of-day as 12-hour ('9:05 AM') or 24-hour ('09:05') per `timeFormat`. */
export function formatTime(date: Date, timeFormat: '12h' | '24h'): string {
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (timeFormat === '24h') {
    const hours = String(date.getHours()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  const hour12 = date.getHours() % 12 || 12;
  const suffix = date.getHours() < 12 ? 'AM' : 'PM';
  return `${hour12}:${minutes} ${suffix}`;
}

/** ISO-8601 week number (1-53). */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}
