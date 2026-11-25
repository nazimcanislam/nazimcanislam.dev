import { onPageLoad } from "@utils/dom";

const VIEWPORT_MARGIN = 8;

function clampTooltip(wrapper: HTMLElement): void {
  const bubble = wrapper.querySelector<HTMLElement>(".tooltip-bubble");
  if (!bubble) return;

  wrapper.style.setProperty("--_offset-x", "0px");
  wrapper.style.setProperty("--_offset-y", "0px");

  void bubble.offsetWidth;

  const rect = bubble.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let dx = 0;
  let dy = 0;

  if (rect.left < VIEWPORT_MARGIN) {
    dx = VIEWPORT_MARGIN - rect.left;
  } else if (rect.right > vw - VIEWPORT_MARGIN) {
    dx = vw - VIEWPORT_MARGIN - rect.right;
  }

  if (rect.top < VIEWPORT_MARGIN) {
    dy = VIEWPORT_MARGIN - rect.top;
  } else if (rect.bottom > vh - VIEWPORT_MARGIN) {
    dy = vh - VIEWPORT_MARGIN - rect.bottom;
  }

  wrapper.style.setProperty("--_offset-x", `${dx}px`);
  wrapper.style.setProperty("--_offset-y", `${dy}px`);
}

function setupTooltips(): void {
  document.querySelectorAll<HTMLElement>(".tooltip-wrapper").forEach((wrapper) => {
    if (wrapper.dataset.tooltipInit === "1") return;
    wrapper.dataset.tooltipInit = "1";

    const recalc = () => clampTooltip(wrapper);
    wrapper.addEventListener("mouseenter", recalc);
    wrapper.addEventListener("focusin", recalc);
  });
}

export function initTooltips(): void {
  onPageLoad(setupTooltips);
}
