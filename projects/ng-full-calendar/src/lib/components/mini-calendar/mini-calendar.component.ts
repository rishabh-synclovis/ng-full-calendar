import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addMonths, buildMonthGrid, isSameDay, isToday } from '../../utils/date.utils';

interface MiniDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  @Output() selectedDateChange = new EventEmitter<Date>();

  readonly weekdayLabels = WEEKDAY_LABELS;
  /** The month currently displayed — may differ from selectedDate while browsing. */
  displayMonth = new Date();
  weeks: MiniDay[][] = [];

  ngOnChanges(): void {
    this.displayMonth = this.selectedDate;
    this.rebuild();
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
    return this.displayMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
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
