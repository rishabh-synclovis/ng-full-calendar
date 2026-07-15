import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarCategory, CalendarComponent, CalendarEvent, CalendarNavigateEvent } from 'ng-full-calendar';
import { buildSampleEvents } from './sample-events';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'demo';
  events: CalendarEvent[] = buildSampleEvents();
  showSidebar = true;
  fontSize = 16;

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
