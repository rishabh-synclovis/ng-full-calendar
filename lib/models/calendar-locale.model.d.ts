export type CalendarTimeFormat = '12h' | '24h';
type WeekdayNames = [string, string, string, string, string, string, string];
type MonthNames = [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
];
/**
 * Custom weekday/month names and time format, so the calendar can be translated
 * without depending on the browser's Intl/locale data. Any field left unset falls
 * back to the built-in English defaults.
 */
export interface CalendarLocale {
    /** 7 short weekday names starting from Sunday, e.g. ['Sun', 'Mon', ..., 'Sat']. Used in month/week grid headers. */
    weekdayNamesShort?: WeekdayNames;
    /** 7 full weekday names starting from Sunday, e.g. ['Sunday', ..., 'Saturday']. Used in agenda rows and the day-view title. */
    weekdayNamesLong?: WeekdayNames;
    /** 12 short month names, e.g. ['Jan', 'Feb', ..., 'Dec']. Used in the agenda month label and week-range titles. */
    monthNamesShort?: MonthNames;
    /** 12 full month names, e.g. ['January', ..., 'December']. Used in the toolbar title. */
    monthNamesLong?: MonthNames;
    /** Whether event/hour times render as 12-hour ('9:00 AM') or 24-hour ('09:00'). Defaults to '12h'. */
    timeFormat?: CalendarTimeFormat;
}
/** A `CalendarLocale` with every field guaranteed present (see `resolveLocale`). */
export interface ResolvedCalendarLocale {
    weekdayNamesShort: WeekdayNames;
    weekdayNamesLong: WeekdayNames;
    monthNamesShort: MonthNames;
    monthNamesLong: MonthNames;
    timeFormat: CalendarTimeFormat;
}
export declare const DEFAULT_WEEKDAY_NAMES_SHORT: WeekdayNames;
export declare const DEFAULT_WEEKDAY_NAMES_LONG: WeekdayNames;
export declare const DEFAULT_MONTH_NAMES_SHORT: MonthNames;
export declare const DEFAULT_MONTH_NAMES_LONG: MonthNames;
/** Fills in any unset fields of a partial CalendarLocale with the built-in English defaults. */
export declare function resolveLocale(locale: CalendarLocale | null | undefined): ResolvedCalendarLocale;
export {};
