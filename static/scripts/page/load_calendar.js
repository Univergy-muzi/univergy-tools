import { renderCalendarPage } from '../calendar/calendar.js';

export function loadCalendarTemplate() {
  const main = document.querySelector("main");
  main.innerHTML = '<div id="calendar-container" style="margin-top: 2rem;"></div>';
  renderCalendarPage();
}