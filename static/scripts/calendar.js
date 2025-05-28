// calendar.js
import { attachBackupControls } from "./calendar_backup.js";

// ------------------ 1. 분리된 렌더링 함수 ------------------
function renderCalendarPage() {
  const main = document.querySelector("main");
  main.innerHTML = '<div id="calendar-container" style="margin-top: 2rem;"></div>';
  const calendarEl = document.getElementById("calendar-container");

  fetch("/api/events")
    .then((res) => res.json())
    .then((events) => {
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "ja",
        timeZone: "local",
        height: "auto",  
        expandRows: false,     // 또는 height: "auto"
        eventLongPressDelay: 0,
        selectLongPressDelay: 0,
        headerToolbar: {
          left: "prev,next",
          center: "title",
          right: "today,dayGridMonth,timeGridWeek",
        },
        events: events,
        views: {
          timeGridWeek: {
            slotMinTime: '08:00:00',  // 시작 시각
            slotMaxTime: '21:00:00',  // 끝 시각(표시 제외)
          },
        },

        dateClick: function (info) {
          const dateObj = info.date || new Date();
          const dateStr = formatDateLocal(dateObj); // ✅ 현지 기준 날짜
          const hour = dateObj.getHours();
          const minute = dateObj.getMinutes();
          openEventPrompt(dateStr, calendar, hour, minute);
        },

        eventContent: function (arg) {
          if (arg.view.type === "dayGridMonth") {
            return { html: `<b>${arg.event.title}</b>` };
          } else {
            return {
              html: `<b>${arg.event.title}</b>`
            };
          }
        },

        eventClick: function (info) {
          const event = info.event;
          const modal = document.getElementById("eventDetailModal");

          document.getElementById("detailTitle").innerText = event.title;
          document.getElementById("detailDate").innerText = event.startStr.split("T")[0];
          document.getElementById("detailTime").innerText = event.allDay
            ? "終日"
            : `${event.startStr.slice(11, 16)} ～ ${event.endStr?.slice(11, 16) || ""}`;
          document.getElementById("detailDescription").innerText = event.extendedProps.description || "(なし)";

          modal.style.display = "block";

          document.getElementById("closeDetailBtn").onclick = () => {
            modal.style.display = "none";
          };

          document.getElementById("deleteEventBtn").onclick = () => {
            if (confirm(`「${event.title}」を削除しますか？`)) {
              fetch("/api/events", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: event.id }),
              }).then(() => {
                event.remove();
                modal.style.display = "none";
              });
            }
          };

          document.getElementById("editEventBtn").onclick = () => {
            modal.style.display = "none";

            const startDate = event.startStr.split("T")[0];
            const startTime = event.startStr.includes("T") ? event.startStr.slice(11, 16).replace(":", "") : "";
            const endTime = event.endStr?.includes("T") ? event.endStr.slice(11, 16).replace(":", "") : "";

            document.getElementById("eventModal").style.display = "block";
            document.getElementById("eventTitle").value = event.title;
            document.getElementById("eventDate").value = startDate;
            document.getElementById("startTime").value = startTime;
            document.getElementById("endTime").value = endTime;
            document.getElementById("eventDesc").value = event.extendedProps.description || "";

            const saveBtn = document.getElementById("saveEventBtn");
            const cancelBtn = document.getElementById("cancelEventBtn");

            const closeModal = () => {
              document.getElementById("eventModal").style.display = "none";
            };

            cancelBtn.onclick = () => closeModal();

            saveBtn.onclick = () => {
              const title = document.getElementById("eventTitle").value.trim();
              const date = document.getElementById("eventDate").value;
              const startT = document.getElementById("startTime").value.trim();
              const endT = document.getElementById("endTime").value.trim();
              const desc = document.getElementById("eventDesc").value.trim();

              if (!title) {
                alert("タイトルを入力してください。");
                return;
              }

              const timeFormat = /^([01]\d|2[0-3])[0-5]\d$/;
              const format = (t) => `${t.slice(0, 2)}:${t.slice(2)}`;
              let newStart, newEnd, allDay;

              if (!startT || !endT) {
                newStart = date;
                newEnd = null;
                allDay = true;
              } else {
                if (!timeFormat.test(startT) || !timeFormat.test(endT)) {
                  alert("時間を正確に入れてください（例: 0900）");
                  return;
                }
                newStart = `${date}T${format(startT)}:00`;
                newEnd = `${date}T${format(endT)}:00`;
                allDay = false;
              }

              const isSame =
                event.title === title &&
                (event.extendedProps.description || "") === desc &&
                event.startStr === newStart &&
                (event.endStr || null) === newEnd;

              if (isSame) {
                alert("内容に変更がありません。");
                closeModal();
                return;
              }

              const updatedEvent = { title, description: desc, start: newStart, end: newEnd, allDay };

              fetch("/api/events", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: event.id }),
              })
                .then(() =>
                  fetch("/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedEvent),
                  })
                )
                .then((res) => res.json())
                .then((newEvent) => {
                  event.remove();
                  calendar.addEvent({ ...updatedEvent, id: newEvent.id });
                  closeModal();
                })
                .catch((err) => {
                  alert("更新中にエラーが発生しました: " + err.message);
                });
            };
          };
        },
        eventDidMount: function (info) {
          const tooltip = document.createElement('div');
          tooltip.className = 'fc-event-custom-tooltip';

          const title = info.event.title || '(제목 없음)';
          const desc = info.event.extendedProps.description || '(詳細内容なし)';
          const start = info.event.start;
          const end = info.event.end;

          const formatTime = (d) => {
            if (!d) return "";
            const h = d.getHours().toString().padStart(2, "0");
            const m = d.getMinutes().toString().padStart(2, "0");
            return `${h}:${m}`;
          };

          tooltip.innerHTML = `
            <h4>${title}</h4>
            <div class="tooltip-time">${start.toLocaleDateString()} ${formatTime(start)} ${end ? `～ ${formatTime(end)}` : ''}</div>
            <p>${desc}</p>
          `;

          document.body.appendChild(tooltip);

          const hideTooltip = () => {
            tooltip.style.opacity = '0';
          };

          const showTooltip = (e) => {
            tooltip.style.display = 'block';
            tooltip.style.opacity = '0';
            tooltip.style.top = '-9999px';
            tooltip.style.left = '-9999px';

            requestAnimationFrame(() => {
              let top, left;

              if (window.innerWidth <= 480) {
                // ✅ 모바일: 스크롤 포함하여 상단 중앙 위치
                top = window.scrollY -20;
                left = (window.innerWidth - tooltip.offsetWidth) / 2;
              } else {
                // ✅ 데스크탑: 마우스 기준
                const tooltipOffsetX = 10;
                const tooltipOffsetY = 12;
                top = e.pageY - tooltip.offsetHeight - tooltipOffsetY;
                left = e.pageX + tooltipOffsetX;
              }

              tooltip.style.top = `${Math.max(top, 10)}px`;
              tooltip.style.left = `${Math.max(left, 10)}px`;
              tooltip.style.opacity = '1';
            });
          };

          let pressTimer;

          // 모바일 long press (500ms)
          info.el.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
              showTooltip(e.touches[0]);
            }, 500);
          });

          info.el.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
            hideTooltip();
          });

          info.el.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
            hideTooltip();
          });

          // PC hover 유지
          info.el.addEventListener('mouseenter', (e) => {
            if (window.innerWidth > 480) showTooltip(e);
          });

          info.el.addEventListener('mouseleave', hideTooltip);
        },
      });

      calendar.render();
      attachBackupControls(calendarEl, () => renderCalendarPage());
    });
}

