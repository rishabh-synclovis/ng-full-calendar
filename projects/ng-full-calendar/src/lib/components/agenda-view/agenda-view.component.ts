import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent } from '../../models/calendar-event.model';
import { isSameDay, isToday, startOfDay } from '../../utils/date.utils';

export interface AgendaGroup {
  date: Date;
  isToday: boolean;
  bannerEvents: CalendarEvent[];
  timedEvents: CalendarEvent[];
}

const AGENDA_RANGE_DAYS = 30;

function isSpanning(event: CalendarEvent): boolean {
  return event.allDay === true && !isSameDay(event.start, event.end);
}

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

  @Output() eventClick = new EventEmitter<CalendarEvent>();

  groups: AgendaGroup[] = [];
  totalEventCount = 0;
  rangeLabel = '';

  ngOnChanges(): void {
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
      if (isSpanning(event)) {
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
        bannerEvents: events.filter(isSpanning),
        timedEvents: events.filter((e) => !isSpanning(e)),
      }));
  }

  formatEndDate(event: CalendarEvent): string {
    return event.end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  formatTimeRange(event: CalendarEvent): string {
    if (event.allDay) {
      return 'All day';
    }
    const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return `${event.start.toLocaleTimeString(undefined, opts)} - ${event.end.toLocaleTimeString(undefined, opts)}`;
  }

  onEventClick(event: CalendarEvent): void {
    this.eventClick.emit(event);
  }
}
