// calendar_backup.js

export function attachBackupControls(container, refreshCalendar) {
  const panel = document.createElement("div");
  panel.style.marginTop = "2rem";
  panel.style.textAlign = "center";
  panel.innerHTML = `
    <section class="tool-section" style="margin-top: 2rem; text-align: center;">
        <h4>🗂️ データベース操作</h4>
        <p>現在のスケジュールデータをバックアップ・復元できます。</p>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-top: 1rem;">
        <button id="downloadDbBtn" class="custom-btn" style="max-width: 220px;">📥 ダウンロード</button>
        <button id="triggerUploadBtn" class="custom-btn" style="max-width: 220px;">📤 アップロード</button>
        <input id="uploadDbInput" type="file" accept=".json" style="display: none;" />
        </div>
    </section>
    `;
  container.after(panel);

  // ✅ panel 안에서 요소 찾기 (보다 안전)
  const triggerBtn = panel.querySelector("#triggerUploadBtn");
  const uploadInput = panel.querySelector("#uploadDbInput");
  const downloadBtn = panel.querySelector("#downloadDbBtn");

  if (!triggerBtn || !uploadInput || !downloadBtn) {
    console.warn("❗️ DB 컨트롤 버튼 로딩 실패: 요소를 찾을 수 없습니다.");
    return;
  }

  triggerBtn.onclick = () => uploadInput.click();

  downloadBtn.onclick = () => {
    fetch("/api/events/download")
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "calendar_events_backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(err => alert("ダウンロードに失敗しました: " + err.message));
  };

  uploadInput.onchange = function () {
    const file = this.files[0];
    if (!file) return;
    if (!confirm("現在のデータベースを削除し、このファイルで上書きしますか？")) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/events/upload", {
      method: "POST",
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error("アップロードに失敗しました");
        return res.json();
      })
      .then(() => {
        alert("アップロードが完了しました。カレンダーを再読み込みします。");
        refreshCalendar();
      })
      .catch(err => alert("エラー: " + err.message));
  };
}
