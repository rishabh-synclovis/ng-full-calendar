import { EventEmitter, OnChanges } from '@angular/core';
import { CalendarEvent, CalendarEventColor, CalendarNamedColor } from '../../models/calendar-event.model';
import * as i0 from "@angular/core";
export interface EventEditorResult {
    event: CalendarEvent;
    isNew: boolean;
}
export declare class EventEditorComponent implements OnChanges {
    event: CalendarEvent | null;
    defaultDate: Date;
    save: EventEmitter<EventEditorResult>;
    delete: EventEmitter<CalendarEvent<unknown>>;
    close: EventEmitter<void>;
    readonly colorOptions: CalendarNamedColor[];
    isNew: boolean;
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    allDay: boolean;
    color: CalendarEventColor;
    customColor: string;
    location: string;
    description: string;
    private editingId;
    ngOnChanges(): void;
    selectColor(color: CalendarEventColor): void;
    get isCustomColorSelected(): boolean;
    onCustomColorChange(hex: string): void;
    selectCustomColor(): void;
    onSave(): void;
    onDelete(): void;
    onClose(): void;
    onBackdropClick(domEvent: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EventEditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EventEditorComponent, "ngfc-event-editor", never, { "event": { "alias": "event"; "required": false; }; "defaultDate": { "alias": "defaultDate"; "required": false; }; }, { "save": "save"; "delete": "delete"; "close": "close"; }, never, never, true, never>;
}
