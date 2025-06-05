import './calendar/calendar.js';
import './router/hash_router.js'; // 새로 생성된 라우터
import './db/calendar_backup.js';
import './modal/modal_loader.js';
import './preview/file-preview.js';

function showUserInfo() {
  const division = sessionStorage.getItem("division");
  const first = sessionStorage.getItem("first_name") || "";
  const last = sessionStorage.getItem("last_name") || "";
  const fullName = `${last} ${first}`.trim();
  
  const divisionLabel = document.getElementById("userDivision");
  const logoutBtn = document.getElementById("logoutBtn");

  if (divisionLabel) {
    divisionLabel.textContent = `${division}ㅤ${fullName}`;
  }

  if (logoutBtn) {
    logoutBtn.style.display = "inline-block";
    logoutBtn.onclick = () => {
      sessionStorage.clear();
      if (window.clearUserInfo) window.clearUserInfo(); // ✨ 여기
      location.hash = "#login";
    };
  }
}

function clearUserInfo() {
  const divisionLabel = document.getElementById("userDivision");
  const logoutBtn = document.getElementById("logoutBtn");

  if (divisionLabel) divisionLabel.textContent = "";
  if (logoutBtn) logoutBtn.style.display = "none";
}


window.showUserInfo = showUserInfo; // 👈 전역 등록
window.clearUserInfo = clearUserInfo;

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

  // 로그인 상태면 UI 초기화
  if (sessionStorage.getItem("loggedIn") === "true") {
    showUserInfo();
  }
  // 홈 버튼은 기본 a href="#home" 으로 충분 — 이벤트 바인딩 불필요
});