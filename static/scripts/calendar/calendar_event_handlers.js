import { openEventPrompt } from './calendar_prompt.js';
import { setupTooltipHandlers } from './calendar_tooltip.js';

export function setupEventHandlers() {
  return {
    dateClick(info) {
      const dateObj = info.date || new Date();
      const dateStr = formatDateLocal(dateObj);
      const hour = dateObj.getHours();
      const minute = dateObj.getMinutes();
      openEventPrompt(dateStr, info.view.calendar, hour, minute);
    },

    eventClick(info) {
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
        const rawTitle = event.extendedProps?.title || event.title;

        document.getElementById("eventModal").style.display = "block";
        document.getElementById("eventTitle").value = rawTitle;
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
          const createdBy = sessionStorage.getItem("fullname");
          const division = sessionStorage.getItem("division");

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

          const updatedEvent = {
            title,
            description: desc,
            start: newStart,
            end: newEnd,
            allDay,
            created_by: createdBy,
            created_division: division
          };

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
            .then(res => res.json())
            .then(newEvent => {
              event.remove();
              info.view.calendar.addEvent({ ...updatedEvent, id: newEvent.id });
              closeModal();
            })
            .catch(err => {
              alert("更新中にエラーが発生しました: " + err.message);
            });
        };
      };
    },

    eventDidMount(info) {
      setupTooltipHandlers(info);
    },
    eventContent(arg) {
        const event = arg.event;
        const isAllDay = event.allDay;
        const className = isAllDay ? 'fc-event-allday' : 'fc-event-timed';
        const isDayGrid = arg.view.type === 'dayGridMonth';

        const container = document.createElement('div');
        container.className = className;
        container.style.height = '100%';
        container.style.boxSizing = 'border-box';
        if (isDayGrid) container.style.width = '100%';

        const contentSpan = document.createElement('span');
        contentSpan.className = 'event-title-wrapper';
        contentSpan.textContent = event.extendedProps.displayTitle || event.title;

        container.appendChild(contentSpan);

        return { domNodes: [container] };
        }
  };
}

function formatDateLocal(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
