import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarView } from '../../models/calendar-view.model';
import { isoWeekNumber } from '../../utils/date.utils';

@Component({
  selector: 'ngfc-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  @Input() title = '';
  @Input() view: CalendarView = 'month';
  @Input() date: Date = new Date();
  @Input() availableViews: CalendarView[] = ['day', 'week', 'month', 'agenda'];

  @Output() previousClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() todayClick = new EventEmitter<void>();
  @Output() viewChange = new EventEmitter<CalendarView>();

  readonly viewLabels: Record<CalendarView, string> = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    agenda: 'Agenda',
  };

  get weekBadgeLabel(): string | null {
    return this.view === 'week' ? `Week ${isoWeekNumber(this.date)}` : null;
  }
}
