import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDay, CalendarEvent, CalendarEventColor, SpanningEvent } from '../../models/calendar-event.model';
import { CalendarLocale, resolveLocale } from '../../models/calendar-locale.model';
import { buildMonthGrid, formatTime, isSameDay, isToday } from '../../utils/date.utils';
import { isEffectivelyAllDay, isMultiDay, layoutSpanningEvents } from '../../utils/event-layout.utils';
import { resolveEventColor, resolveEventDotColor } from '../../utils/color.utils';

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
  @Input() locale: CalendarLocale | null = null;

  @Output() dayClick = new EventEmitter<Date>();
  @Output() eventClick = new EventEmitter<CalendarEvent>();
  @Output() moreClick = new EventEmitter<Date>();

  readonly maxVisible = MAX_VISIBLE_EVENTS;
  weeks: MonthWeek[] = [];
  weekdayLabels: string[] = [];
  private resolvedLocale = resolveLocale(null);

  ngOnChanges(): void {
    this.resolvedLocale = resolveLocale(this.locale);
    this.weekdayLabels = this.buildWeekdayLabels();
    this.weeks = this.buildWeeks();
  }

  private buildWeekdayLabels(): string[] {
    const names = this.resolvedLocale.weekdayNamesShort;
    return Array.from({ length: 7 }, (_, i) => names[(i + this.weekStartsOn) % 7]);
  }

  formatEventTime(date: Date): string {
    return formatTime(date, this.resolvedLocale.timeFormat);
  }

  private buildWeeks(): MonthWeek[] {
    const gridDays = buildMonthGrid(this.date, this.weekStartsOn);
    const days: CalendarDay[] = gridDays.map((day) => ({
      date: day,
      isCurrentMonth: day.getMonth() === this.date.getMonth(),
      isToday: isToday(day),
      isWeekend: day.getDay() === 0 || day.getDay() === 6,
      events: this.events
        .filter((e) => this.eventOccursOnDay(e, day) && !isMultiDay(e))
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

  private eventOccursOnDay(event: CalendarEvent, day: Date): boolean {
    if (isMultiDay(event)) {
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

  /**
   * Reserves vertical space in the day cell so banner strips overlaid on top
   * (see .ngfc-banner-row in the stylesheet: flush to the week's top, 2px
   * leading padding, 22px lanes, 2px gap between lanes) don't cover the day
   * number or event text below. Sits flush at the top (no fixed offset) so
   * weeks without banners don't reserve any dead space above the day number.
   */
  bannerReservedHeight(week: MonthWeek): string {
    if (week.laneCount === 0) {
      return '0px';
    }
    const LEADING_PADDING = 2;
    const LANE_HEIGHT = 22;
    const LANE_GAP = 2;
    const totalHeight =
      LEADING_PADDING + week.laneCount * LANE_HEIGHT + (week.laneCount - 1) * LANE_GAP + LANE_GAP;
    return `${totalHeight}px`;
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

  isPillEvent(event: CalendarEvent): boolean {
    return isEffectivelyAllDay(event);
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
