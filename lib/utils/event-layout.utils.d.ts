import { CalendarEvent, PositionedEvent, SpanningEvent } from '../models/calendar-event.model';
/**
 * True when an event spans more than one calendar day — either explicitly marked
 * `allDay`, or simply because its start and end fall on different days (e.g. a
 * holiday or multi-day event with real start/end timestamps but no allDay flag).
 * These render as a continuous banner strip instead of a per-day timed block.
 */
export declare function isMultiDay(event: CalendarEvent): boolean;
/**
 * True when a single-day event has no meaningful time-of-day (explicitly `allDay`,
 * or its start and end both sit at midnight) — rendered as a solid pill rather
 * than a dot + time row.
 */
export declare function isEffectivelyAllDay(event: CalendarEvent): boolean;
export declare function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[];
/** Multi-day events (see `isMultiDay`) visible within the range — rendered as banner strips. */
export declare function spanningEventsInRange(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[];
/** Single-day all-day events (not spanning banners) visible within the range. */
export declare function singleDayAllDayEventsInRange(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[];
/**
 * Lays out multi-day events as continuous banner bars across a row of `days`,
 * stacking overlapping events into lanes, mirroring Google Calendar / Bryntum banner rows.
 */
export declare function layoutSpanningEvents(events: CalendarEvent[], days: Date[]): SpanningEvent[];
/**
 * Lays out same-day timed events into side-by-side columns when they overlap,
 * mirroring Google Calendar's day/week grid behaviour.
 */
export declare function layoutDayEvents(events: CalendarEvent[]): PositionedEvent[];
