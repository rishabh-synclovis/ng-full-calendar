import { CalendarEvent } from 'ng-full-calendar';

/** Shape of a single event as returned by the school/academic-calendar API. */
export interface ApiEvent {
  pkEventId: number;
  eventName: string;
  description: string | null;
  colorCode: string;
  startDate: string;
  endDate: string;
  isHoliday: number;
}

/** Maps the raw API event shape (hex colorCode, ISO date strings) onto the library's CalendarEvent model. */
export function mapApiEventsToCalendarEvents(apiEvents: ApiEvent[]): CalendarEvent[] {
  return apiEvents.map((e) => ({
    id: String(e.pkEventId),
    title: e.eventName,
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    color: e.colorCode,
    description: e.description ?? undefined,
  }));
}

// A trimmed real-world sample from the academic calendar API, covering single-day
// holidays, multi-day spans, and same-day timed events — useful for exercising
// custom hex colors and banner-strip rendering end to end.
const RAW_API_EVENTS: ApiEvent[] = [
  {
    pkEventId: 1520,
    eventName: 'id ul fitar',
    description: null,
    colorCode: '#DA2C43',
    startDate: '2025-03-31T00:00:00.000Z',
    endDate: '2025-03-31T00:00:00.000Z',
    isHoliday: 1,
  },
  {
    pkEventId: 1521,
    eventName: 'PTM',
    description: 'Welcome To Parents Teachers Meeting Board Decoration.',
    colorCode: '#FF8F00',
    startDate: '2025-03-27T17:50:00.000Z',
    endDate: '2025-03-27T20:40:00.000Z',
    isHoliday: 0,
  },
  {
    pkEventId: 1523,
    eventName: 'id ul fitar',
    description: null,
    colorCode: '#DA2C43',
    startDate: '2025-06-11T00:00:00.000Z',
    endDate: '2025-06-20T00:00:00.000Z',
    isHoliday: 1,
  },
  {
    pkEventId: 1532,
    eventName: 'दिवाली',
    description: 'दिवाली या दीपावली भारत का एक प्रमुख त्योहार है।',
    colorCode: '#DA2C43',
    startDate: '2026-11-18T00:00:00.000Z',
    endDate: '2026-11-30T00:00:00.000Z',
    isHoliday: 1,
  },
  {
    pkEventId: 1533,
    eventName: 'Testing EVENT',
    description: 'Test event',
    colorCode: '#FF8F00',
    startDate: '2026-05-06T00:00:00.000Z',
    endDate: '2026-12-28T23:59:00.000Z',
    isHoliday: 0,
  },
  {
    pkEventId: 1537,
    eventName: 'Friday Weekend',
    description: 'Weekend',
    colorCode: '#CA1F7B',
    startDate: '2026-05-08T18:59:00.000Z',
    endDate: '2026-05-08T21:59:00.000Z',
    isHoliday: 0,
  },
  {
    pkEventId: 1539,
    eventName: 'Papaya Holiday',
    description: 'Papaya Holiday',
    colorCode: '#DA2C43',
    startDate: '2026-07-13T00:00:00.000Z',
    endDate: '2026-07-14T00:00:00.000Z',
    isHoliday: 1,
  },
  {
    pkEventId: 1541,
    eventName: 'Test event',
    description: null,
    colorCode: '#CA1F7B',
    startDate: '2026-07-13T00:00:00.000Z',
    endDate: '2026-07-14T23:59:00.000Z',
    isHoliday: 0,
  },
  {
    pkEventId: 1542,
    eventName: 'Test event 2',
    description: null,
    colorCode: '#FF8F00',
    startDate: '2026-07-14T16:12:00.000Z',
    endDate: '2026-07-14T18:12:00.000Z',
    isHoliday: 0,
  },
  {
    pkEventId: 1545,
    eventName: 'July 15 Holiday',
    description: null,
    colorCode: '#DA2C43',
    startDate: '2026-07-15T00:00:00.000Z',
    endDate: '2026-07-15T00:00:00.000Z',
    isHoliday: 1,
  },
  {
    pkEventId: 1546,
    eventName: 'July 15 Event',
    description: null,
    colorCode: '#FF8F00',
    startDate: '2026-07-15T00:00:00.000Z',
    endDate: '2026-07-16T23:59:00.000Z',
    isHoliday: 0,
  },
];

export function buildApiSampleEvents(): CalendarEvent[] {
  return mapApiEventsToCalendarEvents(RAW_API_EVENTS);
}
