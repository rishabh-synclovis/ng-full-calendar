import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarCategory, CalendarEvent } from './models/calendar-event.model';
import { CalendarNavigateEvent, CalendarView } from './models/calendar-view.model';
import {
  addDays,
  addMonths,
  formatDayTitle,
  formatMonthTitle,
  formatWeekRangeTitle,
} from './utils/date.utils';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MonthViewComponent } from './components/month-view/month-view.component';
import { WeekViewComponent } from './components/week-view/week-view.component';
import { AgendaViewComponent } from './components/agenda-view/agenda-view.component';
import { EventEditorComponent, EventEditorResult } from './components/event-editor/event-editor.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

const DEFAULT_CATEGORY_COLOR = 'blue' as const;

@Component({
  selector: 'ngfc-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    MonthViewComponent,
    WeekViewComponent,
    AgendaViewComponent,
    EventEditorComponent,
    SidebarComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() view: CalendarView = 'month';
  @Input() date: Date = new Date();
  @Input() weekStartsOn: 0 | 1 = 0;
  @Input() availableViews: CalendarView[] = ['day', 'week', 'month', 'agenda'];
  @Input() agendaRangeDays = 30;
  /** When true, clicking a day/slot or event opens the built-in create/edit modal. */
  @Input() editable = true;
  /** When true, renders the left sidebar (mini calendar, filter, category checkboxes). */
  @Input() showSidebar = true;
  /** Labels shown as checkbox filters in the sidebar, one per distinct `calendarId` found in events. */
  @Input() categories: CalendarCategory[] | null = null;
  /** Base font size for the whole calendar — a number is treated as pixels (e.g. `14`), or pass any CSS length (e.g. `'0.9rem'`). Everything scales proportionally from this. */
  @Input() fontSize: string | number | null = null;

  @Output() viewChange = new EventEmitter<CalendarView>();
  @Output() dateChange = new EventEmitter<Date>();
  @Output() navigate = new EventEmitter<CalendarNavigateEvent>();
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() dayClick = new EventEmitter<Date>();
  @Output() slotClick = new EventEmitter<Date>();
  @Output() eventsChange = new EventEmitter<CalendarEvent[]>();
  @Output() eventCreate = new EventEmitter<CalendarEvent>();
  @Output() eventUpdate = new EventEmitter<CalendarEvent>();
  @Output() eventDelete = new EventEmitter<CalendarEvent>();

  title = '';
  localEvents: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];

  filterText = '';
  resolvedCategories: CalendarCategory[] = [];
  activeCategoryIds = new Set<string>();

  editorOpen = false;
  editorEvent: CalendarEvent | null = null;
  editorDefaultDate = new Date();

  ngOnInit(): void {
    this.title = this.computeTitle();
  }

  get fontSizeStyle(): string | null {
    if (this.fontSize === null || this.fontSize === undefined) {
      return null;
    }
    return typeof this.fontSize === 'number' ? `${this.fontSize}px` : this.fontSize;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] || changes['view']) {
      this.title = this.computeTitle();
    }
    if (changes['events'] || changes['categories']) {
      this.localEvents = [...this.events];
      this.resolvedCategories = this.categories ?? this.deriveCategories(this.localEvents);
      this.activeCategoryIds = new Set(this.resolvedCategories.map((c) => c.id));
      this.applyFilters();
    }
  }

  private deriveCategories(events: CalendarEvent[]): CalendarCategory[] {
    const seen = new Map<string, CalendarCategory>();
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

  private applyFilters(): void {
    const text = this.filterText.trim().toLowerCase();
    this.filteredEvents = this.localEvents.filter((event) => {
      const matchesCategory = !event.calendarId || this.activeCategoryIds.has(event.calendarId);
      const matchesText = !text || event.title.toLowerCase().includes(text);
      return matchesCategory && matchesText;
    });
  }

  onFilterTextChange(text: string): void {
    this.filterText = text;
    this.applyFilters();
  }

  onCategoryToggle(categoryId: string): void {
    if (this.activeCategoryIds.has(categoryId)) {
      this.activeCategoryIds.delete(categoryId);
    } else {
      this.activeCategoryIds.add(categoryId);
    }
    this.activeCategoryIds = new Set(this.activeCategoryIds);
    this.applyFilters();
  }

  private computeTitle(): string {
    switch (this.view) {
      case 'month':
        return formatMonthTitle(this.date);
      case 'week':
        return formatMonthTitle(this.date);
      case 'day':
        return formatDayTitle(this.date);
      case 'agenda':
        return formatMonthTitle(this.date);
    }
  }

  onToday(): void {
    this.setDate(new Date());
  }

  onPrevious(): void {
    this.setDate(this.shiftDate(-1));
  }

  onNext(): void {
    this.setDate(this.shiftDate(1));
  }

  private shiftDate(direction: 1 | -1): Date {
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

  onViewChange(view: CalendarView): void {
    this.view = view;
    this.title = this.computeTitle();
    this.viewChange.emit(view);
    this.navigate.emit({ view, date: this.date });
  }

  onSidebarDateChange(date: Date): void {
    this.setDate(date);
  }

  private setDate(date: Date): void {
    this.date = date;
    this.title = this.computeTitle();
    this.dateChange.emit(date);
    this.navigate.emit({ view: this.view, date });
  }

  onDayClick(date: Date): void {
    this.dayClick.emit(date);
    if (this.editable) {
      this.openCreateEditor(date);
    }
  }

  onMoreClick(date: Date): void {
    this.view = 'day';
    this.setDate(date);
    this.viewChange.emit('day');
  }

  onSlotClick(date: Date): void {
    this.slotClick.emit(date);
    if (this.editable) {
      this.openCreateEditor(date);
    }
  }

  onEventClick(event: CalendarEvent): void {
    this.eventClick.emit(event);
    if (this.editable) {
      this.openEditEditor(event);
    }
  }

  openCreateEditor(date: Date): void {
    this.editorDefaultDate = date;
    this.editorEvent = null;
    this.editorOpen = true;
  }

  openEditEditor(event: CalendarEvent): void {
    this.editorEvent = event;
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editorEvent = null;
  }

  onEditorSave(result: EventEditorResult): void {
    if (result.isNew) {
      this.localEvents = [...this.localEvents, result.event];
      this.eventCreate.emit(result.event);
    } else {
      this.localEvents = this.localEvents.map((e) => (e.id === result.event.id ? result.event : e));
      this.eventUpdate.emit(result.event);
    }
    this.applyFilters();
    this.eventsChange.emit(this.localEvents);
    this.closeEditor();
  }

  onEditorDelete(event: CalendarEvent): void {
    this.localEvents = this.localEvents.filter((e) => e.id !== event.id);
    this.applyFilters();
    this.eventDelete.emit(event);
    this.eventsChange.emit(this.localEvents);
    this.closeEditor();
  }
}
