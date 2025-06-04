import { setupEventHandlers } from './calendar_event_handlers.js';

/**
 * 서버에서 이벤트 데이터를 fetch 해오는 함수
 * @returns {Promise<Array>} 이벤트 객체 배열
 */
export function fetchEvents() {
  return fetch("/api/events")
    .then(res => {
      if (!res.ok) {
        throw new Error("イベントデータの取得に失敗しました。");
      }
      return res.json();
    });
}

/**
 * FullCalendar의 초기 설정을 생성
 * @param {Array} events - 서버로부터 받아온 이벤트 배열
 * @returns {Object} FullCalendar 설정 객체
 */
export function createCalendarOptions(events) {
  return {
    initialView: "dayGridMonth",
    locale: "ja",
    timeZone: "local",
    height: null,
    contentHeight: 'auto',
    expandRows: false,
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
        slotMinTime: '08:00:00',
        slotMaxTime: '21:00:00',
      },
    },
    ...setupEventHandlers()
  };
}
