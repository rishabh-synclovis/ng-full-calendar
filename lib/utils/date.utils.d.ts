export declare function startOfDay(date: Date): Date;
export declare function endOfDay(date: Date): Date;
export declare function addDays(date: Date, days: number): Date;
/**
 * Adds whole months to `date`, clamping the day-of-month to the last valid day
 * of the target month instead of letting it overflow into the following month
 * (e.g. Jan 31 + 1 month lands on Feb 28/29, not Mar 3).
 */
export declare function addMonths(date: Date, months: number): Date;
export declare function isSameDay(a: Date, b: Date): boolean;
export declare function isToday(date: Date): boolean;
/** Sunday = 0 ... Saturday = 6. Returns the first day of the week containing `date`. */
export declare function startOfWeek(date: Date, weekStartsOn?: 0 | 1): Date;
export declare function endOfWeek(date: Date, weekStartsOn?: 0 | 1): Date;
export declare function startOfMonth(date: Date): Date;
export declare function endOfMonth(date: Date): Date;
/** Builds the full 6-week (42 day) grid used by month view, including leading/trailing days. */
export declare function buildMonthGrid(date: Date, weekStartsOn?: 0 | 1): Date[];
export declare function buildWeekGrid(date: Date, weekStartsOn?: 0 | 1): Date[];
export declare function minutesSinceMidnight(date: Date): number;
export declare function clampToDay(date: Date, day: Date): Date;
export declare function formatMonthTitle(date: Date, monthNamesLong: readonly string[]): string;
export declare function formatWeekRangeTitle(date: Date, weekStartsOn: (0 | 1) | undefined, monthNamesShort: readonly string[]): string;
export declare function formatDayTitle(date: Date, weekdayNamesLong: readonly string[], monthNamesLong: readonly string[]): string;
/** Formats a time-of-day as 12-hour ('9:05 AM') or 24-hour ('09:05') per `timeFormat`. */
export declare function formatTime(date: Date, timeFormat: '12h' | '24h'): string;
/** ISO-8601 week number (1-53). */
export declare function isoWeekNumber(date: Date): number;
