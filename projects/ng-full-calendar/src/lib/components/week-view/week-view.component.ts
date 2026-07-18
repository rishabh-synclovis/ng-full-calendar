import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarEventColor, PositionedEvent, SpanningEvent } from '../../models/calendar-event.model';
import { CalendarLocale, resolveLocale } from '../../models/calendar-locale.model';
import {
  eventsForDay,
  layoutDayEvents,
  layoutSpanningEvents,
  singleDayAllDayEventsInRange,
} from '../../utils/event-layout.utils';
import { buildWeekGrid, formatTime, isSameDay, isToday, minutesSinceMidnight } from '../../utils/date.utils';
import { resolveEventColor, resolveEventDotColor } from '../../utils/color.utils';

const HOUR_HEIGHT_PX = 48;

@Component({
  selector: 'ngfc-week-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './week-view.component.html',
  styleUrl: './week-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekViewComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) date!: Date;
  @Input() events: CalendarEvent[] = [];
  @Input() weekStartsOn: 0 | 1 = 0;
  /** When true, renders a single day column instead of a full week. */
  @Input() singleDay = false;
  @Input() locale: CalendarLocale | null = null;

  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() slotClick = new EventEmitter<Date>();

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;

  readonly hours = Array.from({ length: 24 }, (_, i) => i);
  readonly hourHeight = HOUR_HEIGHT_PX;

  days: Date[] = [];
  allDayEventsByDay: CalendarEvent[][] = [];
  positionedByDay: PositionedEvent[][] = [];
  spanningEvents: SpanningEvent[] = [];
  spanningLaneCount = 0;
  hasAllDayEvents = false;
  nowOffsetPx = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  private hasTodayColumn = false;
  private hasScrolledToNow = false;
  private resolvedLocale = resolveLocale(null);

  ngOnInit(): void {
    this.updateNowLine();
    this.timer = setInterval(() => this.updateNowLine(), 60_000);
  }

  ngAfterViewInit(): void {
    this.scrollToNowIfNeeded();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  ngOnChanges(): void {
    this.resolvedLocale = resolveLocale(this.locale);
    this.days = this.singleDay ? [this.date] : buildWeekGrid(this.date, this.weekStartsOn);
    const rangeStart = this.days[0];
    const rangeEnd = this.days[this.days.length - 1];

    const singleDayAllDay = singleDayAllDayEventsInRange(this.events, rangeStart, rangeEnd);
    this.allDayEventsByDay = this.days.map((day) => singleDayAllDay.filter((e) => isSameDay(e.start, day)));
    this.hasAllDayEvents = this.allDayEventsByDay.some((dayEvents) => dayEvents.length > 0);

    this.spanningEvents = layoutSpanningEvents(this.events, this.days);
    this.spanningLaneCount = this.spanningEvents.reduce((max, e) => Math.max(max, e.lane + 1), 0);

    this.positionedByDay = this.days.map((day) => layoutDayEvents(eventsForDay(this.events, day)));

    const hadTodayColumn = this.hasTodayColumn;
    this.hasTodayColumn = this.days.some((day) => isToday(day));
    if (this.hasTodayColumn && !hadTodayColumn) {
      // Today just entered the visible range (e.g. switching to Day/Week view,
      // or navigating back to the current week) — scroll to now again.
      this.hasScrolledToNow = false;
    }
    this.scrollToNowIfNeeded();
  }

  private scrollToNowIfNeeded(): void {
    if (this.hasScrolledToNow || !this.hasTodayColumn || !this.scrollContainer) {
      return;
    }
    this.hasScrolledToNow = true;
    const container = this.scrollContainer.nativeElement;
    const target = Math.max(0, this.nowOffsetPx - container.clientHeight / 2);
    // Run after the current render so container.clientHeight is accurate.
    queueMicrotask(() => {
      container.scrollTop = target;
    });
  }

  spanningEventStyle(item: SpanningEvent): Record<string, string> {
    return {
      'grid-column': `${item.startCol + 1} / ${item.endCol + 2}`,
      'grid-row': `${item.lane + 1}`,
      ...(this.colorStyle(item.event.color) ?? {}),
    };
  }

  colorClass(color: CalendarEventColor | undefined): string | null {
    return resolveEventColor(color).className;
  }

  colorStyle(color: CalendarEventColor | undefined): Record<string, string> | null {
    return resolveEventColor(color).style;
  }

  dotColorClass(color: CalendarEventColor | undefined): string | null {
    return resolveEventDotColor(color).className;
  }

  dotColorStyle(color: CalendarEventColor | undefined): Record<string, string> | null {
    return resolveEventDotColor(color).style;
  }

  onSpanningEventClick(item: SpanningEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    this.eventClick.emit(item.event);
  }

  private updateNowLine(): void {
    this.nowOffsetPx = (minutesSinceMidnight(new Date()) / 60) * this.hourHeight;
  }

  isTodayColumn(day: Date): boolean {
    return isToday(day);
  }

  weekdayShortName(day: Date): string {
    return this.resolvedLocale.weekdayNamesShort[day.getDay()];
  }

  /** Hour-gutter row label, e.g. '1 AM' / '13:00', respecting the configured time format. */
  hourLabel(hour: number): string {
    if (this.resolvedLocale.timeFormat === '24h') {
      return `${String(hour).padStart(2, '0')}:00`;
    }
    if (hour === 0) {
      return '12 AM';
    }
    if (hour === 12) {
      return '12 PM';
    }
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  }

  formatEventTime(date: Date): string {
    return formatTime(date, this.resolvedLocale.timeFormat);
  }

  formatEventTimeRange(item: PositionedEvent): string {
    return `${this.formatEventTime(item.event.start)} – ${this.formatEventTime(item.event.end)}`;
  }

  eventTop(item: PositionedEvent): number {
    return (item.startMinutes / 60) * this.hourHeight;
  }

  eventHeight(item: PositionedEvent): number {
    return Math.max(((item.endMinutes - item.startMinutes) / 60) * this.hourHeight, 18);
  }

  /** Short events don't have room to stack title + time on separate lines. */
  isShortEvent(item: PositionedEvent): boolean {
    return this.eventHeight(item) < 34;
  }

  eventWidthPercent(item: PositionedEvent): number {
    return 100 / item.columnCount;
  }

  eventLeftPercent(item: PositionedEvent): number {
    return (100 / item.columnCount) * item.column;
  }

  onEventClick(event: CalendarEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    this.eventClick.emit(event);
  }

  onSlotClick(day: Date, hour: number): void {
    const slot = new Date(day);
    slot.setHours(hour, 0, 0, 0);
    this.slotClick.emit(slot);
  }
}
