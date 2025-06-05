export function openEventPrompt(dateStr, calendar, baseHour = 9, baseMinute = 0) {
  const pad = n => n.toString().padStart(2, '0');
  const defaultStart = `${pad(baseHour)}${pad(baseMinute)}`;
  const endHour = baseHour + Math.floor((baseMinute + 60) / 60);
  const endMin = (baseMinute + 60) % 60;
  const defaultEnd = `${pad(endHour)}${pad(endMin)}`;

  const modal = document.getElementById("eventModal");
  modal.style.display = "block";

  const dialog = modal.querySelector("dialog");
  if (dialog) dialog.scrollTop = 0;

  document.getElementById("eventTitle").value = "";
  document.getElementById("eventDate").value = dateStr;
  document.getElementById("startTime").value = defaultStart;
  document.getElementById("endTime").value = defaultEnd;
  document.getElementById("eventDesc").value = "";

  const saveBtn = document.getElementById("saveEventBtn");
  const cancelBtn = document.getElementById("cancelEventBtn");

  const closeModal = () => {
    modal.style.display = "none";
  };

  cancelBtn.onclick = () => closeModal();

  saveBtn.onclick = () => {
    const title = document.getElementById("eventTitle").value.trim();
    const date = document.getElementById("eventDate").value;
    const startT = document.getElementById("startTime").value.trim();
    const endT = document.getElementById("endTime").value.trim();
    const desc = document.getElementById("eventDesc").value.trim();
    const userFullname = sessionStorage.getItem("last_name") + " " + sessionStorage.getItem("first_name");
    const userDivision = sessionStorage.getItem("division");

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
      allDay,
      created_by: userFullname,
      created_division: userDivision
    };

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    })
      .then(res => res.json())
      .then(newEvent => {
        calendar.addEvent({ 
          ...eventData, 
          id: newEvent.id,
          displayTitle: `${eventData.created_by}：${eventData.title}` 
        });
        closeModal();
      });
  };
}
