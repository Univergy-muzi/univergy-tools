import { loadHomeTemplate } from '../page/load_home.js';
import { loadToolsTemplate } from '../page/load_tools.js';
import { loadCalendarTemplate } from '../page/load_calendar.js';

export function handleHashChange() {
  const hash = location.hash;
  if (hash === "#calendar") {
    loadCalendarTemplate();
  } else if (hash === "#tools") {
    loadToolsTemplate();
  } else {
    loadHomeTemplate();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
});
