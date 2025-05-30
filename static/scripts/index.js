import './calendar/calendar.js';
import './calendar/calendar_sub.js';
import './db/calendar_backup.js';
import './modal/modal_loader.js';
import './preview/file-preview.js';

import { loadHomeTemplate } from './page/load_home.js';
import { loadToolsTemplate } from './page/load_tools.js';  // ✅ 새로 만들었을 경우

// if ('caches' in window) {
//   caches.open('my-cache').then(cache => {
//     // do something
//   });
// } else {
//   console.warn('Cache API not supported in this environment');
// }

window.addEventListener('DOMContentLoaded', () => {
  loadHomeTemplate();

  document.querySelector('.nav-button[href="#tools"]').addEventListener('click', (e) => {
    e.preventDefault();
    loadToolsTemplate();
  });

  document.getElementById('calendarBtn').addEventListener('click', (e) => {
    e.preventDefault();
    // 캘린더 관련 로딩 함수 호출
    loadCalendarTemplate(); // 직접 작성한 함수
  });
});