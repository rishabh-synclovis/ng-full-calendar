export type CalendarView = 'month' | 'week' | 'day' | 'agenda';
export interface CalendarNavigateEvent {
    view: CalendarView;
    date: Date;
}
