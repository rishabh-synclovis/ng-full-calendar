# ng-full-calendar

A Google-Calendar-style event calendar for Angular 17+ (standalone components, signals-friendly).
Month, week, day, and agenda views with colored event blocks, multi-day banner strips, a built-in
create/edit/delete modal, and a filterable sidebar.

## Features

- **Month view** — grid with colored event pills, multi-day banner strips, and "+N more" overflow
- **Week / Day view** — hour-by-hour time grid with side-by-side overlap stacking, all-day/banner rows, and a live current-time line that auto-scrolls into view
- **Agenda view** — scrollable list of upcoming events grouped by day, with banner tags for multi-day spans
- **Sidebar** — mini month calendar, text filter, and category checkboxes (auto-derived from events or supplied explicitly); can be hidden entirely
- **Built-in event editor** — click a day/slot/event to create, edit, or delete via a modal (title, date/time, location, description, color) — or disable it and handle clicks yourself
- **Custom hex colors** — pass any of 8 named colors or an arbitrary hex string (`'#DA2C43'`); backgrounds/text shades are derived automatically
- Built-in Google-Calendar-like theming via CSS variables, with a single `[fontSize]` input to scale the whole UI
- Fully typed `CalendarEvent` model, standalone Angular components, `OnPush` change detection

## Install

**Directly from GitHub (works right now, no npm account needed):**

```bash
npm install github:rishabh-synclovis/ng-full-calendar#dist
```

The `dist` branch holds only the pre-built package (no demo app, no workspace tooling) and is kept in sync with `main`, so this installs like any normal npm dependency — no local build step required on your end.

**Once published to npm:**

```bash
npm install ng-full-calendar
```

**Building locally instead (for contributing to the library itself):**

```bash
git clone https://github.com/rishabh-synclovis/ng-full-calendar.git
cd ng-full-calendar
npm install
npm run build:lib          # outputs the publishable package to dist/ng-full-calendar
```

Then in your other Angular project: `npm install /absolute/path/to/ng-full-calendar/dist/ng-full-calendar`, or `npm link` for live development.

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
| `fontSize` | `string \| number \| null` | `null` (uses the built-in `16px`) | Base font size for the whole calendar. A number is treated as pixels (`14`), or pass any CSS length (`'0.9rem'`, `'90%'`). Every label, button, and event chip scales proportionally from this one value |

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
  /** One of the 8 named colors, or any hex string like '#DA2C43'. */
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'teal' | 'gray' | string;
  description?: string;
  location?: string;
  editable?: boolean;
  /** Groups this event under a sidebar category (e.g. a team, resource, or person). */
  calendarId?: string;
  meta?: unknown;
}
```

### Custom hex colors

`color` accepts any hex string in addition to the 8 named presets — useful when colors come from an external system (e.g. a CMS or admin-configured color picker) instead of a fixed palette:

```ts
events: CalendarEvent[] = [
  { id: '1', title: 'Founders Day', start, end, color: '#DA2C43' },
  { id: '2', title: 'Staff Meeting', start, end, color: 'blue' }, // named colors still work
];
```

The library automatically derives a readable pastel background and text shade from the hex value — you don't need to supply matching background/text colors yourself.

### Multi-day events

Any event whose `start` and `end` fall on different calendar days automatically renders as a continuous banner strip spanning those days in month and week view (e.g. a week-long holiday or conference), instead of repeating as a separate block on each day. This works whether or not `allDay` is set — an event is treated as multi-day purely by comparing its start/end dates:

```ts
{ id: '1', title: 'Term Break', start: new Date('2026-07-13'), end: new Date('2026-07-20') }
```

Same-day events (even with real start/end timestamps, like a 2-hour meeting) render as normal timed blocks or dots, not banners.

### Mapping data from a REST API

Most backends return events in their own shape (ISO date strings, a hex `colorCode` field, etc.) rather than the library's `CalendarEvent` type directly. Map the response once, e.g.:

```ts
interface ApiEvent {
  pkEventId: number;
  eventName: string;
  description: string | null;
  colorCode: string;
  startDate: string;
  endDate: string;
}

function mapApiEventsToCalendarEvents(apiEvents: ApiEvent[]): CalendarEvent[] {
  return apiEvents.map((e) => ({
    id: String(e.pkEventId),
    title: e.eventName,
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    color: e.colorCode,               // hex strings work directly
    description: e.description ?? undefined,
  }));
}
```

No `allDay` field is required — multi-day spans and same-day timed events are both detected automatically from `start`/`end` (see [Multi-day events](#multi-day-events) above).

### Custom click behavior (replacing the built-in create/edit modal)

By default, clicking a day cell, an empty time slot, or an event opens the built-in create/edit modal (`editable` defaults to `true`). To run your own logic instead — open your own dialog, navigate to a route, call an API, etc. — set `[editable]="false"` and handle `(dayClick)` / `(slotClick)` / `(eventClick)` yourself. Each still fires with the exact `Date` (or `CalendarEvent`) the user selected; only the built-in modal is skipped:

```html
<ngfc-calendar
  [events]="events"
  [editable]="false"
  (dayClick)="onDayClick($event)"
  (slotClick)="onSlotClick($event)"
  (eventClick)="onEventClick($event)"
></ngfc-calendar>
```

```ts
onDayClick(date: Date) {
  // e.g. open your own modal/component, pre-filled with `date`
  this.myDialogService.openCreateEvent({ date });
}

onSlotClick(date: Date) {
  // fires from week/day view with both date and time-of-day set
  this.myDialogService.openCreateEvent({ date });
}

onEventClick(event: CalendarEvent) {
  this.myDialogService.openEditEvent({ event });
}
```

`dayClick`/`slotClick`/`eventClick` always fire regardless of `editable` — so if you only want to *observe* clicks while keeping the built-in modal (e.g. for analytics), leave `editable` at its default `true` and just add your handlers alongside it.

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

### Font size

Set `[fontSize]` on `<ngfc-calendar>` to scale titles, buttons, and event text together:

```html
<ngfc-calendar [events]="events" [fontSize]="14"></ngfc-calendar>
<!-- or -->
<ngfc-calendar [events]="events" fontSize="0.875rem"></ngfc-calendar>
```

This sets the `--ngfc-font-size` CSS variable (default `16px`) on `.ngfc-root`; every internal size is defined in `em` relative to it, so the whole calendar scales as one unit instead of needing to override dozens of individual rules.

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
