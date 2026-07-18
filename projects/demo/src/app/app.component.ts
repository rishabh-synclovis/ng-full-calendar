import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CalendarCategory,
  CalendarComponent,
  CalendarEvent,
  CalendarLocale,
  CalendarNavigateEvent,
  CalendarTimeFormat,
} from 'ng-full-calendar';
import { buildSampleEvents } from './sample-events';
import { buildApiSampleEvents } from './api-events';

const FRENCH_LOCALE: CalendarLocale = {
  weekdayNamesShort: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
  weekdayNamesLong: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  monthNamesShort: ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'],
  monthNamesLong: [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ],
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'demo';
  useApiData = false;
  events: CalendarEvent[] = buildSampleEvents();
  showSidebar = true;
  fontSize = 16;
  customClickMode = false;
  lastCustomClick = '';
  useFrenchLocale = false;
  timeFormat: CalendarTimeFormat = '12h';

  get locale(): CalendarLocale | null {
    return this.useFrenchLocale ? { ...FRENCH_LOCALE, timeFormat: this.timeFormat } : { timeFormat: this.timeFormat };
  }

  onDataSourceChange(): void {
    this.events = this.useApiData ? buildApiSampleEvents() : buildSampleEvents();
  }

  onCustomDayClick(date: Date): void {
    if (this.customClickMode) {
      this.lastCustomClick = `Day clicked: ${date.toLocaleDateString()}`;
    }
  }

  onCustomSlotClick(date: Date): void {
    if (this.customClickMode) {
      this.lastCustomClick = `Slot clicked: ${date.toLocaleString()}`;
    }
  }

  onCustomEventClick(event: CalendarEvent): void {
    if (this.customClickMode) {
      this.lastCustomClick = `Event clicked: "${event.title}"`;
    }
  }

  categories: CalendarCategory[] = [
    { id: 'bryntum-team', label: 'Bryntum team', color: 'blue' },
    { id: 'hotel-park', label: 'Hotel Park', color: 'orange' },
    { id: 'michael-johnson', label: 'Michael Johnson', color: 'red' },
  ];

  onNavigate(nav: CalendarNavigateEvent): void {
    console.log('navigate', nav);
  }

  onEventsChange(events: CalendarEvent[]): void {
    this.events = events;
  }
}
