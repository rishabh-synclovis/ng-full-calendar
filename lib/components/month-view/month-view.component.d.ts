import { EventEmitter, OnChanges } from '@angular/core';
import { CalendarDay, CalendarEvent, CalendarEventColor, SpanningEvent } from '../../models/calendar-event.model';
import { CalendarLocale } from '../../models/calendar-locale.model';
import * as i0 from "@angular/core";
interface MonthWeek {
    days: CalendarDay[];
    spanningEvents: SpanningEvent[];
    laneCount: number;
}
export declare class MonthViewComponent implements OnChanges {
    date: Date;
    events: CalendarEvent[];
    weekStartsOn: 0 | 1;
    locale: CalendarLocale | null;
    dayClick: EventEmitter<Date>;
    eventClick: EventEmitter<CalendarEvent<unknown>>;
    moreClick: EventEmitter<Date>;
    readonly maxVisible = 3;
    weeks: MonthWeek[];
    weekdayLabels: string[];
    private resolvedLocale;
    ngOnChanges(): void;
    private buildWeekdayLabels;
    formatEventTime(date: Date): string;
    private buildWeeks;
    private eventOccursOnDay;
    visibleEvents(day: CalendarDay): CalendarEvent[];
    overflowCount(day: CalendarDay): number;
    /**
     * Reserves vertical space in the day cell so banner strips overlaid on top
     * (see .ngfc-banner-row in the stylesheet: flush to the week's top, 2px
     * leading padding, 22px lanes, 2px gap between lanes) don't cover the day
     * number or event text below. Sits flush at the top (no fixed offset) so
     * weeks without banners don't reserve any dead space above the day number.
     */
    bannerReservedHeight(week: MonthWeek): string;
    spanningEventStyle(item: SpanningEvent): Record<string, string>;
    colorClass(color: CalendarEventColor | undefined): string | null;
    colorStyle(color: CalendarEventColor | undefined): Record<string, string> | null;
    dotColorClass(color: CalendarEventColor | undefined): string | null;
    dotColorStyle(color: CalendarEventColor | undefined): Record<string, string> | null;
    isPillEvent(event: CalendarEvent): boolean;
    onDayClick(day: CalendarDay): void;
    onEventClick(event: CalendarEvent, domEvent: Event): void;
    onSpanningEventClick(item: SpanningEvent, domEvent: Event): void;
    onMoreClick(day: CalendarDay, domEvent: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MonthViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MonthViewComponent, "ngfc-month-view", never, { "date": { "alias": "date"; "required": true; }; "events": { "alias": "events"; "required": false; }; "weekStartsOn": { "alias": "weekStartsOn"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; }, { "dayClick": "dayClick"; "eventClick": "eventClick"; "moreClick": "moreClick"; }, never, never, true, never>;
}
export {};
