import { AfterViewInit, EventEmitter, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventColor, PositionedEvent, SpanningEvent } from '../../models/calendar-event.model';
import { CalendarLocale } from '../../models/calendar-locale.model';
import * as i0 from "@angular/core";
export declare class WeekViewComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    date: Date;
    events: CalendarEvent[];
    weekStartsOn: 0 | 1;
    /** When true, renders a single day column instead of a full week. */
    singleDay: boolean;
    locale: CalendarLocale | null;
    eventClick: EventEmitter<CalendarEvent<unknown>>;
    slotClick: EventEmitter<Date>;
    private scrollContainer?;
    readonly hours: number[];
    readonly hourHeight = 48;
    days: Date[];
    allDayEventsByDay: CalendarEvent[][];
    positionedByDay: PositionedEvent[][];
    spanningEvents: SpanningEvent[];
    spanningLaneCount: number;
    hasAllDayEvents: boolean;
    nowOffsetPx: number;
    private timer;
    private hasTodayColumn;
    private hasScrolledToNow;
    private resolvedLocale;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngOnChanges(): void;
    private scrollToNowIfNeeded;
    spanningEventStyle(item: SpanningEvent): Record<string, string>;
    colorClass(color: CalendarEventColor | undefined): string | null;
    colorStyle(color: CalendarEventColor | undefined): Record<string, string> | null;
    dotColorClass(color: CalendarEventColor | undefined): string | null;
    dotColorStyle(color: CalendarEventColor | undefined): Record<string, string> | null;
    onSpanningEventClick(item: SpanningEvent, domEvent: Event): void;
    private updateNowLine;
    isTodayColumn(day: Date): boolean;
    weekdayShortName(day: Date): string;
    /** Hour-gutter row label, e.g. '1 AM' / '13:00', respecting the configured time format. */
    hourLabel(hour: number): string;
    formatEventTime(date: Date): string;
    formatEventTimeRange(item: PositionedEvent): string;
    eventTop(item: PositionedEvent): number;
    eventHeight(item: PositionedEvent): number;
    /** Short events don't have room to stack title + time on separate lines. */
    isShortEvent(item: PositionedEvent): boolean;
    eventWidthPercent(item: PositionedEvent): number;
    eventLeftPercent(item: PositionedEvent): number;
    onEventClick(event: CalendarEvent, domEvent: Event): void;
    onSlotClick(day: Date, hour: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WeekViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WeekViewComponent, "ngfc-week-view", never, { "date": { "alias": "date"; "required": true; }; "events": { "alias": "events"; "required": false; }; "weekStartsOn": { "alias": "weekStartsOn"; "required": false; }; "singleDay": { "alias": "singleDay"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; }, { "eventClick": "eventClick"; "slotClick": "slotClick"; }, never, never, true, never>;
}
