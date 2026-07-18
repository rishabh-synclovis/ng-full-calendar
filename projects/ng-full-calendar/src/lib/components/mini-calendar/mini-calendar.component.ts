import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarLocale, resolveLocale } from '../../models/calendar-locale.model';
import { addMonths, buildMonthGrid, isSameDay, isToday } from '../../utils/date.utils';

interface MiniDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'ngfc-mini-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-calendar.component.html',
  styleUrl: './mini-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCalendarComponent implements OnChanges {
  @Input({ required: true }) selectedDate!: Date;
  @Input() weekStartsOn: 0 | 1 = 0;
  @Input() locale: CalendarLocale | null = null;

  @Output() selectedDateChange = new EventEmitter<Date>();

  /** The month currently displayed — may differ from selectedDate while browsing. */
  displayMonth = new Date();
  weeks: MiniDay[][] = [];
  weekdayLabels: string[] = [];
  private resolvedLocale = resolveLocale(null);

  ngOnChanges(): void {
    this.resolvedLocale = resolveLocale(this.locale);
    this.weekdayLabels = this.buildWeekdayLabels();
    this.displayMonth = this.selectedDate;
    this.rebuild();
  }

  private buildWeekdayLabels(): string[] {
    const names = this.resolvedLocale.weekdayNamesShort;
    return Array.from({ length: 7 }, (_, i) => names[(i + this.weekStartsOn) % 7].charAt(0));
  }

  private rebuild(): void {
    const gridDays = buildMonthGrid(this.displayMonth, this.weekStartsOn);
    const days: MiniDay[] = gridDays.map((date) => ({
      date,
      isCurrentMonth: date.getMonth() === this.displayMonth.getMonth(),
      isToday: isToday(date),
      isSelected: isSameDay(date, this.selectedDate),
    }));

    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  get monthLabel(): string {
    return `${this.resolvedLocale.monthNamesLong[this.displayMonth.getMonth()]} ${this.displayMonth.getFullYear()}`;
  }

  previousMonth(): void {
    this.displayMonth = addMonths(this.displayMonth, -1);
    this.rebuild();
  }

  nextMonth(): void {
    this.displayMonth = addMonths(this.displayMonth, 1);
    this.rebuild();
  }

  previousYear(): void {
    this.displayMonth = addMonths(this.displayMonth, -12);
    this.rebuild();
  }

  nextYear(): void {
    this.displayMonth = addMonths(this.displayMonth, 12);
    this.rebuild();
  }

  selectDay(day: MiniDay): void {
    this.selectedDateChange.emit(day.date);
  }
}
