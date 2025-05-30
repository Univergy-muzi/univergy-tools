import './calendar/calendar.js';
import './calendar/calendar_sub.js';
import './db/calendar_backup.js';
import './home/load_home.js';
import './modal/modal_loader.js';
import './preview/file-preview.js';

if ('caches' in window) {
  caches.open('my-cache').then(cache => {
    // do something
  });
} else {
  console.warn('Cache API not supported in this environment');
}