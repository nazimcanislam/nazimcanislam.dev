import { escapeHtml, highlightJson } from "@utils/highlight-json";
import { onPageLoad, prefersReducedMotion } from "@utils/dom";

let activeTypewriteRaf: number | null = null;

function stopTypewrite(): void {
  if (activeTypewriteRaf !== null) {
    cancelAnimationFrame(activeTypewriteRaf);
    activeTypewriteRaf = null;
  }
}

function typewrite(
  el: HTMLPreElement,
  text: string,
  statusEl: HTMLElement,
  speed = 10,
): void {
  stopTypewrite();

  if (prefersReducedMotion()) {
    el.innerHTML = highlightJson(escapeHtml(text));
    statusEl.classList.add("visible");
    return;
  }

  let i = 0;
  let lastTime: number | null = null;

  const tick = (timestamp: number) => {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;

    if (elapsed >= speed) {
      lastTime = timestamp;
      i++;
      const current = escapeHtml(text.slice(0, i));

      if (i >= text.length) {
        el.innerHTML = highlightJson(current);
        statusEl.classList.add("visible");
        activeTypewriteRaf = null;
        return;
      }

      el.innerHTML = highlightJson(current) + '<span class="cursor">▊</span>';
    }

    activeTypewriteRaf = requestAnimationFrame(tick);
  };

  activeTypewriteRaf = requestAnimationFrame(tick);
}

function setupApiExplorer(): void {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".api-endpoint-btn"),
  );
  if (buttons.length === 0) return;

  const emptyState = document.getElementById("api-empty-state");
  let activeKey: string | null = null;

  // Roving tabindex: tab'lardan yalnızca biri sekme (Tab) sırasındadır (WAI-ARIA tabs).
  function focusTab(index: number): void {
    const target = (index + buttons.length) % buttons.length;
    buttons.forEach((b, i) =>
      b.setAttribute("tabindex", i === target ? "0" : "-1"),
    );
    buttons[target].focus();
  }

  buttons.forEach((btn) => {
    if (btn.dataset.apiInit === "1") return;
    btn.dataset.apiInit = "1";

    btn.addEventListener("keydown", (e) => {
      const i = buttons.indexOf(btn);
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          focusTab(i + 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          focusTab(i - 1);
          break;
        case "Home":
          e.preventDefault();
          focusTab(0);
          break;
        case "End":
          e.preventDefault();
          focusTab(buttons.length - 1);
          break;
      }
    });

    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      if (!key) return;

      buttons.forEach((b) =>
        b.setAttribute("tabindex", b === btn ? "0" : "-1"),
      );

      // Toggle off
      if (key === activeKey) {
        stopTypewrite();
        btn.setAttribute("aria-selected", "false");
        document.getElementById(`response-${key}`)?.classList.remove("active");
        if (emptyState) emptyState.style.display = "";
        activeKey = null;
        return;
      }

      // Deactivate previous
      if (activeKey) {
        document
          .querySelector<HTMLButtonElement>(`[data-key="${activeKey}"]`)
          ?.setAttribute("aria-selected", "false");
        document
          .getElementById(`response-${activeKey}`)
          ?.classList.remove("active");
      }

      // Activate new
      btn.setAttribute("aria-selected", "true");
      const responseEl = document.getElementById(`response-${key}`);
      const jsonEl = document.getElementById(
        `json-${key}`,
      ) as HTMLPreElement | null;
      const statusEl = document.getElementById(`status-${key}`);

      if (!responseEl || !jsonEl || !statusEl) return;

      if (emptyState) emptyState.style.display = "none";
      responseEl.classList.add("active");

      statusEl.classList.remove("visible");
      jsonEl.innerHTML = "";

      const raw = btn.dataset.response ?? "{}";
      const text = JSON.stringify(JSON.parse(raw), null, 2);
      typewrite(jsonEl, text, statusEl);

      activeKey = key;
    });
  });
}

export function initApiExplorer(): void {
  onPageLoad(setupApiExplorer);
}
