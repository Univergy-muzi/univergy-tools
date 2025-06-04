import { initCalendar } from './calendar_init.js';
import { fetchEvents } from './calendar_events.js';
import { attachBackupControls } from '../db/calendar_backup.js';

export function renderCalendarPage() {
  const main = document.querySelector("main");
  main.innerHTML = '<div id="calendar-container" style="margin-top: 2rem;"></div>';
  const calendarEl = document.getElementById("calendar-container");

  fetchEvents().then(events => {
    const calendar = initCalendar(calendarEl, events);
    calendar.render();
    attachBackupControls(calendarEl, renderCalendarPage);
  });
}
