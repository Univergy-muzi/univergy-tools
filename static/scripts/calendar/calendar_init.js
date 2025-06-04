import { createCalendarOptions } from './calendar_events.js';

export function initCalendar(container, events) {
  return new FullCalendar.Calendar(container, createCalendarOptions(events));
}
