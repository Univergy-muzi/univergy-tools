// modal_loader.js
window.onModalTemplatesLoaded = [];

function loadModalTemplates() {
  const container = document.getElementById("modalContainer");
  if (!container) return;

  fetch("/static/fragments/event_modals.html")
    .then(res => {
      if (!res.ok) throw new Error("モーダルテンプレートの読み込みに失敗しました");
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;

      // ✅ 등록된 콜백 실행
      window.onModalTemplatesLoaded.forEach(cb => cb());
    })
    .catch(err => {
      console.error("モーダル読み込みエラー:", err.message);
    });
}

document.addEventListener("DOMContentLoaded", loadModalTemplates);
