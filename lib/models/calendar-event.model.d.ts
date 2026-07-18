export type CalendarNamedColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'teal' | 'gray';
/** One of the 8 built-in named colors, or any CSS hex color (e.g. `'#DA2C43'`). */
export type CalendarEventColor = CalendarNamedColor | (string & {});
export interface CalendarCategory {
    id: string;
    label: string;
    color: CalendarEventColor;
}
export interface CalendarEvent<TMeta = unknown> {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    /** One of the 8 named colors ('blue', 'red', ...) or any hex color string (e.g. '#DA2C43'). */
    color?: CalendarEventColor;
    description?: string;
    location?: string;
    editable?: boolean;
    /** Groups this event under a sidebar category/calendar (e.g. a team, resource, or person). */
    calendarId?: string;
    meta?: TMeta;
}
export interface PositionedEvent {
    event: CalendarEvent;
    /** Column index within an overlap group, 0-based. */
    column: number;
    /** Total number of overlapping columns for this event's group. */
    columnCount: number;
    /** Minutes from the start of the day (for time-grid views). */
    startMinutes: number;
    /** Minutes from the start of the day (for time-grid views). */
    endMinutes: number;
}
export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
    events: CalendarEvent[];
}
export interface SpanningEvent {
    event: CalendarEvent;
    /** 0-based column where the bar starts within the visible week/grid row. */
    startCol: number;
    /** 0-based column (inclusive) where the bar ends within the visible week/grid row. */
    endCol: number;
    /** True if the event continues before the visible range (render a left "continues" cap). */
    continuesBefore: boolean;
    /** True if the event continues after the visible range (render a right "continues" cap). */
    continuesAfter: boolean;
    /** Row/lane index for stacking multiple overlapping spanning events. */
    lane: number;
}
