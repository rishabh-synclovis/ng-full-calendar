import { EventEmitter } from '@angular/core';
import { CalendarCategory } from '../../models/calendar-event.model';
import { CalendarLocale } from '../../models/calendar-locale.model';
import * as i0 from "@angular/core";
export declare class SidebarComponent {
    selectedDate: Date;
    weekStartsOn: 0 | 1;
    categories: CalendarCategory[];
    activeCategoryIds: Set<string>;
    filterText: string;
    locale: CalendarLocale | null;
    selectedDateChange: EventEmitter<Date>;
    filterTextChange: EventEmitter<string>;
    categoryToggle: EventEmitter<string>;
    onFilterInput(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SidebarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SidebarComponent, "ngfc-sidebar", never, { "selectedDate": { "alias": "selectedDate"; "required": true; }; "weekStartsOn": { "alias": "weekStartsOn"; "required": false; }; "categories": { "alias": "categories"; "required": false; }; "activeCategoryIds": { "alias": "activeCategoryIds"; "required": false; }; "filterText": { "alias": "filterText"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; }, { "selectedDateChange": "selectedDateChange"; "filterTextChange": "filterTextChange"; "categoryToggle": "categoryToggle"; }, never, never, true, never>;
}
