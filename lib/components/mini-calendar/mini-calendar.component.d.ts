import { EventEmitter, OnChanges } from '@angular/core';
import { CalendarLocale } from '../../models/calendar-locale.model';
import * as i0 from "@angular/core";
interface MiniDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
}
export declare class MiniCalendarComponent implements OnChanges {
    selectedDate: Date;
    weekStartsOn: 0 | 1;
    locale: CalendarLocale | null;
    selectedDateChange: EventEmitter<Date>;
    /** The month currently displayed — may differ from selectedDate while browsing. */
    displayMonth: Date;
    weeks: MiniDay[][];
    weekdayLabels: string[];
    private resolvedLocale;
    ngOnChanges(): void;
    private buildWeekdayLabels;
    private rebuild;
    get monthLabel(): string;
    previousMonth(): void;
    nextMonth(): void;
    previousYear(): void;
    nextYear(): void;
    selectDay(day: MiniDay): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MiniCalendarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MiniCalendarComponent, "ngfc-mini-calendar", never, { "selectedDate": { "alias": "selectedDate"; "required": true; }; "weekStartsOn": { "alias": "weekStartsOn"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; }, { "selectedDateChange": "selectedDateChange"; }, never, never, true, never>;
}
export {};
