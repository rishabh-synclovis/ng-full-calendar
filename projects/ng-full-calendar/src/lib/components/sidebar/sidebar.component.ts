import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiniCalendarComponent } from '../mini-calendar/mini-calendar.component';
import { CalendarCategory } from '../../models/calendar-event.model';

@Component({
  selector: 'ngfc-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, MiniCalendarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input({ required: true }) selectedDate!: Date;
  @Input() weekStartsOn: 0 | 1 = 0;
  @Input() categories: CalendarCategory[] = [];
  @Input() activeCategoryIds: Set<string> = new Set();
  @Input() filterText = '';

  @Output() selectedDateChange = new EventEmitter<Date>();
  @Output() filterTextChange = new EventEmitter<string>();
  @Output() categoryToggle = new EventEmitter<string>();

  onFilterInput(value: string): void {
    this.filterTextChange.emit(value);
  }
}
