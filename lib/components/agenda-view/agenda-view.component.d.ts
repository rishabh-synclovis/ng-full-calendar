import { EventEmitter, OnChanges } from '@angular/core';
import { CalendarEvent, CalendarEventColor } from '../../models/calendar-event.model';
import { CalendarLocale } from '../../models/calendar-locale.model';
import * as i0 from "@angular/core";
export interface AgendaGroup {
    date: Date;
    isToday: boolean;
    bannerEvents: CalendarEvent[];
    timedEvents: CalendarEvent[];
}
export declare class AgendaViewComponent implements OnChanges {
    date: Date;
    events: CalendarEvent[];
    rangeDays: number;
    locale: CalendarLocale | null;
    eventClick: EventEmitter<CalendarEvent<unknown>>;
    groups: AgendaGroup[];
    totalEventCount: number;
    rangeLabel: string;
    private resolvedLocale;
    ngOnChanges(): void;
    private buildGroups;
    formatEndDate(event: CalendarEvent): string;
    formatTimeRange(event: CalendarEvent): string;
    weekdayLongName(date: Date): string;
    monthShortName(date: Date): string;
    colorClass(color: CalendarEventColor | undefined): string | null;
    colorStyle(color: CalendarEventColor | undefined): Record<string, string> | null;
    dotColorClass(color: CalendarEventColor | undefined): string | null;
    dotColorStyle(color: CalendarEventColor | undefined): Record<string, string> | null;
    onEventClick(event: CalendarEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<AgendaViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AgendaViewComponent, "ngfc-agenda-view", never, { "date": { "alias": "date"; "required": true; }; "events": { "alias": "events"; "required": false; }; "rangeDays": { "alias": "rangeDays"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; }, { "eventClick": "eventClick"; }, never, never, true, never>;
}
