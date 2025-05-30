import { loadHomeTemplate } from '../home/load_home.js';

document.addEventListener("DOMContentLoaded", () => {
  // 처음 로딩 시, 해시 기반으로 라우팅 처리
  handleHashChange();

  // 해시가 변경될 때마다 감지
  window.addEventListener("hashchange", handleHashChange);

  // 📅 버튼 클릭 시 해시 변경만
  const calendarBtn = document.getElementById("calendarBtn");
  if (calendarBtn) {
    calendarBtn.addEventListener("click", () => {
      location.hash = "#calendar";
    });
  }
});

// 👉 해시 변경 시 실행되는 함수 정의
function handleHashChange() {
  const main = document.querySelector("main");

  if (location.hash === "#calendar") {
    if (typeof renderCalendarPage === "function") {
      renderCalendarPage();
    } else {
      main.innerHTML = "<p style='color:red;'>カレンダー機能が読み込まれていません。</p>";
    }
  } else {
    loadHomeTemplate();
  }
}
