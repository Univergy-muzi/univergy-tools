export function loadToolsTemplate() {
  const main = document.querySelector("main");

  fetch("/static/fragments/tools.html")
    .then(res => res.text())
    .then(html => {
      main.innerHTML = html;
      bindXmlFolderEvent(); // ✅ 이때 관련 JS init
    })
    .catch(err => {
      main.innerHTML = `<p style="color:red;">${err.message}</p>`;
    });
}

function bindXmlFolderEvent() {
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');

  if (fileInput && fileList) {
    fileInput.addEventListener('change', function () {
      fileList.innerHTML = '';
      const files = Array.from(fileInput.files).filter(file => file.name.endsWith('.xml'));

      if (files.length === 0) {
        fileList.innerHTML = '<li>XMLファイルが選択されていません。</li>';
        return;
      }

      files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file.webkitRelativePath || file.name;
        fileList.appendChild(li);
      });
    });
  }
}
