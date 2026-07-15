# ng-full-calendar (workspace)

Angular workspace containing the **ng-full-calendar** library and a demo app that showcases it.

- [`projects/ng-full-calendar`](./projects/ng-full-calendar) — the publishable library. See its [README](./projects/ng-full-calendar/README.md) for full install/usage docs.
- [`projects/demo`](./projects/demo) — a demo app consuming the library with sample events.

## Using this library in your own Angular project

Not published to npm yet, so build it locally and install the built package into your app:

```bash
# 1. In this repo
git clone https://github.com/rishabh-synclovis/ng-full-calendar.git
cd ng-full-calendar
npm install
npm run build:lib          # outputs the publishable package to dist/ng-full-calendar

# 2. In your other Angular project
npm install /absolute/path/to/ng-full-calendar/dist/ng-full-calendar
```

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

## Publish the library

```bash
npm run build:lib
cd dist/ng-full-calendar
npm publish
```

## License

MIT
