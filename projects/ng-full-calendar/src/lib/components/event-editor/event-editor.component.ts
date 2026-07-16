import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarEvent, CalendarEventColor, CalendarNamedColor } from '../../models/calendar-event.model';
import { isNamedColor } from '../../utils/color.utils';

export interface EventEditorResult {
  event: CalendarEvent;
  isNew: boolean;
}

const COLOR_OPTIONS: CalendarNamedColor[] = [
  'blue',
  'green',
  'red',
  'yellow',
  'purple',
  'orange',
  'teal',
  'gray',
];

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

let autoId = 0;
function generateId(): string {
  autoId += 1;
  return `ngfc-event-${Date.now()}-${autoId}`;
}

@Component({
  selector: 'ngfc-event-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-editor.component.html',
  styleUrl: './event-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventEditorComponent implements OnChanges {
  @Input() event: CalendarEvent | null = null;
  @Input() defaultDate: Date = new Date();

  @Output() save = new EventEmitter<EventEditorResult>();
  @Output() delete = new EventEmitter<CalendarEvent>();
  @Output() close = new EventEmitter<void>();

  readonly colorOptions = COLOR_OPTIONS;

  isNew = true;
  title = '';
  startDate = '';
  startTime = '';
  endDate = '';
  endTime = '';
  allDay = false;
  color: CalendarEventColor = 'blue';
  customColor = '#4c8df5';
  location = '';
  description = '';

  private editingId = '';

  ngOnChanges(): void {
    if (this.event) {
      this.isNew = false;
      this.editingId = this.event.id;
      this.title = this.event.title;
      this.allDay = !!this.event.allDay;
      this.color = this.event.color ?? 'blue';
      if (this.color && !isNamedColor(this.color)) {
        this.customColor = this.color;
      }
      this.location = this.event.location ?? '';
      this.description = this.event.description ?? '';
      this.startDate = toDateInputValue(this.event.start);
      this.startTime = toTimeInputValue(this.event.start);
      this.endDate = toDateInputValue(this.event.end);
      this.endTime = toTimeInputValue(this.event.end);
    } else {
      this.isNew = true;
      this.editingId = generateId();
      this.title = '';
      this.allDay = false;
      this.color = 'blue';
      this.location = '';
      this.description = '';
      const start = new Date(this.defaultDate);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      this.startDate = toDateInputValue(start);
      this.startTime = toTimeInputValue(start);
      this.endDate = toDateInputValue(end);
      this.endTime = toTimeInputValue(end);
    }
  }

  selectColor(color: CalendarEventColor): void {
    this.color = color;
  }

  get isCustomColorSelected(): boolean {
    return !isNamedColor(this.color);
  }

  onCustomColorChange(hex: string): void {
    this.customColor = hex;
    this.color = hex;
  }

  selectCustomColor(): void {
    this.color = this.customColor;
  }

  onSave(): void {
    if (!this.title.trim()) {
      return;
    }

    const start = this.allDay
      ? combineDateAndTime(this.startDate, '00:00')
      : combineDateAndTime(this.startDate, this.startTime);
    let end = this.allDay
      ? combineDateAndTime(this.endDate, '23:59')
      : combineDateAndTime(this.endDate, this.endTime);

    if (end <= start) {
      end = new Date(start);
      end.setHours(end.getHours() + 1);
    }

    const result: CalendarEvent = {
      id: this.editingId,
      title: this.title.trim(),
      start,
      end,
      allDay: this.allDay,
      color: this.color,
      location: this.location.trim() || undefined,
      description: this.description.trim() || undefined,
    };

    this.save.emit({ event: result, isNew: this.isNew });
  }

  onDelete(): void {
    if (this.event) {
      this.delete.emit(this.event);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(domEvent: Event): void {
    if (domEvent.target === domEvent.currentTarget) {
      this.onClose();
    }
  }
}