window.renderCalendarPage = renderCalendarPage;
// ------------------ 프롬프트 오픈 추가 ------------------

function openEventPrompt(dateStr, calendar, baseHour = 9, baseMinute = 0) {
  const pad = n => n.toString().padStart(2, '0');
  const defaultStart = `${pad(baseHour)}${pad(baseMinute)}`;
  const endHour = baseHour + Math.floor((baseMinute + 60) / 60);
  const endMin = (baseMinute + 60) % 60;
  const defaultEnd = `${pad(endHour)}${pad(endMin)}`;

  const modal = document.getElementById("eventModal");
  modal.style.display = "block";

  // ✅ 모달 열릴 때 스크롤 맨 위로 초기화
  const dialog = modal.querySelector("dialog");
  if (dialog) {
    dialog.scrollTop = 0;
  }

  document.getElementById("eventTitle").value = "";
  document.getElementById("eventDate").value = dateStr;
  document.getElementById("startTime").value = defaultStart;
  document.getElementById("endTime").value = defaultEnd;
  document.getElementById("eventDesc").value = "";

  const saveBtn = document.getElementById("saveEventBtn");
  const cancelBtn = document.getElementById("cancelEventBtn");

  const closeModal = () => {
    document.getElementById("eventModal").style.display = "none";
  };

  cancelBtn.onclick = () => closeModal();

  saveBtn.onclick = () => {
    const title = document.getElementById("eventTitle").value.trim();
    const date = document.getElementById("eventDate").value;
    const startT = document.getElementById("startTime").value.trim();
    const endT = document.getElementById("endTime").value.trim();
    const desc = document.getElementById("eventDesc").value.trim();

    if (!title) {
      alert("タイトルを入力してください。");
      return;
    }

    const timeFormat = /^([01]\d|2[0-3])[0-5]\d$/;
    const format = t => `${t.slice(0, 2)}:${t.slice(2)}`;
    let newStart, newEnd, allDay;

    if (!startT || !endT) {
      newStart = date;
      newEnd = null;
      allDay = true;
    } else {
      if (!timeFormat.test(startT) || !timeFormat.test(endT)) {
        alert("時間を正確に入れてください（例: 0900）");
        return;
      }
      newStart = `${date}T${format(startT)}:00`;
      newEnd = `${date}T${format(endT)}:00`;
      allDay = false;
    }

    const eventData = {
      title,
      description: desc,
      start: newStart,
      end: newEnd,
      allDay
    };

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    }).then(res => res.json())
      .then(newEvent => {
        calendar.addEvent({ ...eventData, id: newEvent.id });
        closeModal();
      });
  };
}

function formatDateLocal(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 0-indexed
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ------------------ 2. 최초 DOM 로드 ------------------
document.addEventListener("DOMContentLoaded", function () {
  const calendarBtn = document.getElementById("calendarBtn");
  if (calendarBtn) {
    calendarBtn.addEventListener("click", () => {
      location.hash = "#calendar";
      renderCalendarPage();
    });
  }

  if (location.hash === "#calendar") {
    renderCalendarPage();
  }
});
