export function loadHomeTemplate() {
  const main = document.querySelector("main");

  fetch("/static/fragments/home.html")
    .then(res => {
      if (!res.ok) throw new Error("ホームテンプレートの読み込みに失敗しました");
      return res.text();
    })
    .then(html => {
      main.innerHTML = html;
    })
    .catch(err => {
      main.innerHTML = `<p style="color:red;">${err.message}</p>`;
    });
}
