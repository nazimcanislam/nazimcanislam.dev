import { onPageLoad } from "@utils/dom";

const CHAR_SPEED_MS = 175;
const CURSOR_TTL_MS = 2000;
const INITIAL_DELAY_MS = 1000;

function setupPageCommands(): void {
  document
    .querySelectorAll<HTMLElement>(".page-command-title")
    .forEach((root) => {
      if (root.dataset.cmdTitleInit === "1") return;
      root.dataset.cmdTitleInit = "1";

      const commandEl = root.querySelector<HTMLElement>(
        ".page-command[data-command]",
      );
      const cursorEl = root.querySelector<HTMLElement>(".typewriter-cursor");
      if (!commandEl || !cursorEl) return;

      const text = commandEl.dataset.command ?? "";
      let started = false;

      const startTyping = () => {
        if (started) return;
        started = true;

        let i = 0;
        const type = () => {
          if (i < text.length) {
            commandEl.textContent += text[i++];
            setTimeout(type, CHAR_SPEED_MS);
          } else {
            setTimeout(() => cursorEl.classList.add("hidden"), CURSOR_TTL_MS);
          }
        };
        type();
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(root);
          setTimeout(startTyping, INITIAL_DELAY_MS);
        },
        { threshold: 0.1 },
      );

      observer.observe(root);
    });
}

export function initPageCommand(): void {
  onPageLoad(setupPageCommands);
}
