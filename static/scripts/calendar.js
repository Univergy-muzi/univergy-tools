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
        selectable: true,
        headerToolbar: {
          left: "prev,next",
          center: "title",
          right: "today,dayGridMonth,timeGridWeek",
        },
        events: events,

        select: function (info) {
          const startDate = info.start;
          const dateStr = info.startStr.split("T")[0];
          const hour = startDate.getHours();
          const minute = startDate.getMinutes();
          openEventPrompt(dateStr, calendar, hour, minute);
        },

        dateClick: function (info) {
          const startDate = info.start;
          const dateStr = info.startStr.split("T")[0];
          const hour = startDate.getHours();
          const minute = startDate.getMinutes();
          openEventPrompt(dateStr, calendar, hour, minute);
        },

        eventContent: function (arg) {
          if (arg.view.type === "dayGridMonth") {
            return { html: `<b>${arg.event.title}</b>` };
          } else {
            return {
              html: `<b>${arg.event.title}</b><br><i>${arg.event.extendedProps.description || ""}</i>`
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

  document.getElementById("eventModal").style.display = "block";
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
