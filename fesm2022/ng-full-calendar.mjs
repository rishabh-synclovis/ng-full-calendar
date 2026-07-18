import * as i0 from '@angular/core';
import { EventEmitter, Component, ChangeDetectionStrategy, Input, Output, ViewChild } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i1$1 from '@angular/forms';
import { FormsModule } from '@angular/forms';

const DEFAULT_WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_WEEKDAY_NAMES_LONG = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const DEFAULT_MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DEFAULT_MONTH_NAMES_LONG = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
/** Fills in any unset fields of a partial CalendarLocale with the built-in English defaults. */
function resolveLocale(locale) {
    return {
        weekdayNamesShort: locale?.weekdayNamesShort ?? DEFAULT_WEEKDAY_NAMES_SHORT,
        weekdayNamesLong: locale?.weekdayNamesLong ?? DEFAULT_WEEKDAY_NAMES_LONG,
        monthNamesShort: locale?.monthNamesShort ?? DEFAULT_MONTH_NAMES_SHORT,
        monthNamesLong: locale?.monthNamesLong ?? DEFAULT_MONTH_NAMES_LONG,
        timeFormat: locale?.timeFormat ?? '12h',
    };
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
/**
 * Adds whole months to `date`, clamping the day-of-month to the last valid day
 * of the target month instead of letting it overflow into the following month
 * (e.g. Jan 31 + 1 month lands on Feb 28/29, not Mar 3).
 */
function addMonths(date, months) {
    const targetMonth = date.getMonth() + months;
    const daysInTargetMonth = new Date(date.getFullYear(), targetMonth + 1, 0).getDate();
    const d = new Date(date);
    d.setDate(Math.min(d.getDate(), daysInTargetMonth));
    d.setMonth(targetMonth);
    return d;
}
function isSameDay(a, b) {
    return (a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate());
}
function isToday(date) {
    return isSameDay(date, new Date());
}
/** Sunday = 0 ... Saturday = 6. Returns the first day of the week containing `date`. */
function startOfWeek(date, weekStartsOn = 0) {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    return addDays(d, -diff);
}
function endOfWeek(date, weekStartsOn = 0) {
    return addDays(startOfWeek(date, weekStartsOn), 6);
}
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
/** Builds the full 6-week (42 day) grid used by month view, including leading/trailing days. */
function buildMonthGrid(date, weekStartsOn = 0) {
    const firstOfMonth = startOfMonth(date);
    const gridStart = startOfWeek(firstOfMonth, weekStartsOn);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
function buildWeekGrid(date, weekStartsOn = 0) {
    const start = startOfWeek(date, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
function minutesSinceMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
}
function clampToDay(date, day) {
    const clamped = new Date(date);
    if (!isSameDay(date, day)) {
        return date < day ? startOfDay(day) : endOfDay(day);
    }
    return clamped;
}
function formatMonthTitle(date, monthNamesLong) {
    return `${monthNamesLong[date.getMonth()]} ${date.getFullYear()}`;
}
function formatWeekRangeTitle(date, weekStartsOn = 0, monthNamesShort) {
    const start = startOfWeek(date, weekStartsOn);
    const end = endOfWeek(date, weekStartsOn);
    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = `${monthNamesShort[start.getMonth()]} ${start.getDate()}`;
    const endStr = sameMonth
        ? `${end.getDate()}, ${end.getFullYear()}`
        : `${monthNamesShort[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    return `${startStr} – ${endStr}`;
}
function formatDayTitle(date, weekdayNamesLong, monthNamesLong) {
    return `${weekdayNamesLong[date.getDay()]}, ${monthNamesLong[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
/** Formats a time-of-day as 12-hour ('9:05 AM') or 24-hour ('09:05') per `timeFormat`. */
function formatTime(date, timeFormat) {
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
function isoWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

class ToolbarComponent {
    title = '';
    view = 'month';
    date = new Date();
    availableViews = ['day', 'week', 'month', 'agenda'];
    previousClick = new EventEmitter();
    nextClick = new EventEmitter();
    todayClick = new EventEmitter();
    viewChange = new EventEmitter();
    viewLabels = {
        day: 'Day',
        week: 'Week',
        month: 'Month',
        agenda: 'Agenda',
    };
    get weekBadgeLabel() {
        return this.view === 'week' ? `Week ${isoWeekNumber(this.date)}` : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: ToolbarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: ToolbarComponent, isStandalone: true, selector: "ngfc-toolbar", inputs: { title: "title", view: "view", date: "date", availableViews: "availableViews" }, outputs: { previousClick: "previousClick", nextClick: "nextClick", todayClick: "todayClick", viewChange: "viewChange" }, ngImport: i0, template: "<div class=\"ngfc-toolbar\">\n  <div class=\"ngfc-toolbar-left\">\n    <button type=\"button\" class=\"ngfc-btn ngfc-btn-today\" (click)=\"todayClick.emit()\">Today</button>\n    <button type=\"button\" class=\"ngfc-icon-btn\" (click)=\"previousClick.emit()\" aria-label=\"Previous\">\n      <span>&#8249;</span>\n    </button>\n    <button type=\"button\" class=\"ngfc-icon-btn\" (click)=\"nextClick.emit()\" aria-label=\"Next\">\n      <span>&#8250;</span>\n    </button>\n    <h2 class=\"ngfc-toolbar-title\">{{ title }}</h2>\n    @if (weekBadgeLabel) {\n      <span class=\"ngfc-week-badge\">{{ weekBadgeLabel }}</span>\n    }\n  </div>\n\n  <div class=\"ngfc-toolbar-right\">\n    @for (v of availableViews; track v) {\n      <button\n        type=\"button\"\n        class=\"ngfc-view-tab\"\n        [class.ngfc-view-tab-active]=\"v === view\"\n        (click)=\"viewChange.emit(v)\"\n      >\n        {{ viewLabels[v] }}\n      </button>\n    }\n  </div>\n</div>\n", styles: [".ngfc-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 4px 14px;flex-wrap:wrap}.ngfc-toolbar-left{display:flex;align-items:center;gap:8px}.ngfc-toolbar-right{display:flex;align-items:center;gap:20px}.ngfc-toolbar-title{font-size:1.5em;font-weight:700;margin:0 0 0 10px;color:var(--ngfc-text);letter-spacing:-.01em}.ngfc-week-badge{background:var(--ngfc-hover-bg);color:var(--ngfc-text-muted);font-size:.72em;font-weight:600;padding:4px 10px;border-radius:12px;margin-left:4px}.ngfc-icon-btn{cursor:pointer;border:none;background:transparent;color:var(--ngfc-text);border-radius:50%;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;font-size:1.1em;transition:background-color .15s ease}.ngfc-icon-btn:hover{background:var(--ngfc-hover-bg)}.ngfc-btn{cursor:pointer;border:1px solid var(--ngfc-border-color);background:var(--ngfc-bg);color:var(--ngfc-today-text);border-radius:20px;padding:7px 16px;font-size:.8125em;font-weight:600;line-height:1;display:inline-flex;align-items:center;gap:6px;transition:background-color .15s ease}.ngfc-btn:hover{background:var(--ngfc-today-bg)}.ngfc-btn-today{background:var(--ngfc-today-bg);border-color:transparent}.ngfc-view-tab{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text-muted);font-size:.9em;font-weight:500;padding:4px 2px;border-bottom:2px solid transparent}.ngfc-view-tab:hover{color:var(--ngfc-text)}.ngfc-view-tab-active{color:var(--ngfc-text);font-weight:700;border-bottom-color:var(--ngfc-today-text)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: ToolbarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-toolbar', standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-toolbar\">\n  <div class=\"ngfc-toolbar-left\">\n    <button type=\"button\" class=\"ngfc-btn ngfc-btn-today\" (click)=\"todayClick.emit()\">Today</button>\n    <button type=\"button\" class=\"ngfc-icon-btn\" (click)=\"previousClick.emit()\" aria-label=\"Previous\">\n      <span>&#8249;</span>\n    </button>\n    <button type=\"button\" class=\"ngfc-icon-btn\" (click)=\"nextClick.emit()\" aria-label=\"Next\">\n      <span>&#8250;</span>\n    </button>\n    <h2 class=\"ngfc-toolbar-title\">{{ title }}</h2>\n    @if (weekBadgeLabel) {\n      <span class=\"ngfc-week-badge\">{{ weekBadgeLabel }}</span>\n    }\n  </div>\n\n  <div class=\"ngfc-toolbar-right\">\n    @for (v of availableViews; track v) {\n      <button\n        type=\"button\"\n        class=\"ngfc-view-tab\"\n        [class.ngfc-view-tab-active]=\"v === view\"\n        (click)=\"viewChange.emit(v)\"\n      >\n        {{ viewLabels[v] }}\n      </button>\n    }\n  </div>\n</div>\n", styles: [".ngfc-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 4px 14px;flex-wrap:wrap}.ngfc-toolbar-left{display:flex;align-items:center;gap:8px}.ngfc-toolbar-right{display:flex;align-items:center;gap:20px}.ngfc-toolbar-title{font-size:1.5em;font-weight:700;margin:0 0 0 10px;color:var(--ngfc-text);letter-spacing:-.01em}.ngfc-week-badge{background:var(--ngfc-hover-bg);color:var(--ngfc-text-muted);font-size:.72em;font-weight:600;padding:4px 10px;border-radius:12px;margin-left:4px}.ngfc-icon-btn{cursor:pointer;border:none;background:transparent;color:var(--ngfc-text);border-radius:50%;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;font-size:1.1em;transition:background-color .15s ease}.ngfc-icon-btn:hover{background:var(--ngfc-hover-bg)}.ngfc-btn{cursor:pointer;border:1px solid var(--ngfc-border-color);background:var(--ngfc-bg);color:var(--ngfc-today-text);border-radius:20px;padding:7px 16px;font-size:.8125em;font-weight:600;line-height:1;display:inline-flex;align-items:center;gap:6px;transition:background-color .15s ease}.ngfc-btn:hover{background:var(--ngfc-today-bg)}.ngfc-btn-today{background:var(--ngfc-today-bg);border-color:transparent}.ngfc-view-tab{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text-muted);font-size:.9em;font-weight:500;padding:4px 2px;border-bottom:2px solid transparent}.ngfc-view-tab:hover{color:var(--ngfc-text)}.ngfc-view-tab-active{color:var(--ngfc-text);font-weight:700;border-bottom-color:var(--ngfc-today-text)}\n"] }]
        }], propDecorators: { title: [{
                type: Input
            }], view: [{
                type: Input
            }], date: [{
                type: Input
            }], availableViews: [{
                type: Input
            }], previousClick: [{
                type: Output
            }], nextClick: [{
                type: Output
            }], todayClick: [{
                type: Output
            }], viewChange: [{
                type: Output
            }] } });

/**
 * True when an event spans more than one calendar day — either explicitly marked
 * `allDay`, or simply because its start and end fall on different days (e.g. a
 * holiday or multi-day event with real start/end timestamps but no allDay flag).
 * These render as a continuous banner strip instead of a per-day timed block.
 */
function isMultiDay(event) {
    return event.allDay === true || !isSameDay(event.start, event.end);
}
/**
 * True when a single-day event has no meaningful time-of-day (explicitly `allDay`,
 * or its start and end both sit at midnight) — rendered as a solid pill rather
 * than a dot + time row.
 */
function isEffectivelyAllDay(event) {
    if (event.allDay === true) {
        return true;
    }
    const isMidnight = (d) => d.getHours() === 0 && d.getMinutes() === 0;
    return isMidnight(event.start) && isMidnight(event.end);
}
function eventsForDay(events, day) {
    return events.filter((e) => !isMultiDay(e) && !isEffectivelyAllDay(e) && isSameDay(e.start, day));
}
/** Multi-day events (see `isMultiDay`) visible within the range — rendered as banner strips. */
function spanningEventsInRange(events, rangeStart, rangeEnd) {
    return events.filter((e) => isMultiDay(e) && e.start <= rangeEnd && e.end >= rangeStart);
}
/** Single-day all-day events (not spanning banners) visible within the range. */
function singleDayAllDayEventsInRange(events, rangeStart, rangeEnd) {
    return events.filter((e) => isEffectivelyAllDay(e) && !isMultiDay(e) && e.start <= rangeEnd && e.end >= rangeStart);
}
/**
 * Lays out multi-day events as continuous banner bars across a row of `days`,
 * stacking overlapping events into lanes, mirroring Google Calendar / Bryntum banner rows.
 */
function layoutSpanningEvents(events, days) {
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
        };
    })
        .sort((a, b) => a.startCol - b.startCol || b.endCol - a.endCol);
    assignLanes(spanning);
    return spanning;
}
function daysBetween(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
function assignLanes(items) {
    const lanes = [];
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
function layoutDayEvents(events) {
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const positioned = sorted.map((event) => ({
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
function clusterOverlapping(items) {
    const clusters = [];
    let current = [];
    let currentEnd = -Infinity;
    for (const item of items) {
        if (current.length === 0 || item.startMinutes < currentEnd) {
            current.push(item);
            currentEnd = Math.max(currentEnd, item.endMinutes);
        }
        else {
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
function assignColumns(cluster) {
    const columns = [];
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

const NAMED_COLORS = new Set([
    'blue',
    'green',
    'red',
    'yellow',
    'purple',
    'orange',
    'teal',
    'gray',
]);
function isNamedColor(color) {
    return !!color && NAMED_COLORS.has(color);
}
/** Resolves an event's `color` into either a theme CSS class (named colors) or inline hex-derived styles (custom colors). */
function resolveEventColor(color) {
    if (!color || isNamedColor(color)) {
        return { className: `ngfc-color-${color || 'blue'}`, style: null };
    }
    const rgb = parseHexColor(color);
    if (!rgb) {
        // Not a recognized hex string either — fall back to the default named color.
        return { className: 'ngfc-color-blue', style: null };
    }
    return {
        className: null,
        style: {
            background: tint(rgb, 0.85),
            borderColor: color,
            color: shade(rgb, 0.45),
        },
    };
}
/** Resolves just the solid accent color (for small dots/indicators), matching resolveEventColor's border color. */
function resolveEventDotColor(color) {
    if (!color || isNamedColor(color)) {
        return { className: `ngfc-color-${color || 'blue'}`, style: null };
    }
    const rgb = parseHexColor(color);
    return rgb ? { className: null, style: { backgroundColor: color } } : { className: 'ngfc-color-blue', style: null };
}
function parseHexColor(input) {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
    if (!match) {
        return null;
    }
    let hex = match[1];
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((c) => c + c)
            .join('');
    }
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
/** Blends a color toward white by `amount` (0-1) to produce a pastel background tint. */
function tint(rgb, amount) {
    const r = Math.round(rgb.r + (255 - rgb.r) * amount);
    const g = Math.round(rgb.g + (255 - rgb.g) * amount);
    const b = Math.round(rgb.b + (255 - rgb.b) * amount);
    return `rgb(${r}, ${g}, ${b})`;
}
/** Blends a color toward black by `amount` (0-1) to produce a darker, readable text shade. */
function shade(rgb, amount) {
    const r = Math.round(rgb.r * (1 - amount));
    const g = Math.round(rgb.g * (1 - amount));
    const b = Math.round(rgb.b * (1 - amount));
    return `rgb(${r}, ${g}, ${b})`;
}

const MAX_VISIBLE_EVENTS = 3;
class MonthViewComponent {
    date;
    events = [];
    weekStartsOn = 0;
    locale = null;
    dayClick = new EventEmitter();
    eventClick = new EventEmitter();
    moreClick = new EventEmitter();
    maxVisible = MAX_VISIBLE_EVENTS;
    weeks = [];
    weekdayLabels = [];
    resolvedLocale = resolveLocale(null);
    ngOnChanges() {
        this.resolvedLocale = resolveLocale(this.locale);
        this.weekdayLabels = this.buildWeekdayLabels();
        this.weeks = this.buildWeeks();
    }
    buildWeekdayLabels() {
        const names = this.resolvedLocale.weekdayNamesShort;
        return Array.from({ length: 7 }, (_, i) => names[(i + this.weekStartsOn) % 7]);
    }
    formatEventTime(date) {
        return formatTime(date, this.resolvedLocale.timeFormat);
    }
    buildWeeks() {
        const gridDays = buildMonthGrid(this.date, this.weekStartsOn);
        const days = gridDays.map((day) => ({
            date: day,
            isCurrentMonth: day.getMonth() === this.date.getMonth(),
            isToday: isToday(day),
            isWeekend: day.getDay() === 0 || day.getDay() === 6,
            events: this.events
                .filter((e) => this.eventOccursOnDay(e, day) && !isMultiDay(e))
                .sort((a, b) => a.start.getTime() - b.start.getTime()),
        }));
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            const weekDays = days.slice(i, i + 7);
            const spanningEvents = layoutSpanningEvents(this.events, weekDays.map((d) => d.date));
            const laneCount = spanningEvents.reduce((max, e) => Math.max(max, e.lane + 1), 0);
            weeks.push({ days: weekDays, spanningEvents, laneCount });
        }
        return weeks;
    }
    eventOccursOnDay(event, day) {
        if (isMultiDay(event)) {
            return event.start <= day && event.end >= day;
        }
        return isSameDay(event.start, day);
    }
    visibleEvents(day) {
        return day.events.slice(0, this.maxVisible);
    }
    overflowCount(day) {
        return Math.max(0, day.events.length - this.maxVisible);
    }
    /**
     * Reserves vertical space in the day cell so banner strips overlaid on top
     * (see .ngfc-banner-row in the stylesheet: flush to the week's top, 2px
     * leading padding, 22px lanes, 2px gap between lanes) don't cover the day
     * number or event text below. Sits flush at the top (no fixed offset) so
     * weeks without banners don't reserve any dead space above the day number.
     */
    bannerReservedHeight(week) {
        if (week.laneCount === 0) {
            return '0px';
        }
        const LEADING_PADDING = 2;
        const LANE_HEIGHT = 22;
        const LANE_GAP = 2;
        const totalHeight = LEADING_PADDING + week.laneCount * LANE_HEIGHT + (week.laneCount - 1) * LANE_GAP + LANE_GAP;
        return `${totalHeight}px`;
    }
    spanningEventStyle(item) {
        return {
            'grid-column': `${item.startCol + 1} / ${item.endCol + 2}`,
            'grid-row': `${item.lane + 1}`,
            ...(this.colorStyle(item.event.color) ?? {}),
        };
    }
    colorClass(color) {
        return resolveEventColor(color).className;
    }
    colorStyle(color) {
        return resolveEventColor(color).style;
    }
    dotColorClass(color) {
        return resolveEventDotColor(color).className;
    }
    dotColorStyle(color) {
        return resolveEventDotColor(color).style;
    }
    isPillEvent(event) {
        return isEffectivelyAllDay(event);
    }
    onDayClick(day) {
        this.dayClick.emit(day.date);
    }
    onEventClick(event, domEvent) {
        domEvent.stopPropagation();
        this.eventClick.emit(event);
    }
    onSpanningEventClick(item, domEvent) {
        domEvent.stopPropagation();
        this.eventClick.emit(item.event);
    }
    onMoreClick(day, domEvent) {
        domEvent.stopPropagation();
        this.moreClick.emit(day.date);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MonthViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: MonthViewComponent, isStandalone: true, selector: "ngfc-month-view", inputs: { date: "date", events: "events", weekStartsOn: "weekStartsOn", locale: "locale" }, outputs: { dayClick: "dayClick", eventClick: "eventClick", moreClick: "moreClick" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"ngfc-month\">\n  <div class=\"ngfc-month-weekdays\">\n    @for (label of weekdayLabels; track label) {\n      <div class=\"ngfc-month-weekday\">{{ label }}</div>\n    }\n  </div>\n\n  <div class=\"ngfc-month-weeks\">\n    @for (week of weeks; track $index) {\n      <div class=\"ngfc-month-week\">\n        @if (week.laneCount > 0) {\n          <div\n            class=\"ngfc-banner-row\"\n            [style.grid-template-rows]=\"'repeat(' + week.laneCount + ', 22px)'\"\n          >\n            @for (item of week.spanningEvents; track item.event.id) {\n              <div\n                class=\"ngfc-event ngfc-banner-bar\"\n                [class]=\"colorClass(item.event.color)\"\n                [class.ngfc-banner-continues-before]=\"item.continuesBefore\"\n                [class.ngfc-banner-continues-after]=\"item.continuesAfter\"\n                [ngStyle]=\"spanningEventStyle(item)\"\n                (click)=\"onSpanningEventClick(item, $event)\"\n                [title]=\"item.event.title\"\n              >\n                {{ item.event.title }}\n              </div>\n            }\n          </div>\n        }\n\n        <div\n          class=\"ngfc-month-grid-row\"\n          [style.padding-top]=\"bannerReservedHeight(week)\"\n        >\n          @for (day of week.days; track day.date.getTime()) {\n            <div\n              class=\"ngfc-month-cell\"\n              [class.ngfc-month-cell-outside]=\"!day.isCurrentMonth\"\n              [class.ngfc-month-cell-weekend]=\"day.isWeekend\"\n              [class.ngfc-month-cell-today]=\"day.isToday\"\n              (click)=\"onDayClick(day)\"\n            >\n              <div class=\"ngfc-month-cell-header\">\n                <span class=\"ngfc-day-number\" [class.ngfc-day-number-today]=\"day.isToday\">\n                  {{ day.date.getDate() }}\n                </span>\n              </div>\n\n              <div class=\"ngfc-month-cell-events\">\n                @for (event of visibleEvents(day); track event.id) {\n                  @if (isPillEvent(event)) {\n                    <div\n                      class=\"ngfc-event ngfc-event-pill\"\n                      [class]=\"colorClass(event.color)\"\n                      [ngStyle]=\"colorStyle(event.color)\"\n                      (click)=\"onEventClick(event, $event)\"\n                      [title]=\"event.title\"\n                    >\n                      <span class=\"ngfc-event-title\">{{ event.title }}</span>\n                    </div>\n                  } @else {\n                    <div class=\"ngfc-event-dotrow\" (click)=\"onEventClick(event, $event)\" [title]=\"event.title\">\n                      <span\n                        class=\"ngfc-event ngfc-event-dot\"\n                        [class]=\"dotColorClass(event.color)\"\n                        [ngStyle]=\"dotColorStyle(event.color)\"\n                      ></span>\n                      <span class=\"ngfc-event-time\">{{ formatEventTime(event.start) }}</span>\n                      <span class=\"ngfc-event-title\">{{ event.title }}</span>\n                    </div>\n                  }\n                }\n                @if (overflowCount(day) > 0) {\n                  <button type=\"button\" class=\"ngfc-more-btn\" (click)=\"onMoreClick(day, $event)\">\n                    +{{ overflowCount(day) }} more\n                  </button>\n                }\n              </div>\n            </div>\n          }\n        </div>\n      </div>\n    }\n  </div>\n</div>\n", styles: [":host{display:flex;flex-direction:column;min-height:0;flex:1;overflow-y:auto}.ngfc-month{display:flex;flex-direction:column;height:100%}.ngfc-month-weekdays{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--ngfc-border-color)}.ngfc-month-weekday{padding:8px;text-align:center;font-size:.7em;font-weight:600;color:var(--ngfc-text-muted);text-transform:uppercase;letter-spacing:.03em}.ngfc-month-weeks{display:flex;flex-direction:column;flex:1}.ngfc-month-week{flex:1 0 auto;display:flex;flex-direction:column;position:relative;border-bottom:2px solid var(--ngfc-border-color)}.ngfc-month-week:first-child{border-top:2px solid var(--ngfc-border-color)}.ngfc-month-week:last-child{border-bottom:none}.ngfc-banner-row{position:absolute;top:0;left:0;right:0;z-index:1;display:grid;grid-template-columns:repeat(7,1fr);gap:2px 0;padding-top:2px;pointer-events:none}.ngfc-banner-row .ngfc-banner-bar{pointer-events:auto}.ngfc-banner-bar{margin:0 1px;padding:2px 8px;font-size:.72em;font-weight:600;border-radius:4px;border-left:3px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;display:flex;align-items:center}.ngfc-banner-bar.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-banner-bar.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-banner-bar.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-banner-bar.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-banner-bar.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-banner-bar.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-banner-bar.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-banner-bar.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-banner-bar:hover{filter:brightness(.97)}.ngfc-banner-continues-before{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0;border-left-style:dashed}.ngfc-banner-continues-after{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0}.ngfc-month-grid-row{display:grid;grid-template-columns:repeat(7,1fr);flex:1}.ngfc-month-cell{border-right:1px solid var(--ngfc-grid-line);padding:4px 6px;min-height:90px;cursor:pointer;display:flex;flex-direction:column;overflow:hidden;transition:background-color .15s ease}.ngfc-month-cell:hover{background:var(--ngfc-hover-bg)}.ngfc-month-cell:nth-child(7n+1){border-left:1px solid var(--ngfc-grid-line)}.ngfc-month-cell-outside{background:var(--ngfc-weekend-bg)}.ngfc-month-cell-outside .ngfc-day-number{color:var(--ngfc-text-muted)}.ngfc-month-cell-weekend:not(.ngfc-month-cell-outside){background:var(--ngfc-weekend-bg)}.ngfc-month-cell-today{background:var(--ngfc-today-bg)}.ngfc-month-cell-today:hover{background:var(--ngfc-today-bg);filter:brightness(.98)}.ngfc-month-cell-header{display:flex;justify-content:flex-end;margin-bottom:4px}.ngfc-day-number{font-size:.8125em;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%}.ngfc-day-number-today{background:var(--ngfc-today-text);color:#fff;font-weight:600}.ngfc-month-cell-events{display:flex;flex-direction:column;gap:2px;overflow:hidden}.ngfc-event-pill{border-left:3px solid transparent;border-radius:4px;padding:1px 6px;font-size:.75em;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;display:flex;gap:4px}.ngfc-event-pill.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-event-pill.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-event-pill.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-event-pill.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-event-pill.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-event-pill.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-event-pill.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-event-pill.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-event-pill:hover{filter:brightness(.97)}.ngfc-event-pill .ngfc-event-title{color:inherit}.ngfc-event-dotrow{display:flex;align-items:center;gap:5px;padding:1px 4px;border-radius:4px;cursor:pointer;overflow:hidden;font-size:.75em}.ngfc-event-dotrow:hover{background:var(--ngfc-hover-bg)}.ngfc-event-dot{width:8px;height:8px;min-width:8px;border-radius:50%;border:none}.ngfc-event-dot.ngfc-color-blue{background-color:var(--ngfc-color-blue-border)}.ngfc-event-dot.ngfc-color-green{background-color:var(--ngfc-color-green-border)}.ngfc-event-dot.ngfc-color-red{background-color:var(--ngfc-color-red-border)}.ngfc-event-dot.ngfc-color-yellow{background-color:var(--ngfc-color-yellow-border)}.ngfc-event-dot.ngfc-color-purple{background-color:var(--ngfc-color-purple-border)}.ngfc-event-dot.ngfc-color-orange{background-color:var(--ngfc-color-orange-border)}.ngfc-event-dot.ngfc-color-teal{background-color:var(--ngfc-color-teal-border)}.ngfc-event-dot.ngfc-color-gray{background-color:var(--ngfc-color-gray-border)}.ngfc-event-time{font-weight:500;color:var(--ngfc-text-muted);white-space:nowrap}.ngfc-event-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ngfc-text)}.ngfc-more-btn{background:none;border:none;color:var(--ngfc-text-muted);font-size:.75em;text-align:left;cursor:pointer;padding:1px 6px}.ngfc-more-btn:hover{text-decoration:underline}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MonthViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-month-view', standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-month\">\n  <div class=\"ngfc-month-weekdays\">\n    @for (label of weekdayLabels; track label) {\n      <div class=\"ngfc-month-weekday\">{{ label }}</div>\n    }\n  </div>\n\n  <div class=\"ngfc-month-weeks\">\n    @for (week of weeks; track $index) {\n      <div class=\"ngfc-month-week\">\n        @if (week.laneCount > 0) {\n          <div\n            class=\"ngfc-banner-row\"\n            [style.grid-template-rows]=\"'repeat(' + week.laneCount + ', 22px)'\"\n          >\n            @for (item of week.spanningEvents; track item.event.id) {\n              <div\n                class=\"ngfc-event ngfc-banner-bar\"\n                [class]=\"colorClass(item.event.color)\"\n                [class.ngfc-banner-continues-before]=\"item.continuesBefore\"\n                [class.ngfc-banner-continues-after]=\"item.continuesAfter\"\n                [ngStyle]=\"spanningEventStyle(item)\"\n                (click)=\"onSpanningEventClick(item, $event)\"\n                [title]=\"item.event.title\"\n              >\n                {{ item.event.title }}\n              </div>\n            }\n          </div>\n        }\n\n        <div\n          class=\"ngfc-month-grid-row\"\n          [style.padding-top]=\"bannerReservedHeight(week)\"\n        >\n          @for (day of week.days; track day.date.getTime()) {\n            <div\n              class=\"ngfc-month-cell\"\n              [class.ngfc-month-cell-outside]=\"!day.isCurrentMonth\"\n              [class.ngfc-month-cell-weekend]=\"day.isWeekend\"\n              [class.ngfc-month-cell-today]=\"day.isToday\"\n              (click)=\"onDayClick(day)\"\n            >\n              <div class=\"ngfc-month-cell-header\">\n                <span class=\"ngfc-day-number\" [class.ngfc-day-number-today]=\"day.isToday\">\n                  {{ day.date.getDate() }}\n                </span>\n              </div>\n\n              <div class=\"ngfc-month-cell-events\">\n                @for (event of visibleEvents(day); track event.id) {\n                  @if (isPillEvent(event)) {\n                    <div\n                      class=\"ngfc-event ngfc-event-pill\"\n                      [class]=\"colorClass(event.color)\"\n                      [ngStyle]=\"colorStyle(event.color)\"\n                      (click)=\"onEventClick(event, $event)\"\n                      [title]=\"event.title\"\n                    >\n                      <span class=\"ngfc-event-title\">{{ event.title }}</span>\n                    </div>\n                  } @else {\n                    <div class=\"ngfc-event-dotrow\" (click)=\"onEventClick(event, $event)\" [title]=\"event.title\">\n                      <span\n                        class=\"ngfc-event ngfc-event-dot\"\n                        [class]=\"dotColorClass(event.color)\"\n                        [ngStyle]=\"dotColorStyle(event.color)\"\n                      ></span>\n                      <span class=\"ngfc-event-time\">{{ formatEventTime(event.start) }}</span>\n                      <span class=\"ngfc-event-title\">{{ event.title }}</span>\n                    </div>\n                  }\n                }\n                @if (overflowCount(day) > 0) {\n                  <button type=\"button\" class=\"ngfc-more-btn\" (click)=\"onMoreClick(day, $event)\">\n                    +{{ overflowCount(day) }} more\n                  </button>\n                }\n              </div>\n            </div>\n          }\n        </div>\n      </div>\n    }\n  </div>\n</div>\n", styles: [":host{display:flex;flex-direction:column;min-height:0;flex:1;overflow-y:auto}.ngfc-month{display:flex;flex-direction:column;height:100%}.ngfc-month-weekdays{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--ngfc-border-color)}.ngfc-month-weekday{padding:8px;text-align:center;font-size:.7em;font-weight:600;color:var(--ngfc-text-muted);text-transform:uppercase;letter-spacing:.03em}.ngfc-month-weeks{display:flex;flex-direction:column;flex:1}.ngfc-month-week{flex:1 0 auto;display:flex;flex-direction:column;position:relative;border-bottom:2px solid var(--ngfc-border-color)}.ngfc-month-week:first-child{border-top:2px solid var(--ngfc-border-color)}.ngfc-month-week:last-child{border-bottom:none}.ngfc-banner-row{position:absolute;top:0;left:0;right:0;z-index:1;display:grid;grid-template-columns:repeat(7,1fr);gap:2px 0;padding-top:2px;pointer-events:none}.ngfc-banner-row .ngfc-banner-bar{pointer-events:auto}.ngfc-banner-bar{margin:0 1px;padding:2px 8px;font-size:.72em;font-weight:600;border-radius:4px;border-left:3px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;display:flex;align-items:center}.ngfc-banner-bar.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-banner-bar.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-banner-bar.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-banner-bar.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-banner-bar.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-banner-bar.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-banner-bar.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-banner-bar.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-banner-bar:hover{filter:brightness(.97)}.ngfc-banner-continues-before{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0;border-left-style:dashed}.ngfc-banner-continues-after{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0}.ngfc-month-grid-row{display:grid;grid-template-columns:repeat(7,1fr);flex:1}.ngfc-month-cell{border-right:1px solid var(--ngfc-grid-line);padding:4px 6px;min-height:90px;cursor:pointer;display:flex;flex-direction:column;overflow:hidden;transition:background-color .15s ease}.ngfc-month-cell:hover{background:var(--ngfc-hover-bg)}.ngfc-month-cell:nth-child(7n+1){border-left:1px solid var(--ngfc-grid-line)}.ngfc-month-cell-outside{background:var(--ngfc-weekend-bg)}.ngfc-month-cell-outside .ngfc-day-number{color:var(--ngfc-text-muted)}.ngfc-month-cell-weekend:not(.ngfc-month-cell-outside){background:var(--ngfc-weekend-bg)}.ngfc-month-cell-today{background:var(--ngfc-today-bg)}.ngfc-month-cell-today:hover{background:var(--ngfc-today-bg);filter:brightness(.98)}.ngfc-month-cell-header{display:flex;justify-content:flex-end;margin-bottom:4px}.ngfc-day-number{font-size:.8125em;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%}.ngfc-day-number-today{background:var(--ngfc-today-text);color:#fff;font-weight:600}.ngfc-month-cell-events{display:flex;flex-direction:column;gap:2px;overflow:hidden}.ngfc-event-pill{border-left:3px solid transparent;border-radius:4px;padding:1px 6px;font-size:.75em;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;display:flex;gap:4px}.ngfc-event-pill.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-event-pill.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-event-pill.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-event-pill.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-event-pill.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-event-pill.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-event-pill.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-event-pill.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-event-pill:hover{filter:brightness(.97)}.ngfc-event-pill .ngfc-event-title{color:inherit}.ngfc-event-dotrow{display:flex;align-items:center;gap:5px;padding:1px 4px;border-radius:4px;cursor:pointer;overflow:hidden;font-size:.75em}.ngfc-event-dotrow:hover{background:var(--ngfc-hover-bg)}.ngfc-event-dot{width:8px;height:8px;min-width:8px;border-radius:50%;border:none}.ngfc-event-dot.ngfc-color-blue{background-color:var(--ngfc-color-blue-border)}.ngfc-event-dot.ngfc-color-green{background-color:var(--ngfc-color-green-border)}.ngfc-event-dot.ngfc-color-red{background-color:var(--ngfc-color-red-border)}.ngfc-event-dot.ngfc-color-yellow{background-color:var(--ngfc-color-yellow-border)}.ngfc-event-dot.ngfc-color-purple{background-color:var(--ngfc-color-purple-border)}.ngfc-event-dot.ngfc-color-orange{background-color:var(--ngfc-color-orange-border)}.ngfc-event-dot.ngfc-color-teal{background-color:var(--ngfc-color-teal-border)}.ngfc-event-dot.ngfc-color-gray{background-color:var(--ngfc-color-gray-border)}.ngfc-event-time{font-weight:500;color:var(--ngfc-text-muted);white-space:nowrap}.ngfc-event-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ngfc-text)}.ngfc-more-btn{background:none;border:none;color:var(--ngfc-text-muted);font-size:.75em;text-align:left;cursor:pointer;padding:1px 6px}.ngfc-more-btn:hover{text-decoration:underline}\n"] }]
        }], propDecorators: { date: [{
                type: Input,
                args: [{ required: true }]
            }], events: [{
                type: Input
            }], weekStartsOn: [{
                type: Input
            }], locale: [{
                type: Input
            }], dayClick: [{
                type: Output
            }], eventClick: [{
                type: Output
            }], moreClick: [{
                type: Output
            }] } });

const HOUR_HEIGHT_PX = 48;
class WeekViewComponent {
    date;
    events = [];
    weekStartsOn = 0;
    /** When true, renders a single day column instead of a full week. */
    singleDay = false;
    locale = null;
    eventClick = new EventEmitter();
    slotClick = new EventEmitter();
    scrollContainer;
    hours = Array.from({ length: 24 }, (_, i) => i);
    hourHeight = HOUR_HEIGHT_PX;
    days = [];
    allDayEventsByDay = [];
    positionedByDay = [];
    spanningEvents = [];
    spanningLaneCount = 0;
    hasAllDayEvents = false;
    nowOffsetPx = 0;
    timer;
    hasTodayColumn = false;
    hasScrolledToNow = false;
    resolvedLocale = resolveLocale(null);
    ngOnInit() {
        this.updateNowLine();
        this.timer = setInterval(() => this.updateNowLine(), 60_000);
    }
    ngAfterViewInit() {
        this.scrollToNowIfNeeded();
    }
    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    ngOnChanges() {
        this.resolvedLocale = resolveLocale(this.locale);
        this.days = this.singleDay ? [this.date] : buildWeekGrid(this.date, this.weekStartsOn);
        const rangeStart = this.days[0];
        const rangeEnd = this.days[this.days.length - 1];
        const singleDayAllDay = singleDayAllDayEventsInRange(this.events, rangeStart, rangeEnd);
        this.allDayEventsByDay = this.days.map((day) => singleDayAllDay.filter((e) => isSameDay(e.start, day)));
        this.hasAllDayEvents = this.allDayEventsByDay.some((dayEvents) => dayEvents.length > 0);
        this.spanningEvents = layoutSpanningEvents(this.events, this.days);
        this.spanningLaneCount = this.spanningEvents.reduce((max, e) => Math.max(max, e.lane + 1), 0);
        this.positionedByDay = this.days.map((day) => layoutDayEvents(eventsForDay(this.events, day)));
        const hadTodayColumn = this.hasTodayColumn;
        this.hasTodayColumn = this.days.some((day) => isToday(day));
        if (this.hasTodayColumn && !hadTodayColumn) {
            // Today just entered the visible range (e.g. switching to Day/Week view,
            // or navigating back to the current week) — scroll to now again.
            this.hasScrolledToNow = false;
        }
        this.scrollToNowIfNeeded();
    }
    scrollToNowIfNeeded() {
        if (this.hasScrolledToNow || !this.hasTodayColumn || !this.scrollContainer) {
            return;
        }
        this.hasScrolledToNow = true;
        const container = this.scrollContainer.nativeElement;
        const target = Math.max(0, this.nowOffsetPx - container.clientHeight / 2);
        // Run after the current render so container.clientHeight is accurate.
        queueMicrotask(() => {
            container.scrollTop = target;
        });
    }
    spanningEventStyle(item) {
        return {
            'grid-column': `${item.startCol + 1} / ${item.endCol + 2}`,
            'grid-row': `${item.lane + 1}`,
            ...(this.colorStyle(item.event.color) ?? {}),
        };
    }
    colorClass(color) {
        return resolveEventColor(color).className;
    }
    colorStyle(color) {
        return resolveEventColor(color).style;
    }
    dotColorClass(color) {
        return resolveEventDotColor(color).className;
    }
    dotColorStyle(color) {
        return resolveEventDotColor(color).style;
    }
    onSpanningEventClick(item, domEvent) {
        domEvent.stopPropagation();
        this.eventClick.emit(item.event);
    }
    updateNowLine() {
        this.nowOffsetPx = (minutesSinceMidnight(new Date()) / 60) * this.hourHeight;
    }
    isTodayColumn(day) {
        return isToday(day);
    }
    weekdayShortName(day) {
        return this.resolvedLocale.weekdayNamesShort[day.getDay()];
    }
    /** Hour-gutter row label, e.g. '1 AM' / '13:00', respecting the configured time format. */
    hourLabel(hour) {
        if (this.resolvedLocale.timeFormat === '24h') {
            return `${String(hour).padStart(2, '0')}:00`;
        }
        if (hour === 0) {
            return '12 AM';
        }
        if (hour === 12) {
            return '12 PM';
        }
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    }
    formatEventTime(date) {
        return formatTime(date, this.resolvedLocale.timeFormat);
    }
    formatEventTimeRange(item) {
        return `${this.formatEventTime(item.event.start)} – ${this.formatEventTime(item.event.end)}`;
    }
    eventTop(item) {
        return (item.startMinutes / 60) * this.hourHeight;
    }
    eventHeight(item) {
        return Math.max(((item.endMinutes - item.startMinutes) / 60) * this.hourHeight, 18);
    }
    /** Short events don't have room to stack title + time on separate lines. */
    isShortEvent(item) {
        return this.eventHeight(item) < 34;
    }
    eventWidthPercent(item) {
        return 100 / item.columnCount;
    }
    eventLeftPercent(item) {
        return (100 / item.columnCount) * item.column;
    }
    onEventClick(event, domEvent) {
        domEvent.stopPropagation();
        this.eventClick.emit(event);
    }
    onSlotClick(day, hour) {
        const slot = new Date(day);
        slot.setHours(hour, 0, 0, 0);
        this.slotClick.emit(slot);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: WeekViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: WeekViewComponent, isStandalone: true, selector: "ngfc-week-view", inputs: { date: "date", events: "events", weekStartsOn: "weekStartsOn", singleDay: "singleDay", locale: "locale" }, outputs: { eventClick: "eventClick", slotClick: "slotClick" }, viewQueries: [{ propertyName: "scrollContainer", first: true, predicate: ["scrollContainer"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"ngfc-week\">\n  <div class=\"ngfc-week-header\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n    <div class=\"ngfc-week-gutter\"></div>\n    @for (day of days; track day.getTime()) {\n      <div class=\"ngfc-week-day-header\" [class.ngfc-week-day-header-today]=\"isTodayColumn(day)\">\n        <div class=\"ngfc-week-day-name\">{{ weekdayShortName(day) }}</div>\n        <div class=\"ngfc-week-day-number\">{{ day | date: 'd' }}</div>\n      </div>\n    }\n  </div>\n\n  @if (spanningEvents.length > 0) {\n    <div class=\"ngfc-week-banners\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n      <div class=\"ngfc-week-gutter\"></div>\n      <div\n        class=\"ngfc-banner-row\"\n        [style.grid-template-columns]=\"'repeat(' + days.length + ', 1fr)'\"\n        [style.grid-template-rows]=\"'repeat(' + spanningLaneCount + ', 22px)'\"\n      >\n        @for (item of spanningEvents; track item.event.id) {\n          <div\n            class=\"ngfc-event ngfc-banner-bar\"\n            [class]=\"colorClass(item.event.color)\"\n            [class.ngfc-banner-continues-before]=\"item.continuesBefore\"\n            [class.ngfc-banner-continues-after]=\"item.continuesAfter\"\n            [ngStyle]=\"spanningEventStyle(item)\"\n            (click)=\"onSpanningEventClick(item, $event)\"\n            [title]=\"item.event.title\"\n          >\n            {{ item.event.title }}\n          </div>\n        }\n      </div>\n    </div>\n  }\n\n  @if (hasAllDayEvents) {\n    <div class=\"ngfc-week-allday\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n      <div class=\"ngfc-week-gutter ngfc-allday-label\">All day</div>\n      @for (dayEvents of allDayEventsByDay; track $index) {\n        <div class=\"ngfc-allday-cell\">\n          @for (event of dayEvents; track event.id) {\n            <div\n              class=\"ngfc-event ngfc-event-pill\"\n              [class]=\"colorClass(event.color)\"\n              [ngStyle]=\"colorStyle(event.color)\"\n              (click)=\"onEventClick(event, $event)\"\n            >\n              {{ event.title }}\n            </div>\n          }\n        </div>\n      }\n    </div>\n  }\n\n  <div class=\"ngfc-week-body\" #scrollContainer>\n    <div class=\"ngfc-week-grid\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n      <div class=\"ngfc-hour-gutter\">\n        @for (hour of hours; track hour) {\n          <div class=\"ngfc-hour-label\" [style.height.px]=\"hourHeight\">\n            @if (hour > 0) {\n              <span>{{ hourLabel(hour) }}</span>\n            }\n          </div>\n        }\n      </div>\n\n      @for (day of days; track day.getTime(); let dayIndex = $index) {\n        <div class=\"ngfc-day-column\">\n          @for (hour of hours; track hour) {\n            <div class=\"ngfc-hour-slot\" [style.height.px]=\"hourHeight\" (click)=\"onSlotClick(day, hour)\"></div>\n          }\n\n          @if (isTodayColumn(day)) {\n            <div class=\"ngfc-now-line\" [style.top.px]=\"nowOffsetPx\"></div>\n          }\n\n          @for (item of positionedByDay[dayIndex]; track item.event.id) {\n            <div\n              class=\"ngfc-event ngfc-timed-event\"\n              [class]=\"colorClass(item.event.color)\"\n              [class.ngfc-timed-event-short]=\"isShortEvent(item)\"\n              [style.top.px]=\"eventTop(item)\"\n              [style.height.px]=\"eventHeight(item)\"\n              [style.width.%]=\"eventWidthPercent(item)\"\n              [style.left.%]=\"eventLeftPercent(item)\"\n              [ngStyle]=\"colorStyle(item.event.color)\"\n              (click)=\"onEventClick(item.event, $event)\"\n              [title]=\"item.event.title\"\n            >\n              <span class=\"ngfc-event-title\">{{ item.event.title }}</span>\n              <span class=\"ngfc-event-time\">{{ formatEventTimeRange(item) }}</span>\n            </div>\n          }\n        </div>\n      }\n    </div>\n  </div>\n</div>\n", styles: [":host{display:flex;flex-direction:column;min-height:0;flex:1}.ngfc-week{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden}.ngfc-week-header,.ngfc-week-allday,.ngfc-week-banners{display:grid;border-bottom:1px solid var(--ngfc-border-color)}.ngfc-week-gutter{border-right:1px solid var(--ngfc-border-color)}.ngfc-week-day-header{text-align:center;padding:8px 4px}.ngfc-week-day-header-today .ngfc-week-day-number{background:var(--ngfc-today-text);color:#fff}.ngfc-week-day-name{font-size:.7em;text-transform:uppercase;color:var(--ngfc-text-muted)}.ngfc-week-day-number{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:1em;margin-top:2px}.ngfc-banner-row{display:grid;grid-column:2/-1;gap:2px 0;padding:3px 0}.ngfc-banner-bar{margin:0 1px;padding:2px 8px;font-size:.72em;font-weight:600;border-radius:4px;border-left:3px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;display:flex;align-items:center}.ngfc-banner-bar.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-banner-bar.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-banner-bar.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-banner-bar.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-banner-bar.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-banner-bar.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-banner-bar.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-banner-bar.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-banner-bar:hover{filter:brightness(.97)}.ngfc-banner-continues-before{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0;border-left-style:dashed}.ngfc-banner-continues-after{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0}.ngfc-allday-label{font-size:.7em;color:var(--ngfc-text-muted);padding:4px;display:flex;align-items:center;justify-content:center}.ngfc-allday-cell{padding:2px 4px;border-right:1px solid var(--ngfc-grid-line);display:flex;flex-direction:column;gap:2px}.ngfc-event-pill{border-left:3px solid transparent;border-radius:4px;padding:1px 6px;font-size:.72em;font-weight:500;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ngfc-event-pill.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-event-pill.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-event-pill.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-event-pill.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-event-pill.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-event-pill.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-event-pill.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-event-pill.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-event-pill:hover{filter:brightness(.97)}.ngfc-week-body{flex:1;min-height:0;overflow-y:auto}.ngfc-week-grid{display:grid;position:relative}.ngfc-hour-gutter{border-right:1px solid var(--ngfc-border-color)}.ngfc-hour-label{position:relative;font-size:.7em;color:var(--ngfc-text-muted);text-align:right;padding-right:6px}.ngfc-hour-label span{position:relative;top:-6px}.ngfc-day-column{position:relative;border-right:1px solid var(--ngfc-grid-line)}.ngfc-hour-slot{border-bottom:1px solid var(--ngfc-grid-line);cursor:pointer}.ngfc-hour-slot:hover{background:var(--ngfc-hover-bg)}.ngfc-now-line{position:absolute;left:0;right:0;height:2px;background:var(--ngfc-now-line);z-index:3}.ngfc-now-line:before{content:\"\";position:absolute;left:-4px;top:-4px;width:10px;height:10px;border-radius:50%;background:var(--ngfc-now-line)}.ngfc-timed-event{position:absolute;border-left:3px solid transparent;border-radius:4px;padding:2px 6px;font-size:.72em;overflow:hidden;cursor:pointer;z-index:2;display:flex;flex-direction:column;box-sizing:border-box;line-height:1.25}.ngfc-timed-event.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-timed-event.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-timed-event.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-timed-event.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-timed-event.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-timed-event.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-timed-event.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-timed-event.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-timed-event:hover{filter:brightness(.97)}.ngfc-timed-event-short{flex-direction:row;align-items:center;gap:5px;padding-top:0;padding-bottom:0}.ngfc-event-title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.ngfc-event-time{opacity:.75;font-size:.68em;white-space:nowrap;flex-shrink:0}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "pipe", type: i1.DatePipe, name: "date" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: WeekViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-week-view', standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-week\">\n  <div class=\"ngfc-week-header\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n    <div class=\"ngfc-week-gutter\"></div>\n    @for (day of days; track day.getTime()) {\n      <div class=\"ngfc-week-day-header\" [class.ngfc-week-day-header-today]=\"isTodayColumn(day)\">\n        <div class=\"ngfc-week-day-name\">{{ weekdayShortName(day) }}</div>\n        <div class=\"ngfc-week-day-number\">{{ day | date: 'd' }}</div>\n      </div>\n    }\n  </div>\n\n  @if (spanningEvents.length > 0) {\n    <div class=\"ngfc-week-banners\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n      <div class=\"ngfc-week-gutter\"></div>\n      <div\n        class=\"ngfc-banner-row\"\n        [style.grid-template-columns]=\"'repeat(' + days.length + ', 1fr)'\"\n        [style.grid-template-rows]=\"'repeat(' + spanningLaneCount + ', 22px)'\"\n      >\n        @for (item of spanningEvents; track item.event.id) {\n          <div\n            class=\"ngfc-event ngfc-banner-bar\"\n            [class]=\"colorClass(item.event.color)\"\n            [class.ngfc-banner-continues-before]=\"item.continuesBefore\"\n            [class.ngfc-banner-continues-after]=\"item.continuesAfter\"\n            [ngStyle]=\"spanningEventStyle(item)\"\n            (click)=\"onSpanningEventClick(item, $event)\"\n            [title]=\"item.event.title\"\n          >\n            {{ item.event.title }}\n          </div>\n        }\n      </div>\n    </div>\n  }\n\n  @if (hasAllDayEvents) {\n    <div class=\"ngfc-week-allday\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n      <div class=\"ngfc-week-gutter ngfc-allday-label\">All day</div>\n      @for (dayEvents of allDayEventsByDay; track $index) {\n        <div class=\"ngfc-allday-cell\">\n          @for (event of dayEvents; track event.id) {\n            <div\n              class=\"ngfc-event ngfc-event-pill\"\n              [class]=\"colorClass(event.color)\"\n              [ngStyle]=\"colorStyle(event.color)\"\n              (click)=\"onEventClick(event, $event)\"\n            >\n              {{ event.title }}\n            </div>\n          }\n        </div>\n      }\n    </div>\n  }\n\n  <div class=\"ngfc-week-body\" #scrollContainer>\n    <div class=\"ngfc-week-grid\" [style.grid-template-columns]=\"'60px repeat(' + days.length + ', 1fr)'\">\n      <div class=\"ngfc-hour-gutter\">\n        @for (hour of hours; track hour) {\n          <div class=\"ngfc-hour-label\" [style.height.px]=\"hourHeight\">\n            @if (hour > 0) {\n              <span>{{ hourLabel(hour) }}</span>\n            }\n          </div>\n        }\n      </div>\n\n      @for (day of days; track day.getTime(); let dayIndex = $index) {\n        <div class=\"ngfc-day-column\">\n          @for (hour of hours; track hour) {\n            <div class=\"ngfc-hour-slot\" [style.height.px]=\"hourHeight\" (click)=\"onSlotClick(day, hour)\"></div>\n          }\n\n          @if (isTodayColumn(day)) {\n            <div class=\"ngfc-now-line\" [style.top.px]=\"nowOffsetPx\"></div>\n          }\n\n          @for (item of positionedByDay[dayIndex]; track item.event.id) {\n            <div\n              class=\"ngfc-event ngfc-timed-event\"\n              [class]=\"colorClass(item.event.color)\"\n              [class.ngfc-timed-event-short]=\"isShortEvent(item)\"\n              [style.top.px]=\"eventTop(item)\"\n              [style.height.px]=\"eventHeight(item)\"\n              [style.width.%]=\"eventWidthPercent(item)\"\n              [style.left.%]=\"eventLeftPercent(item)\"\n              [ngStyle]=\"colorStyle(item.event.color)\"\n              (click)=\"onEventClick(item.event, $event)\"\n              [title]=\"item.event.title\"\n            >\n              <span class=\"ngfc-event-title\">{{ item.event.title }}</span>\n              <span class=\"ngfc-event-time\">{{ formatEventTimeRange(item) }}</span>\n            </div>\n          }\n        </div>\n      }\n    </div>\n  </div>\n</div>\n", styles: [":host{display:flex;flex-direction:column;min-height:0;flex:1}.ngfc-week{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden}.ngfc-week-header,.ngfc-week-allday,.ngfc-week-banners{display:grid;border-bottom:1px solid var(--ngfc-border-color)}.ngfc-week-gutter{border-right:1px solid var(--ngfc-border-color)}.ngfc-week-day-header{text-align:center;padding:8px 4px}.ngfc-week-day-header-today .ngfc-week-day-number{background:var(--ngfc-today-text);color:#fff}.ngfc-week-day-name{font-size:.7em;text-transform:uppercase;color:var(--ngfc-text-muted)}.ngfc-week-day-number{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:1em;margin-top:2px}.ngfc-banner-row{display:grid;grid-column:2/-1;gap:2px 0;padding:3px 0}.ngfc-banner-bar{margin:0 1px;padding:2px 8px;font-size:.72em;font-weight:600;border-radius:4px;border-left:3px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;display:flex;align-items:center}.ngfc-banner-bar.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-banner-bar.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-banner-bar.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-banner-bar.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-banner-bar.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-banner-bar.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-banner-bar.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-banner-bar.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-banner-bar:hover{filter:brightness(.97)}.ngfc-banner-continues-before{margin-left:0;border-top-left-radius:0;border-bottom-left-radius:0;border-left-style:dashed}.ngfc-banner-continues-after{margin-right:0;border-top-right-radius:0;border-bottom-right-radius:0}.ngfc-allday-label{font-size:.7em;color:var(--ngfc-text-muted);padding:4px;display:flex;align-items:center;justify-content:center}.ngfc-allday-cell{padding:2px 4px;border-right:1px solid var(--ngfc-grid-line);display:flex;flex-direction:column;gap:2px}.ngfc-event-pill{border-left:3px solid transparent;border-radius:4px;padding:1px 6px;font-size:.72em;font-weight:500;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ngfc-event-pill.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-event-pill.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-event-pill.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-event-pill.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-event-pill.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-event-pill.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-event-pill.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-event-pill.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-event-pill:hover{filter:brightness(.97)}.ngfc-week-body{flex:1;min-height:0;overflow-y:auto}.ngfc-week-grid{display:grid;position:relative}.ngfc-hour-gutter{border-right:1px solid var(--ngfc-border-color)}.ngfc-hour-label{position:relative;font-size:.7em;color:var(--ngfc-text-muted);text-align:right;padding-right:6px}.ngfc-hour-label span{position:relative;top:-6px}.ngfc-day-column{position:relative;border-right:1px solid var(--ngfc-grid-line)}.ngfc-hour-slot{border-bottom:1px solid var(--ngfc-grid-line);cursor:pointer}.ngfc-hour-slot:hover{background:var(--ngfc-hover-bg)}.ngfc-now-line{position:absolute;left:0;right:0;height:2px;background:var(--ngfc-now-line);z-index:3}.ngfc-now-line:before{content:\"\";position:absolute;left:-4px;top:-4px;width:10px;height:10px;border-radius:50%;background:var(--ngfc-now-line)}.ngfc-timed-event{position:absolute;border-left:3px solid transparent;border-radius:4px;padding:2px 6px;font-size:.72em;overflow:hidden;cursor:pointer;z-index:2;display:flex;flex-direction:column;box-sizing:border-box;line-height:1.25}.ngfc-timed-event.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-timed-event.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-timed-event.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-timed-event.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-timed-event.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-timed-event.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-timed-event.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-timed-event.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-timed-event:hover{filter:brightness(.97)}.ngfc-timed-event-short{flex-direction:row;align-items:center;gap:5px;padding-top:0;padding-bottom:0}.ngfc-event-title{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.ngfc-event-time{opacity:.75;font-size:.68em;white-space:nowrap;flex-shrink:0}\n"] }]
        }], propDecorators: { date: [{
                type: Input,
                args: [{ required: true }]
            }], events: [{
                type: Input
            }], weekStartsOn: [{
                type: Input
            }], singleDay: [{
                type: Input
            }], locale: [{
                type: Input
            }], eventClick: [{
                type: Output
            }], slotClick: [{
                type: Output
            }], scrollContainer: [{
                type: ViewChild,
                args: ['scrollContainer']
            }] } });

const AGENDA_RANGE_DAYS = 30;
class AgendaViewComponent {
    date;
    events = [];
    rangeDays = AGENDA_RANGE_DAYS;
    locale = null;
    eventClick = new EventEmitter();
    groups = [];
    totalEventCount = 0;
    rangeLabel = '';
    resolvedLocale = resolveLocale(null);
    ngOnChanges() {
        this.resolvedLocale = resolveLocale(this.locale);
        this.groups = this.buildGroups();
        this.totalEventCount = new Set(this.groups.flatMap((g) => [...g.bannerEvents, ...g.timedEvents].map((e) => e.id)))
            .size;
        this.rangeLabel = this.date.getFullYear().toString();
    }
    buildGroups() {
        const rangeStart = startOfDay(this.date);
        const rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeEnd.getDate() + this.rangeDays);
        const inRange = this.events
            .filter((e) => e.end >= rangeStart && e.start < rangeEnd)
            .sort((a, b) => a.start.getTime() - b.start.getTime());
        const byDay = new Map();
        for (let d = new Date(rangeStart); d < rangeEnd; d.setDate(d.getDate() + 1)) {
            byDay.set(startOfDay(d).getTime(), []);
        }
        for (const event of inRange) {
            if (isMultiDay(event)) {
                for (let d = new Date(Math.max(event.start.getTime(), rangeStart.getTime())); d <= event.end && d < rangeEnd; d.setDate(d.getDate() + 1)) {
                    const key = startOfDay(d).getTime();
                    if (byDay.has(key)) {
                        byDay.get(key).push(event);
                    }
                }
            }
            else {
                const key = startOfDay(event.start).getTime();
                if (byDay.has(key)) {
                    byDay.get(key).push(event);
                }
            }
        }
        return Array.from(byDay.entries())
            .filter(([, events]) => events.length > 0)
            .sort(([a], [b]) => a - b)
            .map(([time, events]) => ({
            date: new Date(time),
            isToday: isToday(new Date(time)),
            bannerEvents: events.filter(isMultiDay),
            timedEvents: events.filter((e) => !isMultiDay(e)),
        }));
    }
    formatEndDate(event) {
        return `${event.end.getDate()} ${this.resolvedLocale.monthNamesShort[event.end.getMonth()]}`;
    }
    formatTimeRange(event) {
        if (isEffectivelyAllDay(event)) {
            return 'All day';
        }
        return `${formatTime(event.start, this.resolvedLocale.timeFormat)} - ${formatTime(event.end, this.resolvedLocale.timeFormat)}`;
    }
    weekdayLongName(date) {
        return this.resolvedLocale.weekdayNamesLong[date.getDay()];
    }
    monthShortName(date) {
        return this.resolvedLocale.monthNamesShort[date.getMonth()];
    }
    colorClass(color) {
        return resolveEventColor(color).className;
    }
    colorStyle(color) {
        return resolveEventColor(color).style;
    }
    dotColorClass(color) {
        return resolveEventDotColor(color).className;
    }
    dotColorStyle(color) {
        return resolveEventDotColor(color).style;
    }
    onEventClick(event) {
        this.eventClick.emit(event);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: AgendaViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: AgendaViewComponent, isStandalone: true, selector: "ngfc-agenda-view", inputs: { date: "date", events: "events", rangeDays: "rangeDays", locale: "locale" }, outputs: { eventClick: "eventClick" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"ngfc-agenda\">\n  @if (groups.length === 0) {\n    <div class=\"ngfc-agenda-empty\">No upcoming events</div>\n  }\n\n  @for (group of groups; track group.date.getTime()) {\n    <div class=\"ngfc-agenda-row\">\n      <div class=\"ngfc-agenda-date\" [class.ngfc-agenda-date-today]=\"group.isToday\">\n        <span class=\"ngfc-agenda-daynum\">{{ group.date.getDate() }}</span>\n        <span class=\"ngfc-agenda-weekday\">{{ weekdayLongName(group.date) }}</span>\n        <span class=\"ngfc-agenda-month\">{{ monthShortName(group.date) }} {{ group.date.getFullYear() }}</span>\n      </div>\n\n      <div class=\"ngfc-agenda-content\">\n        @for (event of group.bannerEvents; track event.id) {\n          <div class=\"ngfc-agenda-line\">\n            <span class=\"ngfc-agenda-endlabel\">Ends {{ formatEndDate(event) }}</span>\n            <span\n              class=\"ngfc-event ngfc-agenda-tag\"\n              [class]=\"colorClass(event.color)\"\n              [ngStyle]=\"colorStyle(event.color)\"\n              (click)=\"onEventClick(event)\"\n            >\n              {{ event.title }} &#8250;\n            </span>\n          </div>\n        }\n\n        @for (event of group.timedEvents; track event.id) {\n          <div class=\"ngfc-agenda-line ngfc-agenda-event\" (click)=\"onEventClick(event)\">\n            <span class=\"ngfc-agenda-time\">{{ formatTimeRange(event) }}</span>\n            <span class=\"ngfc-agenda-item\">\n              <span\n                class=\"ngfc-event ngfc-agenda-dot\"\n                [class]=\"dotColorClass(event.color)\"\n                [ngStyle]=\"dotColorStyle(event.color)\"\n              ></span>\n              <span class=\"ngfc-agenda-title\">{{ event.title }}</span>\n            </span>\n          </div>\n        }\n      </div>\n    </div>\n  }\n</div>\n", styles: [":host{display:flex;flex-direction:column;min-height:0;flex:1}.ngfc-agenda{display:flex;flex-direction:column;overflow-y:auto;height:100%}.ngfc-agenda-empty{padding:32px;text-align:center;color:var(--ngfc-text-muted)}.ngfc-agenda-row{display:flex;gap:24px;padding:18px 4px;border-bottom:1px solid var(--ngfc-grid-line)}.ngfc-agenda-date{display:flex;flex-direction:column;min-width:90px;color:var(--ngfc-text)}.ngfc-agenda-date-today .ngfc-agenda-daynum{color:var(--ngfc-today-text)}.ngfc-agenda-daynum{font-size:2em;font-weight:700;line-height:1.1}.ngfc-agenda-weekday{font-size:.85em;font-weight:600;color:var(--ngfc-text)}.ngfc-agenda-month{font-size:.78em;color:var(--ngfc-text-muted);font-weight:600}.ngfc-agenda-content{flex:1;display:flex;flex-direction:column;gap:10px}.ngfc-agenda-line{display:flex;align-items:center;gap:16px}.ngfc-agenda-endlabel{min-width:100px;font-size:.8em;color:var(--ngfc-text-muted)}.ngfc-agenda-tag{border-left:3px solid transparent;border-radius:14px;padding:4px 14px;font-size:.8em;font-weight:600;cursor:pointer}.ngfc-agenda-tag.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-agenda-tag.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-agenda-tag.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-agenda-tag.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-agenda-tag.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-agenda-tag.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-agenda-tag.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-agenda-tag.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-agenda-tag:hover{filter:brightness(.97)}.ngfc-agenda-event{cursor:pointer;border-radius:4px;padding:2px 4px}.ngfc-agenda-event:hover{background:var(--ngfc-hover-bg)}.ngfc-agenda-time{min-width:100px;font-size:.85em;color:var(--ngfc-text)}.ngfc-agenda-item{display:flex;align-items:center;gap:8px}.ngfc-agenda-dot{width:8px;height:8px;min-width:8px;border-radius:50%;border:none}.ngfc-agenda-dot.ngfc-color-blue{background-color:var(--ngfc-color-blue-border)}.ngfc-agenda-dot.ngfc-color-green{background-color:var(--ngfc-color-green-border)}.ngfc-agenda-dot.ngfc-color-red{background-color:var(--ngfc-color-red-border)}.ngfc-agenda-dot.ngfc-color-yellow{background-color:var(--ngfc-color-yellow-border)}.ngfc-agenda-dot.ngfc-color-purple{background-color:var(--ngfc-color-purple-border)}.ngfc-agenda-dot.ngfc-color-orange{background-color:var(--ngfc-color-orange-border)}.ngfc-agenda-dot.ngfc-color-teal{background-color:var(--ngfc-color-teal-border)}.ngfc-agenda-dot.ngfc-color-gray{background-color:var(--ngfc-color-gray-border)}.ngfc-agenda-title{font-size:.9em;font-weight:600;color:var(--ngfc-text)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: AgendaViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-agenda-view', standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-agenda\">\n  @if (groups.length === 0) {\n    <div class=\"ngfc-agenda-empty\">No upcoming events</div>\n  }\n\n  @for (group of groups; track group.date.getTime()) {\n    <div class=\"ngfc-agenda-row\">\n      <div class=\"ngfc-agenda-date\" [class.ngfc-agenda-date-today]=\"group.isToday\">\n        <span class=\"ngfc-agenda-daynum\">{{ group.date.getDate() }}</span>\n        <span class=\"ngfc-agenda-weekday\">{{ weekdayLongName(group.date) }}</span>\n        <span class=\"ngfc-agenda-month\">{{ monthShortName(group.date) }} {{ group.date.getFullYear() }}</span>\n      </div>\n\n      <div class=\"ngfc-agenda-content\">\n        @for (event of group.bannerEvents; track event.id) {\n          <div class=\"ngfc-agenda-line\">\n            <span class=\"ngfc-agenda-endlabel\">Ends {{ formatEndDate(event) }}</span>\n            <span\n              class=\"ngfc-event ngfc-agenda-tag\"\n              [class]=\"colorClass(event.color)\"\n              [ngStyle]=\"colorStyle(event.color)\"\n              (click)=\"onEventClick(event)\"\n            >\n              {{ event.title }} &#8250;\n            </span>\n          </div>\n        }\n\n        @for (event of group.timedEvents; track event.id) {\n          <div class=\"ngfc-agenda-line ngfc-agenda-event\" (click)=\"onEventClick(event)\">\n            <span class=\"ngfc-agenda-time\">{{ formatTimeRange(event) }}</span>\n            <span class=\"ngfc-agenda-item\">\n              <span\n                class=\"ngfc-event ngfc-agenda-dot\"\n                [class]=\"dotColorClass(event.color)\"\n                [ngStyle]=\"dotColorStyle(event.color)\"\n              ></span>\n              <span class=\"ngfc-agenda-title\">{{ event.title }}</span>\n            </span>\n          </div>\n        }\n      </div>\n    </div>\n  }\n</div>\n", styles: [":host{display:flex;flex-direction:column;min-height:0;flex:1}.ngfc-agenda{display:flex;flex-direction:column;overflow-y:auto;height:100%}.ngfc-agenda-empty{padding:32px;text-align:center;color:var(--ngfc-text-muted)}.ngfc-agenda-row{display:flex;gap:24px;padding:18px 4px;border-bottom:1px solid var(--ngfc-grid-line)}.ngfc-agenda-date{display:flex;flex-direction:column;min-width:90px;color:var(--ngfc-text)}.ngfc-agenda-date-today .ngfc-agenda-daynum{color:var(--ngfc-today-text)}.ngfc-agenda-daynum{font-size:2em;font-weight:700;line-height:1.1}.ngfc-agenda-weekday{font-size:.85em;font-weight:600;color:var(--ngfc-text)}.ngfc-agenda-month{font-size:.78em;color:var(--ngfc-text-muted);font-weight:600}.ngfc-agenda-content{flex:1;display:flex;flex-direction:column;gap:10px}.ngfc-agenda-line{display:flex;align-items:center;gap:16px}.ngfc-agenda-endlabel{min-width:100px;font-size:.8em;color:var(--ngfc-text-muted)}.ngfc-agenda-tag{border-left:3px solid transparent;border-radius:14px;padding:4px 14px;font-size:.8em;font-weight:600;cursor:pointer}.ngfc-agenda-tag.ngfc-color-blue{background:var(--ngfc-color-blue-bg);border-color:var(--ngfc-color-blue-border);color:var(--ngfc-color-blue-text)}.ngfc-agenda-tag.ngfc-color-green{background:var(--ngfc-color-green-bg);border-color:var(--ngfc-color-green-border);color:var(--ngfc-color-green-text)}.ngfc-agenda-tag.ngfc-color-red{background:var(--ngfc-color-red-bg);border-color:var(--ngfc-color-red-border);color:var(--ngfc-color-red-text)}.ngfc-agenda-tag.ngfc-color-yellow{background:var(--ngfc-color-yellow-bg);border-color:var(--ngfc-color-yellow-border);color:var(--ngfc-color-yellow-text)}.ngfc-agenda-tag.ngfc-color-purple{background:var(--ngfc-color-purple-bg);border-color:var(--ngfc-color-purple-border);color:var(--ngfc-color-purple-text)}.ngfc-agenda-tag.ngfc-color-orange{background:var(--ngfc-color-orange-bg);border-color:var(--ngfc-color-orange-border);color:var(--ngfc-color-orange-text)}.ngfc-agenda-tag.ngfc-color-teal{background:var(--ngfc-color-teal-bg);border-color:var(--ngfc-color-teal-border);color:var(--ngfc-color-teal-text)}.ngfc-agenda-tag.ngfc-color-gray{background:var(--ngfc-color-gray-bg);border-color:var(--ngfc-color-gray-border);color:var(--ngfc-color-gray-text)}.ngfc-agenda-tag:hover{filter:brightness(.97)}.ngfc-agenda-event{cursor:pointer;border-radius:4px;padding:2px 4px}.ngfc-agenda-event:hover{background:var(--ngfc-hover-bg)}.ngfc-agenda-time{min-width:100px;font-size:.85em;color:var(--ngfc-text)}.ngfc-agenda-item{display:flex;align-items:center;gap:8px}.ngfc-agenda-dot{width:8px;height:8px;min-width:8px;border-radius:50%;border:none}.ngfc-agenda-dot.ngfc-color-blue{background-color:var(--ngfc-color-blue-border)}.ngfc-agenda-dot.ngfc-color-green{background-color:var(--ngfc-color-green-border)}.ngfc-agenda-dot.ngfc-color-red{background-color:var(--ngfc-color-red-border)}.ngfc-agenda-dot.ngfc-color-yellow{background-color:var(--ngfc-color-yellow-border)}.ngfc-agenda-dot.ngfc-color-purple{background-color:var(--ngfc-color-purple-border)}.ngfc-agenda-dot.ngfc-color-orange{background-color:var(--ngfc-color-orange-border)}.ngfc-agenda-dot.ngfc-color-teal{background-color:var(--ngfc-color-teal-border)}.ngfc-agenda-dot.ngfc-color-gray{background-color:var(--ngfc-color-gray-border)}.ngfc-agenda-title{font-size:.9em;font-weight:600;color:var(--ngfc-text)}\n"] }]
        }], propDecorators: { date: [{
                type: Input,
                args: [{ required: true }]
            }], events: [{
                type: Input
            }], rangeDays: [{
                type: Input
            }], locale: [{
                type: Input
            }], eventClick: [{
                type: Output
            }] } });

const COLOR_OPTIONS = [
    'blue',
    'green',
    'red',
    'yellow',
    'purple',
    'orange',
    'teal',
    'gray',
];
function toDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function toTimeInputValue(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}
function combineDateAndTime(dateStr, timeStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
}
let autoId = 0;
function generateId() {
    autoId += 1;
    return `ngfc-event-${Date.now()}-${autoId}`;
}
class EventEditorComponent {
    event = null;
    defaultDate = new Date();
    save = new EventEmitter();
    delete = new EventEmitter();
    close = new EventEmitter();
    colorOptions = COLOR_OPTIONS;
    isNew = true;
    title = '';
    startDate = '';
    startTime = '';
    endDate = '';
    endTime = '';
    allDay = false;
    color = 'blue';
    customColor = '#4c8df5';
    location = '';
    description = '';
    editingId = '';
    ngOnChanges() {
        if (this.event) {
            this.isNew = false;
            this.editingId = this.event.id;
            this.title = this.event.title;
            this.allDay = !!this.event.allDay;
            this.color = this.event.color ?? 'blue';
            if (this.color && !isNamedColor(this.color)) {
                this.customColor = this.color;
            }
            this.location = this.event.location ?? '';
            this.description = this.event.description ?? '';
            this.startDate = toDateInputValue(this.event.start);
            this.startTime = toTimeInputValue(this.event.start);
            this.endDate = toDateInputValue(this.event.end);
            this.endTime = toTimeInputValue(this.event.end);
        }
        else {
            this.isNew = true;
            this.editingId = generateId();
            this.title = '';
            this.allDay = false;
            this.color = 'blue';
            this.location = '';
            this.description = '';
            const start = new Date(this.defaultDate);
            const end = new Date(start);
            end.setHours(end.getHours() + 1);
            this.startDate = toDateInputValue(start);
            this.startTime = toTimeInputValue(start);
            this.endDate = toDateInputValue(end);
            this.endTime = toTimeInputValue(end);
        }
    }
    selectColor(color) {
        this.color = color;
    }
    get isCustomColorSelected() {
        return !isNamedColor(this.color);
    }
    onCustomColorChange(hex) {
        this.customColor = hex;
        this.color = hex;
    }
    selectCustomColor() {
        this.color = this.customColor;
    }
    onSave() {
        if (!this.title.trim()) {
            return;
        }
        const start = this.allDay
            ? combineDateAndTime(this.startDate, '00:00')
            : combineDateAndTime(this.startDate, this.startTime);
        let end = this.allDay
            ? combineDateAndTime(this.endDate, '23:59')
            : combineDateAndTime(this.endDate, this.endTime);
        if (end <= start) {
            end = new Date(start);
            end.setHours(end.getHours() + 1);
        }
        const result = {
            id: this.editingId,
            title: this.title.trim(),
            start,
            end,
            allDay: this.allDay,
            color: this.color,
            location: this.location.trim() || undefined,
            description: this.description.trim() || undefined,
        };
        this.save.emit({ event: result, isNew: this.isNew });
    }
    onDelete() {
        if (this.event) {
            this.delete.emit(this.event);
        }
    }
    onClose() {
        this.close.emit();
    }
    onBackdropClick(domEvent) {
        if (domEvent.target === domEvent.currentTarget) {
            this.onClose();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: EventEditorComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: EventEditorComponent, isStandalone: true, selector: "ngfc-event-editor", inputs: { event: "event", defaultDate: "defaultDate" }, outputs: { save: "save", delete: "delete", close: "close" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"ngfc-modal-backdrop\" (click)=\"onBackdropClick($event)\">\n  <div class=\"ngfc-modal\" role=\"dialog\" aria-modal=\"true\">\n    <div class=\"ngfc-modal-header\">\n      <input\n        class=\"ngfc-title-input\"\n        type=\"text\"\n        placeholder=\"Add title\"\n        [(ngModel)]=\"title\"\n        autofocus\n      />\n      <button type=\"button\" class=\"ngfc-icon-btn\" (click)=\"onClose()\" aria-label=\"Close\">&#10005;</button>\n    </div>\n\n    <div class=\"ngfc-modal-body\">\n      <div class=\"ngfc-field-row ngfc-allday-row\">\n        <label class=\"ngfc-checkbox-label\">\n          <input type=\"checkbox\" [(ngModel)]=\"allDay\" />\n          All day\n        </label>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Start</label>\n          <div class=\"ngfc-datetime\">\n            <input type=\"date\" [(ngModel)]=\"startDate\" />\n            @if (!allDay) {\n              <input type=\"time\" [(ngModel)]=\"startTime\" />\n            }\n          </div>\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>End</label>\n          <div class=\"ngfc-datetime\">\n            <input type=\"date\" [(ngModel)]=\"endDate\" />\n            @if (!allDay) {\n              <input type=\"time\" [(ngModel)]=\"endTime\" />\n            }\n          </div>\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Location</label>\n          <input type=\"text\" placeholder=\"Add location\" [(ngModel)]=\"location\" />\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Description</label>\n          <textarea rows=\"2\" placeholder=\"Add description\" [(ngModel)]=\"description\"></textarea>\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Color</label>\n          <div class=\"ngfc-color-swatches\">\n            @for (c of colorOptions; track c) {\n              <button\n                type=\"button\"\n                class=\"ngfc-swatch ngfc-event\"\n                [class]=\"'ngfc-color-' + c\"\n                [class.ngfc-swatch-selected]=\"c === color\"\n                (click)=\"selectColor(c)\"\n                [attr.aria-label]=\"c\"\n              ></button>\n            }\n            <label\n              class=\"ngfc-swatch ngfc-custom-swatch\"\n              [class.ngfc-swatch-selected]=\"isCustomColorSelected\"\n              [style.background]=\"customColor\"\n              title=\"Custom color\"\n              (click)=\"selectCustomColor()\"\n            >\n              <input\n                type=\"color\"\n                class=\"ngfc-custom-color-input\"\n                [value]=\"customColor\"\n                (input)=\"onCustomColorChange($any($event.target).value)\"\n                aria-label=\"Custom color\"\n              />\n            </label>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"ngfc-modal-footer\">\n      @if (!isNew) {\n        <button type=\"button\" class=\"ngfc-btn ngfc-btn-danger\" (click)=\"onDelete()\">Delete</button>\n      }\n      <span class=\"ngfc-footer-spacer\"></span>\n      <button type=\"button\" class=\"ngfc-btn\" (click)=\"onClose()\">Cancel</button>\n      <button type=\"button\" class=\"ngfc-btn ngfc-btn-primary\" (click)=\"onSave()\">Save</button>\n    </div>\n  </div>\n</div>\n", styles: [".ngfc-modal-backdrop{position:fixed;inset:0;background:#0006;display:flex;align-items:center;justify-content:center;z-index:1000}.ngfc-modal{background:var(--ngfc-bg);color:var(--ngfc-text);border-radius:8px;width:420px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px);overflow-y:auto;box-shadow:0 8px 24px #00000040;display:flex;flex-direction:column}.ngfc-modal-header{display:flex;align-items:center;gap:8px;padding:16px 16px 8px}.ngfc-title-input{flex:1;border:none;border-bottom:2px solid var(--ngfc-border-color);font-size:1.1em;padding:4px 2px 8px;color:var(--ngfc-text);background:transparent}.ngfc-title-input:focus{outline:none;border-bottom-color:var(--ngfc-today-text)}.ngfc-icon-btn{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text-muted);font-size:.9em;padding:6px;border-radius:50%}.ngfc-icon-btn:hover{background:var(--ngfc-hover-bg)}.ngfc-modal-body{padding:8px 16px 16px;display:flex;flex-direction:column;gap:14px}.ngfc-field-row{display:flex}.ngfc-field{display:flex;flex-direction:column;gap:4px;flex:1}.ngfc-field label{font-size:.75em;color:var(--ngfc-text-muted);text-transform:uppercase;letter-spacing:.02em}.ngfc-field input[type=text],.ngfc-field input[type=date],.ngfc-field input[type=time],.ngfc-field textarea{border:1px solid var(--ngfc-border-color);border-radius:4px;padding:6px 8px;font-size:.875em;color:var(--ngfc-text);background:var(--ngfc-bg);font-family:inherit}.ngfc-field input[type=text]:focus,.ngfc-field input[type=date]:focus,.ngfc-field input[type=time]:focus,.ngfc-field textarea:focus{outline:none;border-color:var(--ngfc-today-text)}.ngfc-field textarea{resize:vertical}.ngfc-datetime{display:flex;gap:8px}.ngfc-datetime input[type=date]{flex:1.3}.ngfc-datetime input[type=time]{flex:1}.ngfc-checkbox-label{display:flex;align-items:center;gap:6px;font-size:.875em;cursor:pointer}.ngfc-color-swatches{display:flex;gap:8px;flex-wrap:wrap}.ngfc-swatch{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}.ngfc-swatch:hover{filter:brightness(1.1)}.ngfc-swatch-selected{border-color:var(--ngfc-text);box-shadow:0 0 0 2px var(--ngfc-bg) inset}.ngfc-custom-swatch{position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:2px dashed var(--ngfc-border-color)}.ngfc-custom-swatch.ngfc-swatch-selected{border-style:solid}.ngfc-custom-color-input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0}.ngfc-modal-footer{display:flex;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid var(--ngfc-border-color)}.ngfc-footer-spacer{flex:1}.ngfc-btn{cursor:pointer;border:1px solid var(--ngfc-border-color);background:var(--ngfc-bg);color:var(--ngfc-text);border-radius:4px;padding:6px 14px;font-size:.875em}.ngfc-btn:hover{background:var(--ngfc-hover-bg)}.ngfc-btn-primary{background:var(--ngfc-today-text);border-color:var(--ngfc-today-text);color:#fff}.ngfc-btn-primary:hover{filter:brightness(1.08)}.ngfc-btn-danger{border-color:var(--ngfc-color-red-bg);color:var(--ngfc-color-red-bg)}.ngfc-btn-danger:hover{background:var(--ngfc-color-red-bg);color:#fff}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$1.CheckboxControlValueAccessor, selector: "input[type=checkbox][formControlName],input[type=checkbox][formControl],input[type=checkbox][ngModel]" }, { kind: "directive", type: i1$1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: EventEditorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-event-editor', standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-modal-backdrop\" (click)=\"onBackdropClick($event)\">\n  <div class=\"ngfc-modal\" role=\"dialog\" aria-modal=\"true\">\n    <div class=\"ngfc-modal-header\">\n      <input\n        class=\"ngfc-title-input\"\n        type=\"text\"\n        placeholder=\"Add title\"\n        [(ngModel)]=\"title\"\n        autofocus\n      />\n      <button type=\"button\" class=\"ngfc-icon-btn\" (click)=\"onClose()\" aria-label=\"Close\">&#10005;</button>\n    </div>\n\n    <div class=\"ngfc-modal-body\">\n      <div class=\"ngfc-field-row ngfc-allday-row\">\n        <label class=\"ngfc-checkbox-label\">\n          <input type=\"checkbox\" [(ngModel)]=\"allDay\" />\n          All day\n        </label>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Start</label>\n          <div class=\"ngfc-datetime\">\n            <input type=\"date\" [(ngModel)]=\"startDate\" />\n            @if (!allDay) {\n              <input type=\"time\" [(ngModel)]=\"startTime\" />\n            }\n          </div>\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>End</label>\n          <div class=\"ngfc-datetime\">\n            <input type=\"date\" [(ngModel)]=\"endDate\" />\n            @if (!allDay) {\n              <input type=\"time\" [(ngModel)]=\"endTime\" />\n            }\n          </div>\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Location</label>\n          <input type=\"text\" placeholder=\"Add location\" [(ngModel)]=\"location\" />\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Description</label>\n          <textarea rows=\"2\" placeholder=\"Add description\" [(ngModel)]=\"description\"></textarea>\n        </div>\n      </div>\n\n      <div class=\"ngfc-field-row\">\n        <div class=\"ngfc-field\">\n          <label>Color</label>\n          <div class=\"ngfc-color-swatches\">\n            @for (c of colorOptions; track c) {\n              <button\n                type=\"button\"\n                class=\"ngfc-swatch ngfc-event\"\n                [class]=\"'ngfc-color-' + c\"\n                [class.ngfc-swatch-selected]=\"c === color\"\n                (click)=\"selectColor(c)\"\n                [attr.aria-label]=\"c\"\n              ></button>\n            }\n            <label\n              class=\"ngfc-swatch ngfc-custom-swatch\"\n              [class.ngfc-swatch-selected]=\"isCustomColorSelected\"\n              [style.background]=\"customColor\"\n              title=\"Custom color\"\n              (click)=\"selectCustomColor()\"\n            >\n              <input\n                type=\"color\"\n                class=\"ngfc-custom-color-input\"\n                [value]=\"customColor\"\n                (input)=\"onCustomColorChange($any($event.target).value)\"\n                aria-label=\"Custom color\"\n              />\n            </label>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"ngfc-modal-footer\">\n      @if (!isNew) {\n        <button type=\"button\" class=\"ngfc-btn ngfc-btn-danger\" (click)=\"onDelete()\">Delete</button>\n      }\n      <span class=\"ngfc-footer-spacer\"></span>\n      <button type=\"button\" class=\"ngfc-btn\" (click)=\"onClose()\">Cancel</button>\n      <button type=\"button\" class=\"ngfc-btn ngfc-btn-primary\" (click)=\"onSave()\">Save</button>\n    </div>\n  </div>\n</div>\n", styles: [".ngfc-modal-backdrop{position:fixed;inset:0;background:#0006;display:flex;align-items:center;justify-content:center;z-index:1000}.ngfc-modal{background:var(--ngfc-bg);color:var(--ngfc-text);border-radius:8px;width:420px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px);overflow-y:auto;box-shadow:0 8px 24px #00000040;display:flex;flex-direction:column}.ngfc-modal-header{display:flex;align-items:center;gap:8px;padding:16px 16px 8px}.ngfc-title-input{flex:1;border:none;border-bottom:2px solid var(--ngfc-border-color);font-size:1.1em;padding:4px 2px 8px;color:var(--ngfc-text);background:transparent}.ngfc-title-input:focus{outline:none;border-bottom-color:var(--ngfc-today-text)}.ngfc-icon-btn{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text-muted);font-size:.9em;padding:6px;border-radius:50%}.ngfc-icon-btn:hover{background:var(--ngfc-hover-bg)}.ngfc-modal-body{padding:8px 16px 16px;display:flex;flex-direction:column;gap:14px}.ngfc-field-row{display:flex}.ngfc-field{display:flex;flex-direction:column;gap:4px;flex:1}.ngfc-field label{font-size:.75em;color:var(--ngfc-text-muted);text-transform:uppercase;letter-spacing:.02em}.ngfc-field input[type=text],.ngfc-field input[type=date],.ngfc-field input[type=time],.ngfc-field textarea{border:1px solid var(--ngfc-border-color);border-radius:4px;padding:6px 8px;font-size:.875em;color:var(--ngfc-text);background:var(--ngfc-bg);font-family:inherit}.ngfc-field input[type=text]:focus,.ngfc-field input[type=date]:focus,.ngfc-field input[type=time]:focus,.ngfc-field textarea:focus{outline:none;border-color:var(--ngfc-today-text)}.ngfc-field textarea{resize:vertical}.ngfc-datetime{display:flex;gap:8px}.ngfc-datetime input[type=date]{flex:1.3}.ngfc-datetime input[type=time]{flex:1}.ngfc-checkbox-label{display:flex;align-items:center;gap:6px;font-size:.875em;cursor:pointer}.ngfc-color-swatches{display:flex;gap:8px;flex-wrap:wrap}.ngfc-swatch{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}.ngfc-swatch:hover{filter:brightness(1.1)}.ngfc-swatch-selected{border-color:var(--ngfc-text);box-shadow:0 0 0 2px var(--ngfc-bg) inset}.ngfc-custom-swatch{position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:2px dashed var(--ngfc-border-color)}.ngfc-custom-swatch.ngfc-swatch-selected{border-style:solid}.ngfc-custom-color-input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0}.ngfc-modal-footer{display:flex;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid var(--ngfc-border-color)}.ngfc-footer-spacer{flex:1}.ngfc-btn{cursor:pointer;border:1px solid var(--ngfc-border-color);background:var(--ngfc-bg);color:var(--ngfc-text);border-radius:4px;padding:6px 14px;font-size:.875em}.ngfc-btn:hover{background:var(--ngfc-hover-bg)}.ngfc-btn-primary{background:var(--ngfc-today-text);border-color:var(--ngfc-today-text);color:#fff}.ngfc-btn-primary:hover{filter:brightness(1.08)}.ngfc-btn-danger{border-color:var(--ngfc-color-red-bg);color:var(--ngfc-color-red-bg)}.ngfc-btn-danger:hover{background:var(--ngfc-color-red-bg);color:#fff}\n"] }]
        }], propDecorators: { event: [{
                type: Input
            }], defaultDate: [{
                type: Input
            }], save: [{
                type: Output
            }], delete: [{
                type: Output
            }], close: [{
                type: Output
            }] } });

class MiniCalendarComponent {
    selectedDate;
    weekStartsOn = 0;
    locale = null;
    selectedDateChange = new EventEmitter();
    /** The month currently displayed — may differ from selectedDate while browsing. */
    displayMonth = new Date();
    weeks = [];
    weekdayLabels = [];
    resolvedLocale = resolveLocale(null);
    ngOnChanges() {
        this.resolvedLocale = resolveLocale(this.locale);
        this.weekdayLabels = this.buildWeekdayLabels();
        this.displayMonth = this.selectedDate;
        this.rebuild();
    }
    buildWeekdayLabels() {
        const names = this.resolvedLocale.weekdayNamesShort;
        return Array.from({ length: 7 }, (_, i) => names[(i + this.weekStartsOn) % 7].charAt(0));
    }
    rebuild() {
        const gridDays = buildMonthGrid(this.displayMonth, this.weekStartsOn);
        const days = gridDays.map((date) => ({
            date,
            isCurrentMonth: date.getMonth() === this.displayMonth.getMonth(),
            isToday: isToday(date),
            isSelected: isSameDay(date, this.selectedDate),
        }));
        this.weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            this.weeks.push(days.slice(i, i + 7));
        }
    }
    get monthLabel() {
        return `${this.resolvedLocale.monthNamesLong[this.displayMonth.getMonth()]} ${this.displayMonth.getFullYear()}`;
    }
    previousMonth() {
        this.displayMonth = addMonths(this.displayMonth, -1);
        this.rebuild();
    }
    nextMonth() {
        this.displayMonth = addMonths(this.displayMonth, 1);
        this.rebuild();
    }
    previousYear() {
        this.displayMonth = addMonths(this.displayMonth, -12);
        this.rebuild();
    }
    nextYear() {
        this.displayMonth = addMonths(this.displayMonth, 12);
        this.rebuild();
    }
    selectDay(day) {
        this.selectedDateChange.emit(day.date);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MiniCalendarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: MiniCalendarComponent, isStandalone: true, selector: "ngfc-mini-calendar", inputs: { selectedDate: "selectedDate", weekStartsOn: "weekStartsOn", locale: "locale" }, outputs: { selectedDateChange: "selectedDateChange" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"ngfc-mini\">\n  <div class=\"ngfc-mini-header\">\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"previousYear()\" aria-label=\"Previous year\">&#171;</button>\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"previousMonth()\" aria-label=\"Previous month\">&#8249;</button>\n    <span class=\"ngfc-mini-title\">{{ monthLabel }}</span>\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"nextMonth()\" aria-label=\"Next month\">&#8250;</button>\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"nextYear()\" aria-label=\"Next year\">&#187;</button>\n  </div>\n\n  <div class=\"ngfc-mini-weekdays\">\n    @for (label of weekdayLabels; track $index) {\n      <span>{{ label }}</span>\n    }\n  </div>\n\n  <div class=\"ngfc-mini-grid\">\n    @for (week of weeks; track $index) {\n      @for (day of week; track day.date.getTime()) {\n        <button\n          type=\"button\"\n          class=\"ngfc-mini-day\"\n          [class.ngfc-mini-day-outside]=\"!day.isCurrentMonth\"\n          [class.ngfc-mini-day-today]=\"day.isToday\"\n          [class.ngfc-mini-day-selected]=\"day.isSelected\"\n          (click)=\"selectDay(day)\"\n        >\n          {{ day.date.getDate() }}\n        </button>\n      }\n    }\n  </div>\n</div>\n", styles: [".ngfc-mini{font-size:.8em}.ngfc-mini-header{display:flex;align-items:center;gap:2px;margin-bottom:10px}.ngfc-mini-title{flex:1;text-align:center;font-weight:700;font-size:.9em;color:var(--ngfc-text)}.ngfc-mini-nav{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text-muted);font-size:.8em;padding:4px 5px;border-radius:4px;line-height:1}.ngfc-mini-nav:hover{background:var(--ngfc-hover-bg);color:var(--ngfc-text)}.ngfc-mini-weekdays{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;color:var(--ngfc-text-muted);font-size:.7em;margin-bottom:4px}.ngfc-mini-grid{display:grid;grid-template-columns:repeat(7,1fr);row-gap:2px}.ngfc-mini-day{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text);font-size:.78em;padding:6px 0;border-radius:50%;width:28px;height:28px;justify-self:center;line-height:1}.ngfc-mini-day:hover{background:var(--ngfc-hover-bg)}.ngfc-mini-day-outside{color:var(--ngfc-text-muted);opacity:.6}.ngfc-mini-day-today{color:var(--ngfc-today-text);font-weight:700}.ngfc-mini-day-selected{background:var(--ngfc-today-bg);color:var(--ngfc-today-text);font-weight:700}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: MiniCalendarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-mini-calendar', standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-mini\">\n  <div class=\"ngfc-mini-header\">\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"previousYear()\" aria-label=\"Previous year\">&#171;</button>\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"previousMonth()\" aria-label=\"Previous month\">&#8249;</button>\n    <span class=\"ngfc-mini-title\">{{ monthLabel }}</span>\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"nextMonth()\" aria-label=\"Next month\">&#8250;</button>\n    <button type=\"button\" class=\"ngfc-mini-nav\" (click)=\"nextYear()\" aria-label=\"Next year\">&#187;</button>\n  </div>\n\n  <div class=\"ngfc-mini-weekdays\">\n    @for (label of weekdayLabels; track $index) {\n      <span>{{ label }}</span>\n    }\n  </div>\n\n  <div class=\"ngfc-mini-grid\">\n    @for (week of weeks; track $index) {\n      @for (day of week; track day.date.getTime()) {\n        <button\n          type=\"button\"\n          class=\"ngfc-mini-day\"\n          [class.ngfc-mini-day-outside]=\"!day.isCurrentMonth\"\n          [class.ngfc-mini-day-today]=\"day.isToday\"\n          [class.ngfc-mini-day-selected]=\"day.isSelected\"\n          (click)=\"selectDay(day)\"\n        >\n          {{ day.date.getDate() }}\n        </button>\n      }\n    }\n  </div>\n</div>\n", styles: [".ngfc-mini{font-size:.8em}.ngfc-mini-header{display:flex;align-items:center;gap:2px;margin-bottom:10px}.ngfc-mini-title{flex:1;text-align:center;font-weight:700;font-size:.9em;color:var(--ngfc-text)}.ngfc-mini-nav{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text-muted);font-size:.8em;padding:4px 5px;border-radius:4px;line-height:1}.ngfc-mini-nav:hover{background:var(--ngfc-hover-bg);color:var(--ngfc-text)}.ngfc-mini-weekdays{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;color:var(--ngfc-text-muted);font-size:.7em;margin-bottom:4px}.ngfc-mini-grid{display:grid;grid-template-columns:repeat(7,1fr);row-gap:2px}.ngfc-mini-day{border:none;background:transparent;cursor:pointer;color:var(--ngfc-text);font-size:.78em;padding:6px 0;border-radius:50%;width:28px;height:28px;justify-self:center;line-height:1}.ngfc-mini-day:hover{background:var(--ngfc-hover-bg)}.ngfc-mini-day-outside{color:var(--ngfc-text-muted);opacity:.6}.ngfc-mini-day-today{color:var(--ngfc-today-text);font-weight:700}.ngfc-mini-day-selected{background:var(--ngfc-today-bg);color:var(--ngfc-today-text);font-weight:700}\n"] }]
        }], propDecorators: { selectedDate: [{
                type: Input,
                args: [{ required: true }]
            }], weekStartsOn: [{
                type: Input
            }], locale: [{
                type: Input
            }], selectedDateChange: [{
                type: Output
            }] } });

class SidebarComponent {
    selectedDate;
    weekStartsOn = 0;
    categories = [];
    activeCategoryIds = new Set();
    filterText = '';
    locale = null;
    selectedDateChange = new EventEmitter();
    filterTextChange = new EventEmitter();
    categoryToggle = new EventEmitter();
    onFilterInput(value) {
        this.filterTextChange.emit(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: SidebarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: SidebarComponent, isStandalone: true, selector: "ngfc-sidebar", inputs: { selectedDate: "selectedDate", weekStartsOn: "weekStartsOn", categories: "categories", activeCategoryIds: "activeCategoryIds", filterText: "filterText", locale: "locale" }, outputs: { selectedDateChange: "selectedDateChange", filterTextChange: "filterTextChange", categoryToggle: "categoryToggle" }, ngImport: i0, template: "<div class=\"ngfc-sidebar\">\n  <ngfc-mini-calendar\n    [selectedDate]=\"selectedDate\"\n    [weekStartsOn]=\"weekStartsOn\"\n    [locale]=\"locale\"\n    (selectedDateChange)=\"selectedDateChange.emit($event)\"\n  ></ngfc-mini-calendar>\n\n  <input\n    type=\"text\"\n    class=\"ngfc-filter-input\"\n    placeholder=\"Filter events\"\n    [ngModel]=\"filterText\"\n    (ngModelChange)=\"onFilterInput($event)\"\n  />\n\n  @if (categories.length > 0) {\n    <div class=\"ngfc-category-list\">\n      @for (category of categories; track category.id) {\n        <label class=\"ngfc-category-item\">\n          <input\n            type=\"checkbox\"\n            [checked]=\"activeCategoryIds.has(category.id)\"\n            (change)=\"categoryToggle.emit(category.id)\"\n            [class]=\"'ngfc-category-checkbox ngfc-event ngfc-color-' + category.color\"\n          />\n          <span>{{ category.label }}</span>\n        </label>\n      }\n    </div>\n  }\n</div>\n", styles: [".ngfc-sidebar{display:flex;flex-direction:column;gap:18px;background:var(--ngfc-bg);border-radius:16px;box-shadow:var(--ngfc-shadow);padding:18px;height:100%;overflow-y:auto}.ngfc-filter-input{border:1px solid var(--ngfc-border-color);border-radius:8px;padding:8px 12px;font-size:.85em;color:var(--ngfc-text);background:var(--ngfc-bg);font-family:inherit}.ngfc-filter-input::placeholder{color:var(--ngfc-text-muted)}.ngfc-filter-input:focus{outline:none;border-color:var(--ngfc-today-text)}.ngfc-category-list{display:flex;flex-direction:column;gap:14px}.ngfc-category-item{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.9em;font-weight:500;color:var(--ngfc-text)}.ngfc-category-checkbox{width:18px;height:18px;border-radius:4px;cursor:pointer;accent-color:var(--ngfc-color-blue-border)}.ngfc-category-checkbox.ngfc-color-blue{accent-color:var(--ngfc-color-blue-border)}.ngfc-category-checkbox.ngfc-color-green{accent-color:var(--ngfc-color-green-border)}.ngfc-category-checkbox.ngfc-color-red{accent-color:var(--ngfc-color-red-border)}.ngfc-category-checkbox.ngfc-color-yellow{accent-color:var(--ngfc-color-yellow-border)}.ngfc-category-checkbox.ngfc-color-purple{accent-color:var(--ngfc-color-purple-border)}.ngfc-category-checkbox.ngfc-color-orange{accent-color:var(--ngfc-color-orange-border)}.ngfc-category-checkbox.ngfc-color-teal{accent-color:var(--ngfc-color-teal-border)}.ngfc-category-checkbox.ngfc-color-gray{accent-color:var(--ngfc-color-gray-border)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: MiniCalendarComponent, selector: "ngfc-mini-calendar", inputs: ["selectedDate", "weekStartsOn", "locale"], outputs: ["selectedDateChange"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: SidebarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-sidebar', standalone: true, imports: [CommonModule, FormsModule, MiniCalendarComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-sidebar\">\n  <ngfc-mini-calendar\n    [selectedDate]=\"selectedDate\"\n    [weekStartsOn]=\"weekStartsOn\"\n    [locale]=\"locale\"\n    (selectedDateChange)=\"selectedDateChange.emit($event)\"\n  ></ngfc-mini-calendar>\n\n  <input\n    type=\"text\"\n    class=\"ngfc-filter-input\"\n    placeholder=\"Filter events\"\n    [ngModel]=\"filterText\"\n    (ngModelChange)=\"onFilterInput($event)\"\n  />\n\n  @if (categories.length > 0) {\n    <div class=\"ngfc-category-list\">\n      @for (category of categories; track category.id) {\n        <label class=\"ngfc-category-item\">\n          <input\n            type=\"checkbox\"\n            [checked]=\"activeCategoryIds.has(category.id)\"\n            (change)=\"categoryToggle.emit(category.id)\"\n            [class]=\"'ngfc-category-checkbox ngfc-event ngfc-color-' + category.color\"\n          />\n          <span>{{ category.label }}</span>\n        </label>\n      }\n    </div>\n  }\n</div>\n", styles: [".ngfc-sidebar{display:flex;flex-direction:column;gap:18px;background:var(--ngfc-bg);border-radius:16px;box-shadow:var(--ngfc-shadow);padding:18px;height:100%;overflow-y:auto}.ngfc-filter-input{border:1px solid var(--ngfc-border-color);border-radius:8px;padding:8px 12px;font-size:.85em;color:var(--ngfc-text);background:var(--ngfc-bg);font-family:inherit}.ngfc-filter-input::placeholder{color:var(--ngfc-text-muted)}.ngfc-filter-input:focus{outline:none;border-color:var(--ngfc-today-text)}.ngfc-category-list{display:flex;flex-direction:column;gap:14px}.ngfc-category-item{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.9em;font-weight:500;color:var(--ngfc-text)}.ngfc-category-checkbox{width:18px;height:18px;border-radius:4px;cursor:pointer;accent-color:var(--ngfc-color-blue-border)}.ngfc-category-checkbox.ngfc-color-blue{accent-color:var(--ngfc-color-blue-border)}.ngfc-category-checkbox.ngfc-color-green{accent-color:var(--ngfc-color-green-border)}.ngfc-category-checkbox.ngfc-color-red{accent-color:var(--ngfc-color-red-border)}.ngfc-category-checkbox.ngfc-color-yellow{accent-color:var(--ngfc-color-yellow-border)}.ngfc-category-checkbox.ngfc-color-purple{accent-color:var(--ngfc-color-purple-border)}.ngfc-category-checkbox.ngfc-color-orange{accent-color:var(--ngfc-color-orange-border)}.ngfc-category-checkbox.ngfc-color-teal{accent-color:var(--ngfc-color-teal-border)}.ngfc-category-checkbox.ngfc-color-gray{accent-color:var(--ngfc-color-gray-border)}\n"] }]
        }], propDecorators: { selectedDate: [{
                type: Input,
                args: [{ required: true }]
            }], weekStartsOn: [{
                type: Input
            }], categories: [{
                type: Input
            }], activeCategoryIds: [{
                type: Input
            }], filterText: [{
                type: Input
            }], locale: [{
                type: Input
            }], selectedDateChange: [{
                type: Output
            }], filterTextChange: [{
                type: Output
            }], categoryToggle: [{
                type: Output
            }] } });

