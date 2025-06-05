import { loadLoginTemplate } from '../page/load_login.js';
import { loadHomeTemplate } from '../page/load_home.js';
import { loadToolsTemplate } from '../page/load_tools.js';
import { loadCalendarTemplate } from '../page/load_calendar.js';

function isLoggedIn() {
  return sessionStorage.getItem("loggedIn") === "true";
}

export function handleHashChange() {
  let hash = location.hash;

  if (!isLoggedIn()) {
    loadLoginTemplate();
    return;
  }

  if (!hash || hash === "#" || hash === "#/") {
    location.hash = "#home";
    return;
  }

  if (hash === "#calendar") {
    loadCalendarTemplate();
  } else if (hash === "#tools") {
    loadToolsTemplate();
  } else if (hash === "#home") {
    loadHomeTemplate()
    if (window.showUserInfo) {
      window.showUserInfo();
      }
    }
    else {
    location.hash = "#home";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  handleHashChange();
  window.addEventListener("hashchange", handleHashChange);
});