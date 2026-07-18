import { EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CalendarCategory, CalendarEvent } from './models/calendar-event.model';
import { CalendarNavigateEvent, CalendarView } from './models/calendar-view.model';
import { CalendarLocale } from './models/calendar-locale.model';
import { EventEditorResult } from './components/event-editor/event-editor.component';
import * as i0 from "@angular/core";
export declare class CalendarComponent implements OnInit, OnChanges {
    events: CalendarEvent[];
    view: CalendarView;
    date: Date;
    weekStartsOn: 0 | 1;
    availableViews: CalendarView[];
    agendaRangeDays: number;
    /** When true, clicking a day/slot or event opens the built-in create/edit modal. */
    editable: boolean;
    /** When true, renders the left sidebar (mini calendar, filter, category checkboxes). */
    showSidebar: boolean;
    /** Labels shown as checkbox filters in the sidebar, one per distinct `calendarId` found in events. */
    categories: CalendarCategory[] | null;
    /** Base font size for the whole calendar — a number is treated as pixels (e.g. `14`), or pass any CSS length (e.g. `'0.9rem'`). Everything scales proportionally from this. */
    fontSize: string | number | null;
    /** Custom weekday/month names and 12h/24h time format, for translation. Unset fields fall back to English defaults. */
    locale: CalendarLocale | null;
    viewChange: EventEmitter<CalendarView>;
    dateChange: EventEmitter<Date>;
    navigate: EventEmitter<CalendarNavigateEvent>;
    eventClick: EventEmitter<CalendarEvent<unknown>>;
    dayClick: EventEmitter<Date>;
    slotClick: EventEmitter<Date>;
    eventsChange: EventEmitter<CalendarEvent<unknown>[]>;
    eventCreate: EventEmitter<CalendarEvent<unknown>>;
    eventUpdate: EventEmitter<CalendarEvent<unknown>>;
    eventDelete: EventEmitter<CalendarEvent<unknown>>;
    title: string;
    localEvents: CalendarEvent[];
    filteredEvents: CalendarEvent[];
    resolvedLocale: import("./models/calendar-locale.model").ResolvedCalendarLocale;
    filterText: string;
    resolvedCategories: CalendarCategory[];
    activeCategoryIds: Set<string>;
    editorOpen: boolean;
    editorEvent: CalendarEvent | null;
    editorDefaultDate: Date;
    ngOnInit(): void;
    get fontSizeStyle(): string | null;
    ngOnChanges(changes: SimpleChanges): void;
    private deriveCategories;
    private applyFilters;
    onFilterTextChange(text: string): void;
    onCategoryToggle(categoryId: string): void;
    private computeTitle;
    onToday(): void;
    onPrevious(): void;
    onNext(): void;
    private shiftDate;
    onViewChange(view: CalendarView): void;
    onSidebarDateChange(date: Date): void;
    private setDate;
    onDayClick(date: Date): void;
    onMoreClick(date: Date): void;
    onSlotClick(date: Date): void;
    onEventClick(event: CalendarEvent): void;
    openCreateEditor(date: Date): void;
    openEditEditor(event: CalendarEvent): void;
    closeEditor(): void;
    onEditorSave(result: EventEditorResult): void;
    onEditorDelete(event: CalendarEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarComponent, "ngfc-calendar", never, { "events": { "alias": "events"; "required": false; }; "view": { "alias": "view"; "required": false; }; "date": { "alias": "date"; "required": false; }; "weekStartsOn": { "alias": "weekStartsOn"; "required": false; }; "availableViews": { "alias": "availableViews"; "required": false; }; "agendaRangeDays": { "alias": "agendaRangeDays"; "required": false; }; "editable": { "alias": "editable"; "required": false; }; "showSidebar": { "alias": "showSidebar"; "required": false; }; "categories": { "alias": "categories"; "required": false; }; "fontSize": { "alias": "fontSize"; "required": false; }; "locale": { "alias": "locale"; "required": false; }; }, { "viewChange": "viewChange"; "dateChange": "dateChange"; "navigate": "navigate"; "eventClick": "eventClick"; "dayClick": "dayClick"; "slotClick": "slotClick"; "eventsChange": "eventsChange"; "eventCreate": "eventCreate"; "eventUpdate": "eventUpdate"; "eventDelete": "eventDelete"; }, never, never, true, never>;
}
