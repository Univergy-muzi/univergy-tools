export function setupTooltipHandlers(info) {
  let tooltip;

  const createTooltip = (x, y) => {
    document.querySelectorAll('.fc-event-custom-tooltip').forEach(el => el.remove());

    tooltip = document.createElement('div');
    tooltip.className = 'fc-event-custom-tooltip';

    const createdBy = info.event.extendedProps.created_by || info.event.created_by || '(作成者不明)';
    const rawTitle = info.event.extendedProps.title || info.event.title || '(題名なし)';
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
      <div><strong>作成者: ${createdBy}</strong></div>
      <div><strong>${rawTitle}</strong></div>
      <div class="tooltip-time">
        ${
          start.getHours() === 0 && start.getMinutes() === 0 && !end
            ? `${start.toLocaleDateString()} 終日`
            : `${start.toLocaleDateString()} ${formatTime(start)}${end ? ` ～ ${formatTime(end)}` : ''}`
        }
      </div>
      <p>${desc}</p>
    `;

    document.body.appendChild(tooltip);

    requestAnimationFrame(() => {
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      const isMobile = window.innerWidth <= 550;
      const verticalOffset = isMobile ? 36 : 12;
      const left = x - tooltipWidth / 2;
      const top = y - tooltipHeight - verticalOffset;

      tooltip.style.left = `${Math.max(left, 10)}px`;
      tooltip.style.top = `${Math.max(top, 10)}px`;
      tooltip.classList.add('visible');
    });
  };

  const hideTooltip = () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  };

  let pressTimer;

  info.el.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      const touch = e.touches[0];
      createTooltip(touch.pageX, touch.pageY);
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

  info.el.addEventListener('mouseenter', (e) => {
    if (window.innerWidth > 550) {
      createTooltip(e.pageX, e.pageY);
    }
  });

  info.el.addEventListener('mouseleave', hideTooltip);
}
