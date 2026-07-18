import { EventEmitter } from '@angular/core';
import { CalendarView } from '../../models/calendar-view.model';
import * as i0 from "@angular/core";
export declare class ToolbarComponent {
    title: string;
    view: CalendarView;
    date: Date;
    availableViews: CalendarView[];
    previousClick: EventEmitter<void>;
    nextClick: EventEmitter<void>;
    todayClick: EventEmitter<void>;
    viewChange: EventEmitter<CalendarView>;
    readonly viewLabels: Record<CalendarView, string>;
    get weekBadgeLabel(): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<ToolbarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ToolbarComponent, "ngfc-toolbar", never, { "title": { "alias": "title"; "required": false; }; "view": { "alias": "view"; "required": false; }; "date": { "alias": "date"; "required": false; }; "availableViews": { "alias": "availableViews"; "required": false; }; }, { "previousClick": "previousClick"; "nextClick": "nextClick"; "todayClick": "todayClick"; "viewChange": "viewChange"; }, never, never, true, never>;
}