const DEFAULT_CATEGORY_COLOR = 'blue';
class CalendarComponent {
    events = [];
    view = 'month';
    date = new Date();
    weekStartsOn = 0;
    availableViews = ['day', 'week', 'month', 'agenda'];
    agendaRangeDays = 30;
    /** When true, clicking a day/slot or event opens the built-in create/edit modal. */
    editable = true;
    /** When true, renders the left sidebar (mini calendar, filter, category checkboxes). */
    showSidebar = true;
    /** Labels shown as checkbox filters in the sidebar, one per distinct `calendarId` found in events. */
    categories = null;
    /** Base font size for the whole calendar — a number is treated as pixels (e.g. `14`), or pass any CSS length (e.g. `'0.9rem'`). Everything scales proportionally from this. */
    fontSize = null;
    /** Custom weekday/month names and 12h/24h time format, for translation. Unset fields fall back to English defaults. */
    locale = null;
    viewChange = new EventEmitter();
    dateChange = new EventEmitter();
    navigate = new EventEmitter();
    eventClick = new EventEmitter();
    dayClick = new EventEmitter();
    slotClick = new EventEmitter();
    eventsChange = new EventEmitter();
    eventCreate = new EventEmitter();
    eventUpdate = new EventEmitter();
    eventDelete = new EventEmitter();
    title = '';
    localEvents = [];
    filteredEvents = [];
    resolvedLocale = resolveLocale(null);
    filterText = '';
    resolvedCategories = [];
    activeCategoryIds = new Set();
    editorOpen = false;
    editorEvent = null;
    editorDefaultDate = new Date();
    ngOnInit() {
        this.title = this.computeTitle();
    }
    get fontSizeStyle() {
        if (this.fontSize === null || this.fontSize === undefined) {
            return null;
        }
        return typeof this.fontSize === 'number' ? `${this.fontSize}px` : this.fontSize;
    }
    ngOnChanges(changes) {
        if (changes['locale']) {
            this.resolvedLocale = resolveLocale(this.locale);
        }
        if (changes['date'] || changes['view'] || changes['locale']) {
            this.title = this.computeTitle();
        }
        if (changes['events'] || changes['categories']) {
            this.localEvents = [...this.events];
            this.resolvedCategories = this.categories ?? this.deriveCategories(this.localEvents);
            this.activeCategoryIds = new Set(this.resolvedCategories.map((c) => c.id));
            this.applyFilters();
        }
    }
    deriveCategories(events) {
        const seen = new Map();
        for (const event of events) {
            if (event.calendarId && !seen.has(event.calendarId)) {
                seen.set(event.calendarId, {
                    id: event.calendarId,
                    label: event.calendarId,
                    color: event.color ?? DEFAULT_CATEGORY_COLOR,
                });
            }
        }
        return Array.from(seen.values());
    }
    applyFilters() {
        const text = this.filterText.trim().toLowerCase();
        this.filteredEvents = this.localEvents.filter((event) => {
            const matchesCategory = !event.calendarId || this.activeCategoryIds.has(event.calendarId);
            const matchesText = !text || event.title.toLowerCase().includes(text);
            return matchesCategory && matchesText;
        });
    }
    onFilterTextChange(text) {
        this.filterText = text;
        this.applyFilters();
    }
    onCategoryToggle(categoryId) {
        if (this.activeCategoryIds.has(categoryId)) {
            this.activeCategoryIds.delete(categoryId);
        }
        else {
            this.activeCategoryIds.add(categoryId);
        }
        this.activeCategoryIds = new Set(this.activeCategoryIds);
        this.applyFilters();
    }
    computeTitle() {
        switch (this.view) {
            case 'month':
                return formatMonthTitle(this.date, this.resolvedLocale.monthNamesLong);
            case 'week':
                return formatMonthTitle(this.date, this.resolvedLocale.monthNamesLong);
            case 'day':
                return formatDayTitle(this.date, this.resolvedLocale.weekdayNamesLong, this.resolvedLocale.monthNamesLong);
            case 'agenda':
                return formatMonthTitle(this.date, this.resolvedLocale.monthNamesLong);
        }
    }
    onToday() {
        this.setDate(new Date());
    }
    onPrevious() {
        this.setDate(this.shiftDate(-1));
    }
    onNext() {
        this.setDate(this.shiftDate(1));
    }
    shiftDate(direction) {
        switch (this.view) {
            case 'month':
                return addMonths(this.date, direction);
            case 'week':
                return addDays(this.date, 7 * direction);
            case 'day':
                return addDays(this.date, direction);
            case 'agenda':
                return addDays(this.date, this.agendaRangeDays * direction);
        }
    }
    onViewChange(view) {
        this.view = view;
        this.title = this.computeTitle();
        this.viewChange.emit(view);
        this.navigate.emit({ view, date: this.date });
    }
    onSidebarDateChange(date) {
        this.setDate(date);
    }
    setDate(date) {
        this.date = date;
        this.title = this.computeTitle();
        this.dateChange.emit(date);
        this.navigate.emit({ view: this.view, date });
    }
    onDayClick(date) {
        this.dayClick.emit(date);
        if (this.editable) {
            this.openCreateEditor(date);
        }
    }
    onMoreClick(date) {
        this.view = 'day';
        this.setDate(date);
        this.viewChange.emit('day');
    }
    onSlotClick(date) {
        this.slotClick.emit(date);
        if (this.editable) {
            this.openCreateEditor(date);
        }
    }
    onEventClick(event) {
        this.eventClick.emit(event);
        if (this.editable) {
            this.openEditEditor(event);
        }
    }
    openCreateEditor(date) {
        this.editorDefaultDate = date;
        this.editorEvent = null;
        this.editorOpen = true;
    }
    openEditEditor(event) {
        this.editorEvent = event;
        this.editorOpen = true;
    }
    closeEditor() {
        this.editorOpen = false;
        this.editorEvent = null;
    }
    onEditorSave(result) {
        if (result.isNew) {
            this.localEvents = [...this.localEvents, result.event];
            this.eventCreate.emit(result.event);
        }
        else {
            this.localEvents = this.localEvents.map((e) => (e.id === result.event.id ? result.event : e));
            this.eventUpdate.emit(result.event);
        }
        this.applyFilters();
        this.eventsChange.emit(this.localEvents);
        this.closeEditor();
    }
    onEditorDelete(event) {
        this.localEvents = this.localEvents.filter((e) => e.id !== event.id);
        this.applyFilters();
        this.eventDelete.emit(event);
        this.eventsChange.emit(this.localEvents);
        this.closeEditor();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: CalendarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.14", type: CalendarComponent, isStandalone: true, selector: "ngfc-calendar", inputs: { events: "events", view: "view", date: "date", weekStartsOn: "weekStartsOn", availableViews: "availableViews", agendaRangeDays: "agendaRangeDays", editable: "editable", showSidebar: "showSidebar", categories: "categories", fontSize: "fontSize", locale: "locale" }, outputs: { viewChange: "viewChange", dateChange: "dateChange", navigate: "navigate", eventClick: "eventClick", dayClick: "dayClick", slotClick: "slotClick", eventsChange: "eventsChange", eventCreate: "eventCreate", eventUpdate: "eventUpdate", eventDelete: "eventDelete" }, usesOnChanges: true, ngImport: i0, template: "<div class=\"ngfc-root\" [style.--ngfc-font-size]=\"fontSizeStyle\">\n  @if (showSidebar) {\n    <div class=\"ngfc-sidebar-slot\">\n      <ngfc-sidebar\n        [selectedDate]=\"date\"\n        [weekStartsOn]=\"weekStartsOn\"\n        [categories]=\"resolvedCategories\"\n        [activeCategoryIds]=\"activeCategoryIds\"\n        [filterText]=\"filterText\"\n        [locale]=\"locale\"\n        (selectedDateChange)=\"onSidebarDateChange($event)\"\n        (filterTextChange)=\"onFilterTextChange($event)\"\n        (categoryToggle)=\"onCategoryToggle($event)\"\n      ></ngfc-sidebar>\n    </div>\n  }\n\n  <div class=\"ngfc-main\">\n    <ngfc-toolbar\n      [title]=\"title\"\n      [view]=\"view\"\n      [date]=\"date\"\n      [availableViews]=\"availableViews\"\n      (previousClick)=\"onPrevious()\"\n      (nextClick)=\"onNext()\"\n      (todayClick)=\"onToday()\"\n      (viewChange)=\"onViewChange($event)\"\n    ></ngfc-toolbar>\n\n    <div class=\"ngfc-view-container\">\n      @switch (view) {\n        @case ('month') {\n          <ngfc-month-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [weekStartsOn]=\"weekStartsOn\"\n            [locale]=\"locale\"\n            (dayClick)=\"onDayClick($event)\"\n            (eventClick)=\"onEventClick($event)\"\n            (moreClick)=\"onMoreClick($event)\"\n          ></ngfc-month-view>\n        }\n        @case ('week') {\n          <ngfc-week-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [weekStartsOn]=\"weekStartsOn\"\n            [singleDay]=\"false\"\n            [locale]=\"locale\"\n            (eventClick)=\"onEventClick($event)\"\n            (slotClick)=\"onSlotClick($event)\"\n          ></ngfc-week-view>\n        }\n        @case ('day') {\n          <ngfc-week-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [singleDay]=\"true\"\n            [locale]=\"locale\"\n            (eventClick)=\"onEventClick($event)\"\n            (slotClick)=\"onSlotClick($event)\"\n          ></ngfc-week-view>\n        }\n        @case ('agenda') {\n          <ngfc-agenda-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [rangeDays]=\"agendaRangeDays\"\n            [locale]=\"locale\"\n            (eventClick)=\"onEventClick($event)\"\n          ></ngfc-agenda-view>\n        }\n      }\n    </div>\n  </div>\n\n  @if (editorOpen) {\n    <ngfc-event-editor\n      [event]=\"editorEvent\"\n      [defaultDate]=\"editorDefaultDate\"\n      (save)=\"onEditorSave($event)\"\n      (delete)=\"onEditorDelete($event)\"\n      (close)=\"closeEditor()\"\n    ></ngfc-event-editor>\n  }\n</div>\n", styles: [".ngfc-root{--ngfc-page-bg: #eef4fb;--ngfc-border-color: #e3e8ef;--ngfc-grid-line: #edf1f6;--ngfc-bg: #ffffff;--ngfc-text: #1c2430;--ngfc-text-muted: #8a94a6;--ngfc-today-bg: #dce9fb;--ngfc-today-text: #2f6fed;--ngfc-weekend-bg: #fafbfd;--ngfc-hover-bg: #f3f6fa;--ngfc-now-line: #e8604c;--ngfc-shadow: 0 12px 32px rgba(30, 55, 95, .08);--ngfc-font: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;--ngfc-font-size: 16px;--ngfc-color-blue-bg: #dceafe;--ngfc-color-blue-border: #4c8df5;--ngfc-color-blue-text: #1d4f9c;--ngfc-color-green-bg: #e1f0e3;--ngfc-color-green-border: #5aa66b;--ngfc-color-green-text: #2c6b3c;--ngfc-color-red-bg: #fbe3e0;--ngfc-color-red-border: #e0715f;--ngfc-color-red-text: #9c3b2a;--ngfc-color-yellow-bg: #fbeecb;--ngfc-color-yellow-border: #dba93a;--ngfc-color-yellow-text: #8a641a;--ngfc-color-purple-bg: #e9e1f7;--ngfc-color-purple-border: #9772d6;--ngfc-color-purple-text: #5b3d99;--ngfc-color-orange-bg: #fbe6d4;--ngfc-color-orange-border: #e08a3e;--ngfc-color-orange-text: #94551a;--ngfc-color-teal-bg: #dcf0ee;--ngfc-color-teal-border: #4ba69c;--ngfc-color-teal-text: #276560;--ngfc-color-gray-bg: #e8eaee;--ngfc-color-gray-border: #8b93a1;--ngfc-color-gray-text: #454c58;font-family:var(--ngfc-font);font-size:var(--ngfc-font-size);color:var(--ngfc-text);background:var(--ngfc-bg);box-sizing:border-box;display:flex;height:100%;width:100%;background:var(--ngfc-page-bg);padding:16px;gap:16px;border-radius:20px}.ngfc-root *,.ngfc-root *:before,.ngfc-root *:after{box-sizing:inherit}.ngfc-sidebar-slot{flex:0 0 260px}.ngfc-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;background:var(--ngfc-bg);border-radius:16px;box-shadow:var(--ngfc-shadow);overflow:hidden;padding:12px 20px 20px}.ngfc-view-container{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;border-top:1px solid var(--ngfc-border-color)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "component", type: ToolbarComponent, selector: "ngfc-toolbar", inputs: ["title", "view", "date", "availableViews"], outputs: ["previousClick", "nextClick", "todayClick", "viewChange"] }, { kind: "component", type: MonthViewComponent, selector: "ngfc-month-view", inputs: ["date", "events", "weekStartsOn", "locale"], outputs: ["dayClick", "eventClick", "moreClick"] }, { kind: "component", type: WeekViewComponent, selector: "ngfc-week-view", inputs: ["date", "events", "weekStartsOn", "singleDay", "locale"], outputs: ["eventClick", "slotClick"] }, { kind: "component", type: AgendaViewComponent, selector: "ngfc-agenda-view", inputs: ["date", "events", "rangeDays", "locale"], outputs: ["eventClick"] }, { kind: "component", type: EventEditorComponent, selector: "ngfc-event-editor", inputs: ["event", "defaultDate"], outputs: ["save", "delete", "close"] }, { kind: "component", type: SidebarComponent, selector: "ngfc-sidebar", inputs: ["selectedDate", "weekStartsOn", "categories", "activeCategoryIds", "filterText", "locale"], outputs: ["selectedDateChange", "filterTextChange", "categoryToggle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.14", ngImport: i0, type: CalendarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngfc-calendar', standalone: true, imports: [
                        CommonModule,
                        ToolbarComponent,
                        MonthViewComponent,
                        WeekViewComponent,
                        AgendaViewComponent,
                        EventEditorComponent,
                        SidebarComponent,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ngfc-root\" [style.--ngfc-font-size]=\"fontSizeStyle\">\n  @if (showSidebar) {\n    <div class=\"ngfc-sidebar-slot\">\n      <ngfc-sidebar\n        [selectedDate]=\"date\"\n        [weekStartsOn]=\"weekStartsOn\"\n        [categories]=\"resolvedCategories\"\n        [activeCategoryIds]=\"activeCategoryIds\"\n        [filterText]=\"filterText\"\n        [locale]=\"locale\"\n        (selectedDateChange)=\"onSidebarDateChange($event)\"\n        (filterTextChange)=\"onFilterTextChange($event)\"\n        (categoryToggle)=\"onCategoryToggle($event)\"\n      ></ngfc-sidebar>\n    </div>\n  }\n\n  <div class=\"ngfc-main\">\n    <ngfc-toolbar\n      [title]=\"title\"\n      [view]=\"view\"\n      [date]=\"date\"\n      [availableViews]=\"availableViews\"\n      (previousClick)=\"onPrevious()\"\n      (nextClick)=\"onNext()\"\n      (todayClick)=\"onToday()\"\n      (viewChange)=\"onViewChange($event)\"\n    ></ngfc-toolbar>\n\n    <div class=\"ngfc-view-container\">\n      @switch (view) {\n        @case ('month') {\n          <ngfc-month-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [weekStartsOn]=\"weekStartsOn\"\n            [locale]=\"locale\"\n            (dayClick)=\"onDayClick($event)\"\n            (eventClick)=\"onEventClick($event)\"\n            (moreClick)=\"onMoreClick($event)\"\n          ></ngfc-month-view>\n        }\n        @case ('week') {\n          <ngfc-week-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [weekStartsOn]=\"weekStartsOn\"\n            [singleDay]=\"false\"\n            [locale]=\"locale\"\n            (eventClick)=\"onEventClick($event)\"\n            (slotClick)=\"onSlotClick($event)\"\n          ></ngfc-week-view>\n        }\n        @case ('day') {\n          <ngfc-week-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [singleDay]=\"true\"\n            [locale]=\"locale\"\n            (eventClick)=\"onEventClick($event)\"\n            (slotClick)=\"onSlotClick($event)\"\n          ></ngfc-week-view>\n        }\n        @case ('agenda') {\n          <ngfc-agenda-view\n            [date]=\"date\"\n            [events]=\"filteredEvents\"\n            [rangeDays]=\"agendaRangeDays\"\n            [locale]=\"locale\"\n            (eventClick)=\"onEventClick($event)\"\n          ></ngfc-agenda-view>\n        }\n      }\n    </div>\n  </div>\n\n  @if (editorOpen) {\n    <ngfc-event-editor\n      [event]=\"editorEvent\"\n      [defaultDate]=\"editorDefaultDate\"\n      (save)=\"onEditorSave($event)\"\n      (delete)=\"onEditorDelete($event)\"\n      (close)=\"closeEditor()\"\n    ></ngfc-event-editor>\n  }\n</div>\n", styles: [".ngfc-root{--ngfc-page-bg: #eef4fb;--ngfc-border-color: #e3e8ef;--ngfc-grid-line: #edf1f6;--ngfc-bg: #ffffff;--ngfc-text: #1c2430;--ngfc-text-muted: #8a94a6;--ngfc-today-bg: #dce9fb;--ngfc-today-text: #2f6fed;--ngfc-weekend-bg: #fafbfd;--ngfc-hover-bg: #f3f6fa;--ngfc-now-line: #e8604c;--ngfc-shadow: 0 12px 32px rgba(30, 55, 95, .08);--ngfc-font: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;--ngfc-font-size: 16px;--ngfc-color-blue-bg: #dceafe;--ngfc-color-blue-border: #4c8df5;--ngfc-color-blue-text: #1d4f9c;--ngfc-color-green-bg: #e1f0e3;--ngfc-color-green-border: #5aa66b;--ngfc-color-green-text: #2c6b3c;--ngfc-color-red-bg: #fbe3e0;--ngfc-color-red-border: #e0715f;--ngfc-color-red-text: #9c3b2a;--ngfc-color-yellow-bg: #fbeecb;--ngfc-color-yellow-border: #dba93a;--ngfc-color-yellow-text: #8a641a;--ngfc-color-purple-bg: #e9e1f7;--ngfc-color-purple-border: #9772d6;--ngfc-color-purple-text: #5b3d99;--ngfc-color-orange-bg: #fbe6d4;--ngfc-color-orange-border: #e08a3e;--ngfc-color-orange-text: #94551a;--ngfc-color-teal-bg: #dcf0ee;--ngfc-color-teal-border: #4ba69c;--ngfc-color-teal-text: #276560;--ngfc-color-gray-bg: #e8eaee;--ngfc-color-gray-border: #8b93a1;--ngfc-color-gray-text: #454c58;font-family:var(--ngfc-font);font-size:var(--ngfc-font-size);color:var(--ngfc-text);background:var(--ngfc-bg);box-sizing:border-box;display:flex;height:100%;width:100%;background:var(--ngfc-page-bg);padding:16px;gap:16px;border-radius:20px}.ngfc-root *,.ngfc-root *:before,.ngfc-root *:after{box-sizing:inherit}.ngfc-sidebar-slot{flex:0 0 260px}.ngfc-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;background:var(--ngfc-bg);border-radius:16px;box-shadow:var(--ngfc-shadow);overflow:hidden;padding:12px 20px 20px}.ngfc-view-container{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;border-top:1px solid var(--ngfc-border-color)}\n"] }]
        }], propDecorators: { events: [{
                type: Input
            }], view: [{
                type: Input
            }], date: [{
                type: Input
            }], weekStartsOn: [{
                type: Input
            }], availableViews: [{
                type: Input
            }], agendaRangeDays: [{
                type: Input
            }], editable: [{
                type: Input
            }], showSidebar: [{
                type: Input
            }], categories: [{
                type: Input
            }], fontSize: [{
                type: Input
            }], locale: [{
                type: Input
            }], viewChange: [{
                type: Output
            }], dateChange: [{
                type: Output
            }], navigate: [{
                type: Output
            }], eventClick: [{
                type: Output
            }], dayClick: [{
                type: Output
            }], slotClick: [{
                type: Output
            }], eventsChange: [{
                type: Output
            }], eventCreate: [{
                type: Output
            }], eventUpdate: [{
                type: Output
            }], eventDelete: [{
                type: Output
            }] } });

/*
 * Public API Surface of ng-full-calendar
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AgendaViewComponent, CalendarComponent, DEFAULT_MONTH_NAMES_LONG, DEFAULT_MONTH_NAMES_SHORT, DEFAULT_WEEKDAY_NAMES_LONG, DEFAULT_WEEKDAY_NAMES_SHORT, EventEditorComponent, MiniCalendarComponent, MonthViewComponent, SidebarComponent, ToolbarComponent, WeekViewComponent, addDays, addMonths, buildMonthGrid, buildWeekGrid, clampToDay, endOfDay, endOfMonth, endOfWeek, eventsForDay, formatDayTitle, formatMonthTitle, formatTime, formatWeekRangeTitle, isEffectivelyAllDay, isMultiDay, isNamedColor, isSameDay, isToday, isoWeekNumber, layoutDayEvents, layoutSpanningEvents, minutesSinceMidnight, resolveEventColor, resolveEventDotColor, resolveLocale, singleDayAllDayEventsInRange, spanningEventsInRange, startOfDay, startOfMonth, startOfWeek };
//# sourceMappingURL=ng-full-calendar.mjs.map
