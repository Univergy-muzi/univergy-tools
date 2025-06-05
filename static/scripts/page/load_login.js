export function loadLoginTemplate() {
  const main = document.querySelector("main");

  fetch("/static/fragments/login.html")
    .then(res => res.text())
    .then(html => {
      main.innerHTML = html;
      bindLoginEvent();
    });
}

function bindLoginEvent() {
  const form = document.getElementById("loginForm");
  const errorText = document.getElementById("loginError");

  form.onsubmit = (e) => {
    e.preventDefault();
    const username = form.username.value;
    const password = form.password.value;

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // 세션 저장 (브라우저 종료 시 날아감)
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("user_id", data.user_id);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("division", data.division); 
        sessionStorage.setItem("first_name", data.first_name);
        sessionStorage.setItem("last_name", data.last_name);
        sessionStorage.setItem("fullname", `${data.last_name} ${data.first_name}`);

        // 유저 정보 표시 함수가 전역에 있다고 가정하고 실행
        if (window.showUserInfo) {
          window.showUserInfo();  // ✅ 로그인 직후 부서, 로그아웃 버튼 표시
        }

        // 페이지 이동
        location.hash = "#home";
      } else {
        alert("ログイン失敗：" + (data.message || ""));
      }
    });
  };
}

function logout() {
  // 세션 삭제
  sessionStorage.clear();

  // 네비게이션 영역 사용자 정보 제거
  if (window.clearUserInfo) {
    window.clearUserInfo();  // ← 여기 추가!
  }

  // main 영역 비우기
  const main = document.querySelector("main");
  if (main) main.innerHTML = "";

  // 해시를 강제 이동시켜 라우터 작동 유도
  location.hash = "#_";
  setTimeout(() => {
    location.hash = "#login";
  }, 0);
}