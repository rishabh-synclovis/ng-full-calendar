import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { resolveLocale } from './models/calendar-locale.model';
import { addDays, addMonths, formatDayTitle, formatMonthTitle } from './utils/date.utils';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MonthViewComponent } from './components/month-view/month-view.component';
import { WeekViewComponent } from './components/week-view/week-view.component';
import { AgendaViewComponent } from './components/agenda-view/agenda-view.component';
import { EventEditorComponent } from './components/event-editor/event-editor.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import * as i0 from "@angular/core";
const DEFAULT_CATEGORY_COLOR = 'blue';
export class CalendarComponent {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmctZnVsbC1jYWxlbmRhci9zcmMvbGliL2NhbGVuZGFyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uL3Byb2plY3RzL25nLWZ1bGwtY2FsZW5kYXIvc3JjL2xpYi9jYWxlbmRhci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQXFCLE1BQU0sRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDbEksT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRy9DLE9BQU8sRUFBa0IsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDMUYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDMUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDbEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDL0UsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDckYsT0FBTyxFQUFFLG9CQUFvQixFQUFxQixNQUFNLGtEQUFrRCxDQUFDO0FBQzNHLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDOztBQUUxRSxNQUFNLHNCQUFzQixHQUFHLE1BQWUsQ0FBQztBQWtCL0MsTUFBTSxPQUFPLGlCQUFpQjtJQUNuQixNQUFNLEdBQW9CLEVBQUUsQ0FBQztJQUM3QixJQUFJLEdBQWlCLE9BQU8sQ0FBQztJQUM3QixJQUFJLEdBQVMsSUFBSSxJQUFJLEVBQUUsQ0FB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Q2hCLGtCQUFrQjt3QkFDbEIsaUJBQWlCO3dCQUNqQixtQkFBbUI7d0JBQ25CLG9CQUFvQjt3QkFDcEIsZ0JBQWdCO3FCQUNqQixtQkFHZ0IsdUJBQXVCLENBQUMsTUFBTTs4QkFHdEMsTUFBTTtzQkFBZCxLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxjQUFjO3NCQUF0QixLQUFLO2dCQUNHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBRUcsUUFBUTtzQkFBaEIsS0FBSztnQkFFRyxXQUFXO3NCQUFuQixLQUFLO2dCQUVHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBRUcsUUFBUTtzQkFBaEIsS0FBSztnQkFFRyxNQUFNO3NCQUFkLEtBQUs7Z0JBRUksVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxVQUFVO3NCQUFuQixNQUFNO2dCQUNHLFFBQVE7c0JBQWpCLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxRQUFRO3NCQUFqQixNQUFNO2dCQUNHLFNBQVM7c0JBQWxCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU07Z0JBQ0csV0FBVztzQkFBcEIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uQ2hhbmdlcywgT25Jbml0LCBPdXRwdXQsIFNpbXBsZUNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBDYWxlbmRhckNhdGVnb3J5LCBDYWxlbmRhckV2ZW50IH0gZnJvbSAnLi9tb2RlbHMvY2FsZW5kYXItZXZlbnQubW9kZWwnO1xuaW1wb3J0IHsgQ2FsZW5kYXJOYXZpZ2F0ZUV2ZW50LCBDYWxlbmRhclZpZXcgfSBmcm9tICcuL21vZGVscy9jYWxlbmRhci12aWV3Lm1vZGVsJztcbmltcG9ydCB7IENhbGVuZGFyTG9jYWxlLCByZXNvbHZlTG9jYWxlIH0gZnJvbSAnLi9tb2RlbHMvY2FsZW5kYXItbG9jYWxlLm1vZGVsJztcbmltcG9ydCB7IGFkZERheXMsIGFkZE1vbnRocywgZm9ybWF0RGF5VGl0bGUsIGZvcm1hdE1vbnRoVGl0bGUgfSBmcm9tICcuL3V0aWxzL2RhdGUudXRpbHMnO1xuaW1wb3J0IHsgVG9vbGJhckNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy90b29sYmFyL3Rvb2xiYXIuY29tcG9uZW50JztcbmltcG9ydCB7IE1vbnRoVmlld0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9tb250aC12aWV3L21vbnRoLXZpZXcuY29tcG9uZW50JztcbmltcG9ydCB7IFdlZWtWaWV3Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3dlZWstdmlldy93ZWVrLXZpZXcuY29tcG9uZW50JztcbmltcG9ydCB7IEFnZW5kYVZpZXdDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvYWdlbmRhLXZpZXcvYWdlbmRhLXZpZXcuY29tcG9uZW50JztcbmltcG9ydCB7IEV2ZW50RWRpdG9yQ29tcG9uZW50LCBFdmVudEVkaXRvclJlc3VsdCB9IGZyb20gJy4vY29tcG9uZW50cy9ldmVudC1lZGl0b3IvZXZlbnQtZWRpdG9yLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTaWRlYmFyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3NpZGViYXIvc2lkZWJhci5jb21wb25lbnQnO1xuXG5jb25zdCBERUZBVUxUX0NBVEVHT1JZX0NPTE9SID0gJ2JsdWUnIGFzIGNvbnN0O1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ2ZjLWNhbGVuZGFyJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBUb29sYmFyQ29tcG9uZW50LFxuICAgIE1vbnRoVmlld0NvbXBvbmVudCxcbiAgICBXZWVrVmlld0NvbXBvbmVudCxcbiAgICBBZ2VuZGFWaWV3Q29tcG9uZW50LFxuICAgIEV2ZW50RWRpdG9yQ29tcG9uZW50LFxuICAgIFNpZGViYXJDb21wb25lbnQsXG4gIF0sXG4gIHRlbXBsYXRlVXJsOiAnLi9jYWxlbmRhci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsOiAnLi9jYWxlbmRhci5jb21wb25lbnQuc2NzcycsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBDYWxlbmRhckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzIHtcbiAgQElucHV0KCkgZXZlbnRzOiBDYWxlbmRhckV2ZW50W10gPSBbXTtcbiAgQElucHV0KCkgdmlldzogQ2FsZW5kYXJWaWV3ID0gJ21vbnRoJztcbiAgQElucHV0KCkgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKCk7XG4gIEBJbnB1dCgpIHdlZWtTdGFydHNPbjogMCB8IDEgPSAwO1xuICBASW5wdXQoKSBhdmFpbGFibGVWaWV3czogQ2FsZW5kYXJWaWV3W10gPSBbJ2RheScsICd3ZWVrJywgJ21vbnRoJywgJ2FnZW5kYSddO1xuICBASW5wdXQoKSBhZ2VuZGFSYW5nZURheXMgPSAzMDtcbiAgLyoqIFdoZW4gdHJ1ZSwgY2xpY2tpbmcgYSBkYXkvc2xvdCBvciBldmVudCBvcGVucyB0aGUgYnVpbHQtaW4gY3JlYXRlL2VkaXQgbW9kYWwuICovXG4gIEBJbnB1dCgpIGVkaXRhYmxlID0gdHJ1ZTtcbiAgLyoqIFdoZW4gdHJ1ZSwgcmVuZGVycyB0aGUgbGVmdCBzaWRlYmFyIChtaW5pIGNhbGVuZGFyLCBmaWx0ZXIsIGNhdGVnb3J5IGNoZWNrYm94ZXMpLiAqL1xuICBASW5wdXQoKSBzaG93U2lkZWJhciA9IHRydWU7XG4gIC8qKiBMYWJlbHMgc2hvd24gYXMgY2hlY2tib3ggZmlsdGVycyBpbiB0aGUgc2lkZWJhciwgb25lIHBlciBkaXN0aW5jdCBgY2FsZW5kYXJJZGAgZm91bmQgaW4gZXZlbnRzLiAqL1xuICBASW5wdXQoKSBjYXRlZ29yaWVzOiBDYWxlbmRhckNhdGVnb3J5W10gfCBudWxsID0gbnVsbDtcbiAgLyoqIEJhc2UgZm9udCBzaXplIGZvciB0aGUgd2hvbGUgY2FsZW5kYXIg4oCUIGEgbnVtYmVyIGlzIHRyZWF0ZWQgYXMgcGl4ZWxzIChlLmcuIGAxNGApLCBvciBwYXNzIGFueSBDU1MgbGVuZ3RoIChlLmcuIGAnMC45cmVtJ2ApLiBFdmVyeXRoaW5nIHNjYWxlcyBwcm9wb3J0aW9uYWxseSBmcm9tIHRoaXMuICovXG4gIEBJbnB1dCgpIGZvbnRTaXplOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgLyoqIEN1c3RvbSB3ZWVrZGF5L21vbnRoIG5hbWVzIGFuZCAxMmgvMjRoIHRpbWUgZm9ybWF0LCBmb3IgdHJhbnNsYXRpb24uIFVuc2V0IGZpZWxkcyBmYWxsIGJhY2sgdG8gRW5nbGlzaCBkZWZhdWx0cy4gKi9cbiAgQElucHV0KCkgbG9jYWxlOiBDYWxlbmRhckxvY2FsZSB8IG51bGwgPSBudWxsO1xuXG4gIEBPdXRwdXQoKSB2aWV3Q2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDYWxlbmRhclZpZXc+KCk7XG4gIEBPdXRwdXQoKSBkYXRlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxEYXRlPigpO1xuICBAT3V0cHV0KCkgbmF2aWdhdGUgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyTmF2aWdhdGVFdmVudD4oKTtcbiAgQE91dHB1dCgpIGV2ZW50Q2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyRXZlbnQ+KCk7XG4gIEBPdXRwdXQoKSBkYXlDbGljayA9IG5ldyBFdmVudEVtaXR0ZXI8RGF0ZT4oKTtcbiAgQE91dHB1dCgpIHNsb3RDbGljayA9IG5ldyBFdmVudEVtaXR0ZXI8RGF0ZT4oKTtcbiAgQE91dHB1dCgpIGV2ZW50c0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJFdmVudFtdPigpO1xuICBAT3V0cHV0KCkgZXZlbnRDcmVhdGUgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyRXZlbnQ+KCk7XG4gIEBPdXRwdXQoKSBldmVudFVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJFdmVudD4oKTtcbiAgQE91dHB1dCgpIGV2ZW50RGVsZXRlID0gbmV3IEV2ZW50RW1pdHRlcjxDYWxlbmRhckV2ZW50PigpO1xuXG4gIHRpdGxlID0gJyc7XG4gIGxvY2FsRXZlbnRzOiBDYWxlbmRhckV2ZW50W10gPSBbXTtcbiAgZmlsdGVyZWRFdmVudHM6IENhbGVuZGFyRXZlbnRbXSA9IFtdO1xuICByZXNvbHZlZExvY2FsZSA9IHJlc29sdmVMb2NhbGUobnVsbCk7XG5cbiAgZmlsdGVyVGV4dCA9ICcnO1xuICByZXNvbHZlZENhdGVnb3JpZXM6IENhbGVuZGFyQ2F0ZWdvcnlbXSA9IFtdO1xuICBhY3RpdmVDYXRlZ29yeUlkcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGVkaXRvck9wZW4gPSBmYWxzZTtcbiAgZWRpdG9yRXZlbnQ6IENhbGVuZGFyRXZlbnQgfCBudWxsID0gbnVsbDtcbiAgZWRpdG9yRGVmYXVsdERhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMudGl0bGUgPSB0aGlzLmNvbXB1dGVUaXRsZSgpO1xuICB9XG5cbiAgZ2V0IGZvbnRTaXplU3R5bGUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuZm9udFNpemUgPT09IG51bGwgfHwgdGhpcy5mb250U2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLmZvbnRTaXplID09PSAnbnVtYmVyJyA/IGAke3RoaXMuZm9udFNpemV9cHhgIDogdGhpcy5mb250U2l6ZTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAoY2hhbmdlc1snbG9jYWxlJ10pIHtcbiAgICAgIHRoaXMucmVzb2x2ZWRMb2NhbGUgPSByZXNvbHZlTG9jYWxlKHRoaXMubG9jYWxlKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZXNbJ2RhdGUnXSB8fCBjaGFuZ2VzWyd2aWV3J10gfHwgY2hhbmdlc1snbG9jYWxlJ10pIHtcbiAgICAgIHRoaXMudGl0bGUgPSB0aGlzLmNvbXB1dGVUaXRsZSgpO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlc1snZXZlbnRzJ10gfHwgY2hhbmdlc1snY2F0ZWdvcmllcyddKSB7XG4gICAgICB0aGlzLmxvY2FsRXZlbnRzID0gWy4uLnRoaXMuZXZlbnRzXTtcbiAgICAgIHRoaXMucmVzb2x2ZWRDYXRlZ29yaWVzID0gdGhpcy5jYXRlZ29yaWVzID8/IHRoaXMuZGVyaXZlQ2F0ZWdvcmllcyh0aGlzLmxvY2FsRXZlbnRzKTtcbiAgICAgIHRoaXMuYWN0aXZlQ2F0ZWdvcnlJZHMgPSBuZXcgU2V0KHRoaXMucmVzb2x2ZWRDYXRlZ29yaWVzLm1hcCgoYykgPT4gYy5pZCkpO1xuICAgICAgdGhpcy5hcHBseUZpbHRlcnMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRlcml2ZUNhdGVnb3JpZXMoZXZlbnRzOiBDYWxlbmRhckV2ZW50W10pOiBDYWxlbmRhckNhdGVnb3J5W10ge1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgTWFwPHN0cmluZywgQ2FsZW5kYXJDYXRlZ29yeT4oKTtcbiAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGV2ZW50cykge1xuICAgICAgaWYgKGV2ZW50LmNhbGVuZGFySWQgJiYgIXNlZW4uaGFzKGV2ZW50LmNhbGVuZGFySWQpKSB7XG4gICAgICAgIHNlZW4uc2V0KGV2ZW50LmNhbGVuZGFySWQsIHtcbiAgICAgICAgICBpZDogZXZlbnQuY2FsZW5kYXJJZCxcbiAgICAgICAgICBsYWJlbDogZXZlbnQuY2FsZW5kYXJJZCxcbiAgICAgICAgICBjb2xvcjogZXZlbnQuY29sb3IgPz8gREVGQVVMVF9DQVRFR09SWV9DT0xPUixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKHNlZW4udmFsdWVzKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBseUZpbHRlcnMoKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZmlsdGVyVGV4dC50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLmZpbHRlcmVkRXZlbnRzID0gdGhpcy5sb2NhbEV2ZW50cy5maWx0ZXIoKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBtYXRjaGVzQ2F0ZWdvcnkgPSAhZXZlbnQuY2FsZW5kYXJJZCB8fCB0aGlzLmFjdGl2ZUNhdGVnb3J5SWRzLmhhcyhldmVudC5jYWxlbmRhcklkKTtcbiAgICAgIGNvbnN0IG1hdGNoZXNUZXh0ID0gIXRleHQgfHwgZXZlbnQudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyh0ZXh0KTtcbiAgICAgIHJldHVybiBtYXRjaGVzQ2F0ZWdvcnkgJiYgbWF0Y2hlc1RleHQ7XG4gICAgfSk7XG4gIH1cblxuICBvbkZpbHRlclRleHRDaGFuZ2UodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5maWx0ZXJUZXh0ID0gdGV4dDtcbiAgICB0aGlzLmFwcGx5RmlsdGVycygpO1xuICB9XG5cbiAgb25DYXRlZ29yeVRvZ2dsZShjYXRlZ29yeUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hY3RpdmVDYXRlZ29yeUlkcy5oYXMoY2F0ZWdvcnlJZCkpIHtcbiAgICAgIHRoaXMuYWN0aXZlQ2F0ZWdvcnlJZHMuZGVsZXRlKGNhdGVnb3J5SWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGl2ZUNhdGVnb3J5SWRzLmFkZChjYXRlZ29yeUlkKTtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVDYXRlZ29yeUlkcyA9IG5ldyBTZXQodGhpcy5hY3RpdmVDYXRlZ29yeUlkcyk7XG4gICAgdGhpcy5hcHBseUZpbHRlcnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZVRpdGxlKCk6IHN0cmluZyB7XG4gICAgc3dpdGNoICh0aGlzLnZpZXcpIHtcbiAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgcmV0dXJuIGZvcm1hdE1vbnRoVGl0bGUodGhpcy5kYXRlLCB0aGlzLnJlc29sdmVkTG9jYWxlLm1vbnRoTmFtZXNMb25nKTtcbiAgICAgIGNhc2UgJ3dlZWsnOlxuICAgICAgICByZXR1cm4gZm9ybWF0TW9udGhUaXRsZSh0aGlzLmRhdGUsIHRoaXMucmVzb2x2ZWRMb2NhbGUubW9udGhOYW1lc0xvbmcpO1xuICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgcmV0dXJuIGZvcm1hdERheVRpdGxlKHRoaXMuZGF0ZSwgdGhpcy5yZXNvbHZlZExvY2FsZS53ZWVrZGF5TmFtZXNMb25nLCB0aGlzLnJlc29sdmVkTG9jYWxlLm1vbnRoTmFtZXNMb25nKTtcbiAgICAgIGNhc2UgJ2FnZW5kYSc6XG4gICAgICAgIHJldHVybiBmb3JtYXRNb250aFRpdGxlKHRoaXMuZGF0ZSwgdGhpcy5yZXNvbHZlZExvY2FsZS5tb250aE5hbWVzTG9uZyk7XG4gICAgfVxuICB9XG5cbiAgb25Ub2RheSgpOiB2b2lkIHtcbiAgICB0aGlzLnNldERhdGUobmV3IERhdGUoKSk7XG4gIH1cblxuICBvblByZXZpb3VzKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0RGF0ZSh0aGlzLnNoaWZ0RGF0ZSgtMSkpO1xuICB9XG5cbiAgb25OZXh0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0RGF0ZSh0aGlzLnNoaWZ0RGF0ZSgxKSk7XG4gIH1cblxuICBwcml2YXRlIHNoaWZ0RGF0ZShkaXJlY3Rpb246IDEgfCAtMSk6IERhdGUge1xuICAgIHN3aXRjaCAodGhpcy52aWV3KSB7XG4gICAgICBjYXNlICdtb250aCc6XG4gICAgICAgIHJldHVybiBhZGRNb250aHModGhpcy5kYXRlLCBkaXJlY3Rpb24pO1xuICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgIHJldHVybiBhZGREYXlzKHRoaXMuZGF0ZSwgNyAqIGRpcmVjdGlvbik7XG4gICAgICBjYXNlICdkYXknOlxuICAgICAgICByZXR1cm4gYWRkRGF5cyh0aGlzLmRhdGUsIGRpcmVjdGlvbik7XG4gICAgICBjYXNlICdhZ2VuZGEnOlxuICAgICAgICByZXR1cm4gYWRkRGF5cyh0aGlzLmRhdGUsIHRoaXMuYWdlbmRhUmFuZ2VEYXlzICogZGlyZWN0aW9uKTtcbiAgICB9XG4gIH1cblxuICBvblZpZXdDaGFuZ2UodmlldzogQ2FsZW5kYXJWaWV3KTogdm9pZCB7XG4gICAgdGhpcy52aWV3ID0gdmlldztcbiAgICB0aGlzLnRpdGxlID0gdGhpcy5jb21wdXRlVGl0bGUoKTtcbiAgICB0aGlzLnZpZXdDaGFuZ2UuZW1pdCh2aWV3KTtcbiAgICB0aGlzLm5hdmlnYXRlLmVtaXQoeyB2aWV3LCBkYXRlOiB0aGlzLmRhdGUgfSk7XG4gIH1cblxuICBvblNpZGViYXJEYXRlQ2hhbmdlKGRhdGU6IERhdGUpOiB2b2lkIHtcbiAgICB0aGlzLnNldERhdGUoZGF0ZSk7XG4gIH1cblxuICBwcml2YXRlIHNldERhdGUoZGF0ZTogRGF0ZSk6IHZvaWQge1xuICAgIHRoaXMuZGF0ZSA9IGRhdGU7XG4gICAgdGhpcy50aXRsZSA9IHRoaXMuY29tcHV0ZVRpdGxlKCk7XG4gICAgdGhpcy5kYXRlQ2hhbmdlLmVtaXQoZGF0ZSk7XG4gICAgdGhpcy5uYXZpZ2F0ZS5lbWl0KHsgdmlldzogdGhpcy52aWV3LCBkYXRlIH0pO1xuICB9XG5cbiAgb25EYXlDbGljayhkYXRlOiBEYXRlKTogdm9pZCB7XG4gICAgdGhpcy5kYXlDbGljay5lbWl0KGRhdGUpO1xuICAgIGlmICh0aGlzLmVkaXRhYmxlKSB7XG4gICAgICB0aGlzLm9wZW5DcmVhdGVFZGl0b3IoZGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgb25Nb3JlQ2xpY2soZGF0ZTogRGF0ZSk6IHZvaWQge1xuICAgIHRoaXMudmlldyA9ICdkYXknO1xuICAgIHRoaXMuc2V0RGF0ZShkYXRlKTtcbiAgICB0aGlzLnZpZXdDaGFuZ2UuZW1pdCgnZGF5Jyk7XG4gIH1cblxuICBvblNsb3RDbGljayhkYXRlOiBEYXRlKTogdm9pZCB7XG4gICAgdGhpcy5zbG90Q2xpY2suZW1pdChkYXRlKTtcbiAgICBpZiAodGhpcy5lZGl0YWJsZSkge1xuICAgICAgdGhpcy5vcGVuQ3JlYXRlRWRpdG9yKGRhdGUpO1xuICAgIH1cbiAgfVxuXG4gIG9uRXZlbnRDbGljayhldmVudDogQ2FsZW5kYXJFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuZXZlbnRDbGljay5lbWl0KGV2ZW50KTtcbiAgICBpZiAodGhpcy5lZGl0YWJsZSkge1xuICAgICAgdGhpcy5vcGVuRWRpdEVkaXRvcihldmVudCk7XG4gICAgfVxuICB9XG5cbiAgb3BlbkNyZWF0ZUVkaXRvcihkYXRlOiBEYXRlKTogdm9pZCB7XG4gICAgdGhpcy5lZGl0b3JEZWZhdWx0RGF0ZSA9IGRhdGU7XG4gICAgdGhpcy5lZGl0b3JFdmVudCA9IG51bGw7XG4gICAgdGhpcy5lZGl0b3JPcGVuID0gdHJ1ZTtcbiAgfVxuXG4gIG9wZW5FZGl0RWRpdG9yKGV2ZW50OiBDYWxlbmRhckV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5lZGl0b3JFdmVudCA9IGV2ZW50O1xuICAgIHRoaXMuZWRpdG9yT3BlbiA9IHRydWU7XG4gIH1cblxuICBjbG9zZUVkaXRvcigpOiB2b2lkIHtcbiAgICB0aGlzLmVkaXRvck9wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmVkaXRvckV2ZW50ID0gbnVsbDtcbiAgfVxuXG4gIG9uRWRpdG9yU2F2ZShyZXN1bHQ6IEV2ZW50RWRpdG9yUmVzdWx0KTogdm9pZCB7XG4gICAgaWYgKHJlc3VsdC5pc05ldykge1xuICAgICAgdGhpcy5sb2NhbEV2ZW50cyA9IFsuLi50aGlzLmxvY2FsRXZlbnRzLCByZXN1bHQuZXZlbnRdO1xuICAgICAgdGhpcy5ldmVudENyZWF0ZS5lbWl0KHJlc3VsdC5ldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYWxFdmVudHMgPSB0aGlzLmxvY2FsRXZlbnRzLm1hcCgoZSkgPT4gKGUuaWQgPT09IHJlc3VsdC5ldmVudC5pZCA/IHJlc3VsdC5ldmVudCA6IGUpKTtcbiAgICAgIHRoaXMuZXZlbnRVcGRhdGUuZW1pdChyZXN1bHQuZXZlbnQpO1xuICAgIH1cbiAgICB0aGlzLmFwcGx5RmlsdGVycygpO1xuICAgIHRoaXMuZXZlbnRzQ2hhbmdlLmVtaXQodGhpcy5sb2NhbEV2ZW50cyk7XG4gICAgdGhpcy5jbG9zZUVkaXRvcigpO1xuICB9XG5cbiAgb25FZGl0b3JEZWxldGUoZXZlbnQ6IENhbGVuZGFyRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLmxvY2FsRXZlbnRzID0gdGhpcy5sb2NhbEV2ZW50cy5maWx0ZXIoKGUpID0+IGUuaWQgIT09IGV2ZW50LmlkKTtcbiAgICB0aGlzLmFwcGx5RmlsdGVycygpO1xuICAgIHRoaXMuZXZlbnREZWxldGUuZW1pdChldmVudCk7XG4gICAgdGhpcy5ldmVudHNDaGFuZ2UuZW1pdCh0aGlzLmxvY2FsRXZlbnRzKTtcbiAgICB0aGlzLmNsb3NlRWRpdG9yKCk7XG4gIH1cbn1cbiIsIjxkaXYgY2xhc3M9XCJuZ2ZjLXJvb3RcIiBbc3R5bGUuLS1uZ2ZjLWZvbnQtc2l6ZV09XCJmb250U2l6ZVN0eWxlXCI+XG4gIEBpZiAoc2hvd1NpZGViYXIpIHtcbiAgICA8ZGl2IGNsYXNzPVwibmdmYy1zaWRlYmFyLXNsb3RcIj5cbiAgICAgIDxuZ2ZjLXNpZGViYXJcbiAgICAgICAgW3NlbGVjdGVkRGF0ZV09XCJkYXRlXCJcbiAgICAgICAgW3dlZWtTdGFydHNPbl09XCJ3ZWVrU3RhcnRzT25cIlxuICAgICAgICBbY2F0ZWdvcmllc109XCJyZXNvbHZlZENhdGVnb3JpZXNcIlxuICAgICAgICBbYWN0aXZlQ2F0ZWdvcnlJZHNdPVwiYWN0aXZlQ2F0ZWdvcnlJZHNcIlxuICAgICAgICBbZmlsdGVyVGV4dF09XCJmaWx0ZXJUZXh0XCJcbiAgICAgICAgW2xvY2FsZV09XCJsb2NhbGVcIlxuICAgICAgICAoc2VsZWN0ZWREYXRlQ2hhbmdlKT1cIm9uU2lkZWJhckRhdGVDaGFuZ2UoJGV2ZW50KVwiXG4gICAgICAgIChmaWx0ZXJUZXh0Q2hhbmdlKT1cIm9uRmlsdGVyVGV4dENoYW5nZSgkZXZlbnQpXCJcbiAgICAgICAgKGNhdGVnb3J5VG9nZ2xlKT1cIm9uQ2F0ZWdvcnlUb2dnbGUoJGV2ZW50KVwiXG4gICAgICA+PC9uZ2ZjLXNpZGViYXI+XG4gICAgPC9kaXY+XG4gIH1cblxuICA8ZGl2IGNsYXNzPVwibmdmYy1tYWluXCI+XG4gICAgPG5nZmMtdG9vbGJhclxuICAgICAgW3RpdGxlXT1cInRpdGxlXCJcbiAgICAgIFt2aWV3XT1cInZpZXdcIlxuICAgICAgW2RhdGVdPVwiZGF0ZVwiXG4gICAgICBbYXZhaWxhYmxlVmlld3NdPVwiYXZhaWxhYmxlVmlld3NcIlxuICAgICAgKHByZXZpb3VzQ2xpY2spPVwib25QcmV2aW91cygpXCJcbiAgICAgIChuZXh0Q2xpY2spPVwib25OZXh0KClcIlxuICAgICAgKHRvZGF5Q2xpY2spPVwib25Ub2RheSgpXCJcbiAgICAgICh2aWV3Q2hhbmdlKT1cIm9uVmlld0NoYW5nZSgkZXZlbnQpXCJcbiAgICA+PC9uZ2ZjLXRvb2xiYXI+XG5cbiAgICA8ZGl2IGNsYXNzPVwibmdmYy12aWV3LWNvbnRhaW5lclwiPlxuICAgICAgQHN3aXRjaCAodmlldykge1xuICAgICAgICBAY2FzZSAoJ21vbnRoJykge1xuICAgICAgICAgIDxuZ2ZjLW1vbnRoLXZpZXdcbiAgICAgICAgICAgIFtkYXRlXT1cImRhdGVcIlxuICAgICAgICAgICAgW2V2ZW50c109XCJmaWx0ZXJlZEV2ZW50c1wiXG4gICAgICAgICAgICBbd2Vla1N0YXJ0c09uXT1cIndlZWtTdGFydHNPblwiXG4gICAgICAgICAgICBbbG9jYWxlXT1cImxvY2FsZVwiXG4gICAgICAgICAgICAoZGF5Q2xpY2spPVwib25EYXlDbGljaygkZXZlbnQpXCJcbiAgICAgICAgICAgIChldmVudENsaWNrKT1cIm9uRXZlbnRDbGljaygkZXZlbnQpXCJcbiAgICAgICAgICAgIChtb3JlQ2xpY2spPVwib25Nb3JlQ2xpY2soJGV2ZW50KVwiXG4gICAgICAgICAgPjwvbmdmYy1tb250aC12aWV3PlxuICAgICAgICB9XG4gICAgICAgIEBjYXNlICgnd2VlaycpIHtcbiAgICAgICAgICA8bmdmYy13ZWVrLXZpZXdcbiAgICAgICAgICAgIFtkYXRlXT1cImRhdGVcIlxuICAgICAgICAgICAgW2V2ZW50c109XCJmaWx0ZXJlZEV2ZW50c1wiXG4gICAgICAgICAgICBbd2Vla1N0YXJ0c09uXT1cIndlZWtTdGFydHNPblwiXG4gICAgICAgICAgICBbc2luZ2xlRGF5XT1cImZhbHNlXCJcbiAgICAgICAgICAgIFtsb2NhbGVdPVwibG9jYWxlXCJcbiAgICAgICAgICAgIChldmVudENsaWNrKT1cIm9uRXZlbnRDbGljaygkZXZlbnQpXCJcbiAgICAgICAgICAgIChzbG90Q2xpY2spPVwib25TbG90Q2xpY2soJGV2ZW50KVwiXG4gICAgICAgICAgPjwvbmdmYy13ZWVrLXZpZXc+XG4gICAgICAgIH1cbiAgICAgICAgQGNhc2UgKCdkYXknKSB7XG4gICAgICAgICAgPG5nZmMtd2Vlay12aWV3XG4gICAgICAgICAgICBbZGF0ZV09XCJkYXRlXCJcbiAgICAgICAgICAgIFtldmVudHNdPVwiZmlsdGVyZWRFdmVudHNcIlxuICAgICAgICAgICAgW3NpbmdsZURheV09XCJ0cnVlXCJcbiAgICAgICAgICAgIFtsb2NhbGVdPVwibG9jYWxlXCJcbiAgICAgICAgICAgIChldmVudENsaWNrKT1cIm9uRXZlbnRDbGljaygkZXZlbnQpXCJcbiAgICAgICAgICAgIChzbG90Q2xpY2spPVwib25TbG90Q2xpY2soJGV2ZW50KVwiXG4gICAgICAgICAgPjwvbmdmYy13ZWVrLXZpZXc+XG4gICAgICAgIH1cbiAgICAgICAgQGNhc2UgKCdhZ2VuZGEnKSB7XG4gICAgICAgICAgPG5nZmMtYWdlbmRhLXZpZXdcbiAgICAgICAgICAgIFtkYXRlXT1cImRhdGVcIlxuICAgICAgICAgICAgW2V2ZW50c109XCJmaWx0ZXJlZEV2ZW50c1wiXG4gICAgICAgICAgICBbcmFuZ2VEYXlzXT1cImFnZW5kYVJhbmdlRGF5c1wiXG4gICAgICAgICAgICBbbG9jYWxlXT1cImxvY2FsZVwiXG4gICAgICAgICAgICAoZXZlbnRDbGljayk9XCJvbkV2ZW50Q2xpY2soJGV2ZW50KVwiXG4gICAgICAgICAgPjwvbmdmYy1hZ2VuZGEtdmlldz5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIDwvZGl2PlxuICA8L2Rpdj5cblxuICBAaWYgKGVkaXRvck9wZW4pIHtcbiAgICA8bmdmYy1ldmVudC1lZGl0b3JcbiAgICAgIFtldmVudF09XCJlZGl0b3JFdmVudFwiXG4gICAgICBbZGVmYXVsdERhdGVdPVwiZWRpdG9yRGVmYXVsdERhdGVcIlxuICAgICAgKHNhdmUpPVwib25FZGl0b3JTYXZlKCRldmVudClcIlxuICAgICAgKGRlbGV0ZSk9XCJvbkVkaXRvckRlbGV0ZSgkZXZlbnQpXCJcbiAgICAgIChjbG9zZSk9XCJjbG9zZUVkaXRvcigpXCJcbiAgICA+PC9uZ2ZjLWV2ZW50LWVkaXRvcj5cbiAgfVxuPC9kaXY+XG4iXX0=