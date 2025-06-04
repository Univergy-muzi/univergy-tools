import { loadHomeTemplate } from '../page/load_home.js';
import { loadToolsTemplate } from '../page/load_tools.js';
import { loadCalendarTemplate } from '../page/load_calendar.js';

export function handleHashChange() {
  let hash = location.hash;

  if (!hash || hash === "#") {
    location.hash = "#home";
    return;
  }

  if (hash === "#calendar") {
    loadCalendarTemplate();
  } else if (hash === "#tools") {
    loadToolsTemplate();
  } else if (hash === "#home") {
    loadHomeTemplate();
  } else {
    location.hash = "#home";
  }
}

// ✅ 아래 코드가 현재 빠져 있음 → 반드시 추가해야 작동함
document.addEventListener("DOMContentLoaded", () => {
  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
});