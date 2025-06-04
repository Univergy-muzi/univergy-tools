import './calendar/calendar.js';
import './router/hash_router.js'; // 새로 생성된 라우터
import './db/calendar_backup.js';
import './modal/modal_loader.js';
import './preview/file-preview.js';

window.addEventListener('DOMContentLoaded', () => {
  // 버튼 클릭은 해시 변경만 트리거
  document.querySelector('.nav-button[href="#tools"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '#tools';
  });

  document.getElementById('calendarBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '#calendar';
  });

  // 홈 버튼은 기본 a href="#home" 으로 충분 — 이벤트 바인딩 불필요
});