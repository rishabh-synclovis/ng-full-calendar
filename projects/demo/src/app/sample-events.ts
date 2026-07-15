import { CalendarEvent, CalendarEventColor } from 'ng-full-calendar';

function at(daysFromToday: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function buildSampleEvents(): CalendarEvent[] {
  const colors: CalendarEventColor[] = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'teal', 'gray'];

  const events: CalendarEvent[] = [
    {
      id: 'hackathon',
      title: 'Hackathon 2026',
      start: at(0, 0, 0),
      end: at(6, 23, 59),
      allDay: true,
      color: 'green',
      calendarId: 'bryntum-team',
      description: 'Company-wide hackathon week.',
    },
    {
      id: 'standup',
      title: 'Breakfast',
      start: at(0, 9, 0),
      end: at(0, 10, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'design-review',
      title: 'Team Scrum',
      start: at(0, 10, 0),
      end: at(0, 12, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
      location: 'Room 4B',
    },
    {
      id: 'lunch',
      title: 'Lunch',
      start: at(0, 14, 0),
      end: at(0, 15, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'client-call',
      title: 'Active client project review',
      start: at(0, 15, 0),
      end: at(0, 19, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
      location: 'Zoom',
    },
    {
      id: 'checkin',
      title: 'Check-In in Hotel',
      start: at(-1, 14, 0),
      end: at(-1, 18, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'dinner-0',
      title: 'Dinner',
      start: at(-1, 20, 0),
      end: at(-1, 21, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'relax',
      title: 'Relax and official arrival beer',
      start: at(-1, 0, 0),
      end: at(-1, 23, 59),
      allDay: true,
      color: 'red',
      calendarId: 'michael-johnson',
    },
    {
      id: 'breakfast-1',
      title: 'Breakfast',
      start: at(1, 9, 0),
      end: at(1, 10, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'roadmapping',
      title: 'Roadmapping for 2027',
      start: at(1, 10, 0),
      end: at(1, 12, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
    },
    {
      id: 'review-tickets',
      title: 'Review Assembla tickets and decide features to add',
      start: at(1, 12, 0),
      end: at(1, 14, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
    },
    {
      id: 'lunch-1',
      title: 'Lunch',
      start: at(1, 14, 0),
      end: at(1, 15, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'active-programming',
      title: 'Active programming',
      start: at(1, 15, 0),
      end: at(1, 19, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
    },
    {
      id: 'excursion',
      title: 'Excursion',
      start: at(2, 10, 0),
      end: at(2, 19, 0),
      color: 'red',
      calendarId: 'michael-johnson',
    },
    {
      id: 'breakfast-3',
      title: 'Breakfast',
      start: at(3, 9, 0),
      end: at(3, 10, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'gantt-review',
      title: 'Gantt review + development',
      start: at(3, 10, 0),
      end: at(3, 12, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
    },
    {
      id: 'lunch-3',
      title: 'Lunch',
      start: at(3, 14, 0),
      end: at(3, 15, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'breakfast-4',
      title: 'Breakfast',
      start: at(4, 9, 0),
      end: at(4, 10, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'root-cause',
      title: 'Root Cause ticket investigation',
      start: at(4, 10, 0),
      end: at(4, 12, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
    },
    {
      id: 'lunch-4',
      title: 'Lunch',
      start: at(4, 14, 0),
      end: at(4, 15, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'breakfast-5',
      title: 'Breakfast',
      start: at(5, 9, 0),
      end: at(5, 10, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'pair-programming',
      title: 'Pair programming',
      start: at(5, 10, 0),
      end: at(5, 12, 0),
      color: 'blue',
      calendarId: 'bryntum-team',
    },
    {
      id: 'lunch-5',
      title: 'Lunch',
      start: at(5, 14, 0),
      end: at(5, 15, 0),
      color: 'orange',
      calendarId: 'hotel-park',
    },
    {
      id: 'sprint-planning',
      title: 'Sprint Planning',
      start: at(9, 10, 0),
      end: at(9, 11, 30),
      color: 'blue',
      calendarId: 'bryntum-team',
      location: 'Room 2A',
    },
    {
      id: 'dentist',
      title: 'Dentist Appointment',
      start: at(9, 13, 0),
      end: at(9, 14, 0),
      color: 'teal',
      calendarId: 'michael-johnson',
    },
    {
      id: 'birthday',
      title: "Sam's Birthday",
      start: at(11, 0, 0),
      end: at(11, 23, 59),
      allDay: true,
      color: 'yellow',
      calendarId: 'michael-johnson',
    },
    {
      id: 'code-review',
      title: 'Code Review',
      start: at(11, 11, 0),
      end: at(11, 11, 30),
      color: 'gray',
      calendarId: 'bryntum-team',
    },
    {
      id: 'flight',
      title: 'Flight to SF',
      start: at(14, 6, 0),
      end: at(14, 9, 0),
      color: 'gray',
      calendarId: 'michael-johnson',
      location: 'SFO',
    },
    {
      id: 'offsite',
      title: 'Team Offsite',
      start: at(16, 0, 0),
      end: at(18, 23, 59),
      allDay: true,
      color: 'purple',
      calendarId: 'bryntum-team',
      location: 'Napa Valley',
    },
    {
      id: 'performance-review',
      title: 'Performance Review',
      start: at(20, 9, 30),
      end: at(20, 10, 30),
      color: 'red',
      calendarId: 'michael-johnson',
    },
    {
      id: 'vacation',
      title: 'Vacation',
      start: at(22, 0, 0),
      end: at(26, 23, 59),
      allDay: true,
      color: 'green',
      calendarId: 'michael-johnson',
    },
  ];

  for (let i = 0; i < 8; i++) {
    events.push({
      id: `filler-${i}`,
      title: `Focus Block ${i + 1}`,
      start: at(i - 3, 16, 30),
      end: at(i - 3, 17, 30),
      color: colors[i % colors.length],
      calendarId: 'bryntum-team',
    });
  }

  // Two events repeating daily at the same time for one month.
  for (let day = 0; day < 30; day++) {
    events.push({
      id: `daily-standup-${day}`,
      title: 'Daily Standup',
      start: at(day, 9, 0),
      end: at(day, 9, 15),
      color: 'blue',
      calendarId: 'bryntum-team',
    });
    events.push({
      id: `daily-yoga-${day}`,
      title: 'Yoga Break',
      start: at(day, 17, 0),
      end: at(day, 17, 30),
      color: 'teal',
      calendarId: 'michael-johnson',
    });
  }

  return events;
}
