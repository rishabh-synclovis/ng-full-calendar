# ng-full-calendar (workspace)

Angular workspace containing the **ng-full-calendar** library and a demo app that showcases it.

- [`projects/ng-full-calendar`](./projects/ng-full-calendar) — the publishable library. See its [README](./projects/ng-full-calendar/README.md) for install/usage docs.
- [`projects/demo`](./projects/demo) — a demo app consuming the library with sample events.

## Getting started

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
