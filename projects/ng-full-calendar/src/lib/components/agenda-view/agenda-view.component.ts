import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarEventColor } from '../../models/calendar-event.model';
import { CalendarLocale, resolveLocale } from '../../models/calendar-locale.model';
import { formatTime, isToday, startOfDay } from '../../utils/date.utils';
import { isEffectivelyAllDay, isMultiDay } from '../../utils/event-layout.utils';
import { resolveEventColor, resolveEventDotColor } from '../../utils/color.utils';

export interface AgendaGroup {
  date: Date;
  isToday: boolean;
  bannerEvents: CalendarEvent[];
  timedEvents: CalendarEvent[];
}

const AGENDA_RANGE_DAYS = 30;

@Component({
  selector: 'ngfc-agenda-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda-view.component.html',
  styleUrl: './agenda-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaViewComponent implements OnChanges {
  @Input({ required: true }) date!: Date;
  @Input() events: CalendarEvent[] = [];
  @Input() rangeDays = AGENDA_RANGE_DAYS;
  @Input() locale: CalendarLocale | null = null;

  @Output() eventClick = new EventEmitter<CalendarEvent>();

  groups: AgendaGroup[] = [];
  totalEventCount = 0;
  rangeLabel = '';
  private resolvedLocale = resolveLocale(null);

  ngOnChanges(): void {
    this.resolvedLocale = resolveLocale(this.locale);
    this.groups = this.buildGroups();
    this.totalEventCount = new Set(this.groups.flatMap((g) => [...g.bannerEvents, ...g.timedEvents].map((e) => e.id)))
      .size;
    this.rangeLabel = this.date.getFullYear().toString();
  }

  private buildGroups(): AgendaGroup[] {
    const rangeStart = startOfDay(this.date);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + this.rangeDays);

    const inRange = this.events
      .filter((e) => e.end >= rangeStart && e.start < rangeEnd)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const byDay = new Map<number, CalendarEvent[]>();
    for (let d = new Date(rangeStart); d < rangeEnd; d.setDate(d.getDate() + 1)) {
      byDay.set(startOfDay(d).getTime(), []);
    }
    for (const event of inRange) {
      if (isMultiDay(event)) {
        for (let d = new Date(Math.max(event.start.getTime(), rangeStart.getTime())); d <= event.end && d < rangeEnd; d.setDate(d.getDate() + 1)) {
          const key = startOfDay(d).getTime();
          if (byDay.has(key)) {
            byDay.get(key)!.push(event);
          }
        }
      } else {
        const key = startOfDay(event.start).getTime();
        if (byDay.has(key)) {
          byDay.get(key)!.push(event);
        }
      }
    }

    return Array.from(byDay.entries())
      .filter(([, events]) => events.length > 0)
      .sort(([a], [b]) => a - b)
      .map(([time, events]) => ({
        date: new Date(time),
        isToday: isToday(new Date(time)),
        bannerEvents: events.filter(isMultiDay),
        timedEvents: events.filter((e) => !isMultiDay(e)),
      }));
  }

  formatEndDate(event: CalendarEvent): string {
    return `${event.end.getDate()} ${this.resolvedLocale.monthNamesShort[event.end.getMonth()]}`;
  }

  formatTimeRange(event: CalendarEvent): string {
    if (isEffectivelyAllDay(event)) {
      return 'All day';
    }
    return `${formatTime(event.start, this.resolvedLocale.timeFormat)} - ${formatTime(event.end, this.resolvedLocale.timeFormat)}`;
  }

  weekdayLongName(date: Date): string {
    return this.resolvedLocale.weekdayNamesLong[date.getDay()];
  }

  monthShortName(date: Date): string {
    return this.resolvedLocale.monthNamesShort[date.getMonth()];
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

  onEventClick(event: CalendarEvent): void {
    this.eventClick.emit(event);
  }
}
