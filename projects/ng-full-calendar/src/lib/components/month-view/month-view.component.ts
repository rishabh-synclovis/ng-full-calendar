import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDay, CalendarEvent, SpanningEvent } from '../../models/calendar-event.model';
import { buildMonthGrid, isSameDay, isToday } from '../../utils/date.utils';
import { layoutSpanningEvents } from '../../utils/event-layout.utils';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_VISIBLE_EVENTS = 3;

interface MonthWeek {
  days: CalendarDay[];
  spanningEvents: SpanningEvent[];
  laneCount: number;
}

@Component({
  selector: 'ngfc-month-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-view.component.html',
  styleUrl: './month-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthViewComponent implements OnChanges {
  @Input({ required: true }) date!: Date;
  @Input() events: CalendarEvent[] = [];
  @Input() weekStartsOn: 0 | 1 = 0;

  @Output() dayClick = new EventEmitter<Date>();
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() moreClick = new EventEmitter<Date>();

  readonly weekdayLabels = WEEKDAY_LABELS;
  readonly maxVisible = MAX_VISIBLE_EVENTS;
  weeks: MonthWeek[] = [];

  ngOnChanges(): void {
    this.weeks = this.buildWeeks();
  }

  private buildWeeks(): MonthWeek[] {
    const gridDays = buildMonthGrid(this.date, this.weekStartsOn);
    const days: CalendarDay[] = gridDays.map((day) => ({
      date: day,
      isCurrentMonth: day.getMonth() === this.date.getMonth(),
      isToday: isToday(day),
      isWeekend: day.getDay() === 0 || day.getDay() === 6,
      events: this.events
        .filter((e) => this.eventOccursOnDay(e, day) && !this.isSpanning(e))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    }));

    const weeks: MonthWeek[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      const spanningEvents = layoutSpanningEvents(
        this.events,
        weekDays.map((d) => d.date)
      );
      const laneCount = spanningEvents.reduce((max, e) => Math.max(max, e.lane + 1), 0);
      weeks.push({ days: weekDays, spanningEvents, laneCount });
    }
    return weeks;
  }

  private isSpanning(event: CalendarEvent): boolean {
    return event.allDay === true && !isSameDay(event.start, event.end);
  }

  private eventOccursOnDay(event: CalendarEvent, day: Date): boolean {
    if (event.allDay) {
      return event.start <= day && event.end >= day;
    }
    return isSameDay(event.start, day);
  }

  visibleEvents(day: CalendarDay): CalendarEvent[] {
    return day.events.slice(0, this.maxVisible);
  }

  overflowCount(day: CalendarDay): number {
    return Math.max(0, day.events.length - this.maxVisible);
  }

  spanningEventStyle(item: SpanningEvent): Record<string, string> {
    return {
      'grid-column': `${item.startCol + 1} / ${item.endCol + 2}`,
      'grid-row': `${item.lane + 1}`,
    };
  }

  onDayClick(day: CalendarDay): void {
    this.dayClick.emit(day.date);
  }

  onEventClick(event: CalendarEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    this.eventClick.emit(event);
  }

  onSpanningEventClick(item: SpanningEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    this.eventClick.emit(item.event);
  }

  onMoreClick(day: CalendarDay, domEvent: Event): void {
    domEvent.stopPropagation();
    this.moreClick.emit(day.date);
  }
}
