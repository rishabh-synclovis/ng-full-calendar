import { CalendarEvent, PositionedEvent, SpanningEvent } from '../models/calendar-event.model';
import { isSameDay, minutesSinceMidnight, startOfDay } from './date.utils';

/**
 * True when an event spans more than one calendar day — either explicitly marked
 * `allDay`, or simply because its start and end fall on different days (e.g. a
 * holiday or multi-day event with real start/end timestamps but no allDay flag).
 * These render as a continuous banner strip instead of a per-day timed block.
 */
export function isMultiDay(event: CalendarEvent): boolean {
  return event.allDay === true || !isSameDay(event.start, event.end);
}

/**
 * True when a single-day event has no meaningful time-of-day (explicitly `allDay`,
 * or its start and end both sit at midnight) — rendered as a solid pill rather
 * than a dot + time row.
 */
export function isEffectivelyAllDay(event: CalendarEvent): boolean {
  if (event.allDay === true) {
    return true;
  }
  const isMidnight = (d: Date) => d.getHours() === 0 && d.getMinutes() === 0;
  return isMidnight(event.start) && isMidnight(event.end);
}

export function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => !isMultiDay(e) && !isEffectivelyAllDay(e) && isSameDay(e.start, day));
}

/** Multi-day events (see `isMultiDay`) visible within the range — rendered as banner strips. */
export function spanningEventsInRange(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  return events.filter((e) => isMultiDay(e) && e.start <= rangeEnd && e.end >= rangeStart);
}

/** Single-day all-day events (not spanning banners) visible within the range. */
export function singleDayAllDayEventsInRange(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  return events.filter((e) => isEffectivelyAllDay(e) && !isMultiDay(e) && e.start <= rangeEnd && e.end >= rangeStart);
}

/**
 * Lays out multi-day events as continuous banner bars across a row of `days`,
 * stacking overlapping events into lanes, mirroring Google Calendar / Bryntum banner rows.
 */
export function layoutSpanningEvents(events: CalendarEvent[], days: Date[]): SpanningEvent[] {
  if (days.length === 0) {
    return [];
  }
  const rangeStart = startOfDay(days[0]);
  const rangeEnd = startOfDay(days[days.length - 1]);

  const spanning = spanningEventsInRange(events, rangeStart, rangeEnd)
    .map((event) => {
      const eventStart = startOfDay(event.start);
      const eventEnd = startOfDay(event.end);
      const startCol = Math.max(0, daysBetween(rangeStart, eventStart));
      const endCol = Math.min(days.length - 1, daysBetween(rangeStart, eventEnd));
      return {
        event,
        startCol,
        endCol,
        continuesBefore: eventStart < rangeStart,
        continuesAfter: eventEnd > rangeEnd,
        lane: 0,
      } as SpanningEvent;
    })
    .sort((a, b) => a.startCol - b.startCol || b.endCol - a.endCol);

  assignLanes(spanning);
  return spanning;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function assignLanes(items: SpanningEvent[]): void {
  const lanes: SpanningEvent[][] = [];

  for (const item of items) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const lane = lanes[i];
      const last = lane[lane.length - 1];
      if (last.endCol < item.startCol) {
        lane.push(item);
        item.lane = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      item.lane = lanes.length;
      lanes.push([item]);
    }
  }
}

/**
 * Lays out same-day timed events into side-by-side columns when they overlap,
 * mirroring Google Calendar's day/week grid behaviour.
 */
export function layoutDayEvents(events: CalendarEvent[]): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

  const positioned: PositionedEvent[] = sorted.map((event) => ({
    event,
    column: 0,
    columnCount: 1,
    startMinutes: minutesSinceMidnight(event.start),
    endMinutes: Math.max(minutesSinceMidnight(event.end), minutesSinceMidnight(event.start) + 15),
  }));

  const clusters = clusterOverlapping(positioned);
  for (const cluster of clusters) {
    assignColumns(cluster);
  }

  return positioned;
}

function clusterOverlapping(items: PositionedEvent[]): PositionedEvent[][] {
  const clusters: PositionedEvent[][] = [];
  let current: PositionedEvent[] = [];
  let currentEnd = -Infinity;

  for (const item of items) {
    if (current.length === 0 || item.startMinutes < currentEnd) {
      current.push(item);
      currentEnd = Math.max(currentEnd, item.endMinutes);
    } else {
      clusters.push(current);
      current = [item];
      currentEnd = item.endMinutes;
    }
  }
  if (current.length) {
    clusters.push(current);
  }
  return clusters;
}

function assignColumns(cluster: PositionedEvent[]): void {
  const columns: PositionedEvent[][] = [];

  for (const item of cluster) {
    let placed = false;
    for (const column of columns) {
      const last = column[column.length - 1];
      if (last.endMinutes <= item.startMinutes) {
        column.push(item);
        item.column = columns.indexOf(column);
        placed = true;
        break;
      }
    }
    if (!placed) {
      item.column = columns.length;
      columns.push([item]);
    }
  }

  const columnCount = columns.length;
  for (const item of cluster) {
    item.columnCount = columnCount;
  }
}
