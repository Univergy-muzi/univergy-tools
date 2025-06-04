import './calendar/calendar.js';
import './router/hash_router.js'; // 새로 생성된 라우터
import './db/calendar_backup.js';
import './modal/modal_loader.js';
import './preview/file-preview.js';

import { loadHomeTemplate } from './page/load_home.js';


window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.nav-button[href="/"]').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = "/";
  });

  document.querySelector('.nav-button[href="#tools"]').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = "#tools";
  });

  document.getElementById('calendarBtn').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = "#calendar";
  });
});