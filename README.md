# ng-full-calendar (workspace)

Angular workspace containing the **ng-full-calendar** library — a Google-Calendar-style event
calendar for Angular 17+ (month/week/day/agenda views, multi-day banner strips, custom hex
colors, a built-in create/edit/delete modal, and a filterable sidebar) — and a demo app that
showcases it.

- [`projects/ng-full-calendar`](./projects/ng-full-calendar) — the publishable library. See its [README](./projects/ng-full-calendar/README.md) for full install/usage docs, the full inputs/outputs API, theming, and the `CalendarEvent` model.
- [`projects/demo`](./projects/demo) — a demo app consuming the library with sample events, plus a toggle to preview a realistic external-API event shape (hex colors, multi-day spans).

## Using this library in your own Angular project

Not published to npm yet — install straight from GitHub instead, no cloning or building required on your end:

```bash
npm install github:rishabh-synclovis/ng-full-calendar#dist
```

The `dist` branch holds only the pre-built package (kept in sync with `main` via `npm run release:dist-branch`), so this resolves exactly like a normal npm dependency.

Then in your app:

```ts
import { CalendarComponent, CalendarEvent } from 'ng-full-calendar';

@Component({
  standalone: true,
  imports: [CalendarComponent],
  template: `<ngfc-calendar [events]="events"></ngfc-calendar>`,
})
export class AppComponent {
  events: CalendarEvent[] = [
    { id: '1', title: 'Design Review', start: new Date(2026, 6, 15, 10, 30), end: new Date(2026, 6, 15, 11, 30), color: 'purple' },
  ];
}
```

Give `<ngfc-calendar>`'s container a height (e.g. `height: 100vh`) — it fills its parent. Full API (inputs/outputs, theming, sidebar/category options) is documented in [projects/ng-full-calendar/README.md](./projects/ng-full-calendar/README.md).

## Developing this repo

```bash
npm install
npm run build:lib   # build the library first (demo imports it via dist/)
npm start           # serve the demo app at http://localhost:4200
```

## Releasing

**To npm** (once you have an account/access):

```bash
npm run build:lib
cd dist/ng-full-calendar
npm publish
```

**To the `dist` branch** (for `npm install github:...#dist` consumers) — run this after merging changes to `main` that should ship:

```bash
npm run release:dist-branch
```

This rebuilds the library and force-pushes the built output as a single commit on `dist`, so it always mirrors the latest `main`.

## License

MIT
