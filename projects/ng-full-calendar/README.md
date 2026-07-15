# ng-full-calendar

A Google-Calendar-style event calendar for Angular 17+ (standalone components, signals-friendly).
Month, week, day, and agenda views with colored event blocks, overlap stacking, and a live "now" indicator.

## Features

- **Month view** — grid with colored event pills and "+N more" overflow
- **Week / Day view** — hour-by-hour time grid with side-by-side overlap stacking, all-day row, and a live current-time line
- **Agenda view** — scrollable list of upcoming events grouped by day
- Built-in Google-Calendar-like theming via CSS variables, with 8 event colors
- Fully typed `CalendarEvent` model, standalone Angular components, `OnPush` change detection

## Install

**Option A — once published to npm:**

```bash
npm install ng-full-calendar
```

**Option B — before an npm release, build locally and install the built package (recommended for now):**

```bash
# 1. Clone and build this repo
git clone https://github.com/rishabh-synclovis/ng-full-calendar.git
cd ng-full-calendar
npm install
npm run build:lib          # outputs the publishable package to dist/ng-full-calendar

# 2. From your other Angular project, install that built folder
cd /path/to/your-app
npm install /absolute/path/to/ng-full-calendar/dist/ng-full-calendar
```

`npm install <path>` copies the built package into your project's `node_modules` and adds a regular entry to your `package.json`, exactly like any other npm dependency. Re-run steps 1–2 after pulling library updates to refresh it — or use `npm link` instead of `npm install <path>` if you want changes to pick up automatically while developing both projects side by side:

```bash
# in ng-full-calendar/dist/ng-full-calendar
npm link
# in your-app
npm link ng-full-calendar
```

Either way, `@angular/common`, `@angular/core`, and `@angular/forms` (v17+) must already be present in the consuming project — they're peer dependencies, not bundled.

## Usage

In the Angular project that installed the package, import the standalone component and add it to your own component's `imports` array — there's no `NgModule` to register:

```ts
import { Component } from '@angular/core';
import { CalendarComponent, CalendarEvent } from 'ng-full-calendar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarComponent],
  template: `
    <ngfc-calendar
      [events]="events"
      view="month"
      (eventClick)="onEventClick($event)"
    ></ngfc-calendar>
  `,
})
export class AppComponent {
  events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Design Review',
      start: new Date(2026, 6, 15, 10, 30),
      end: new Date(2026, 6, 15, 11, 30),
      color: 'purple',
    },
  ];

  onEventClick(event: CalendarEvent) {
    console.log(event);
  }
}
```

Give the calendar's container a height (e.g. `height: 100vh` or a fixed value) — `ngfc-calendar` fills its parent.

### Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `events` | `CalendarEvent[]` | `[]` | Events to render |
| `view` | `'month' \| 'week' \| 'day' \| 'agenda'` | `'month'` | Active view |
| `date` | `Date` | `new Date()` | Currently focused date |
| `weekStartsOn` | `0 \| 1` | `0` | 0 = Sunday, 1 = Monday |
| `availableViews` | `CalendarView[]` | all four | Views shown in the toolbar switcher |
| `agendaRangeDays` | `number` | `30` | Days shown/paged in agenda view |
| `editable` | `boolean` | `true` | Enables the built-in create/edit/delete modal on day/slot/event clicks |
| `showSidebar` | `boolean` | `true` | Shows/hides the left sidebar (mini calendar, filter box, category checkboxes). Set to `false` for a calendar-only layout with no sidebar |
| `categories` | `CalendarCategory[] \| null` | `null` | Sidebar filter checkboxes. When `null`, categories are auto-derived from each event's `calendarId` |

### Outputs

| Output | Payload | Description |
|---|---|---|
| `viewChange` | `CalendarView` | User switched views |
| `dateChange` | `Date` | User navigated to a new date |
| `navigate` | `{ view, date }` | Fires on any navigation (view or date change) |
| `eventClick` | `CalendarEvent` | User clicked an event |
| `dayClick` | `Date` | User clicked a day cell (month view) |
| `slotClick` | `Date` | User clicked an empty time slot (week/day view) |
| `eventsChange` | `CalendarEvent[]` | Full events array after a create/update/delete (for two-way binding) |
| `eventCreate` | `CalendarEvent` | A new event was created via the built-in modal |
| `eventUpdate` | `CalendarEvent` | An event was edited via the built-in modal |
| `eventDelete` | `CalendarEvent` | An event was deleted via the built-in modal |

### CalendarEvent model

```ts
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'teal' | 'gray';
  description?: string;
  location?: string;
  editable?: boolean;
  /** Groups this event under a sidebar category (e.g. a team, resource, or person). */
  calendarId?: string;
  meta?: unknown;
}
```

### Hiding the sidebar

The left sidebar (mini calendar, filter box, category checkboxes) is on by default. Turn it off with `[showSidebar]="false"` for a calendar-only layout:

```html
<ngfc-calendar [events]="events" [showSidebar]="false"></ngfc-calendar>
```

To customize the category checkboxes instead of relying on auto-derived ones, pass `categories` explicitly and tag each event with a matching `calendarId`:

```ts
categories: CalendarCategory[] = [
  { id: 'team', label: 'My Team', color: 'blue' },
  { id: 'personal', label: 'Personal', color: 'orange' },
];
```

```html
<ngfc-calendar [events]="events" [categories]="categories"></ngfc-calendar>
```

## Theming

All colors are CSS custom properties on `.ngfc-root`. Override any of them in your global styles:

```css
ngfc-calendar .ngfc-root {
  --ngfc-today-text: #6a1b9a;
  --ngfc-color-blue-bg: #2962ff;
}
```

## Development / Demo

This repo is an Angular workspace containing the library (`projects/ng-full-calendar`) and a demo app (`projects/demo`).

```bash
npm install
npm run build:lib   # builds the library into dist/ng-full-calendar
npm start           # serves the demo app at http://localhost:4200
```

## Publishing to npm

```bash
npm run build:lib
cd dist/ng-full-calendar
npm publish
```

## License

MIT
