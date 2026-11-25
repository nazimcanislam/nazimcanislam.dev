import { emitOpenCommandPalette, onPageLoad } from "@utils/dom";

export function initFooter(): void {
  onPageLoad(() => {
    const btn = document.getElementById("system-status-btn");
    if (!btn || btn.dataset.footerInit === "1") return;
    btn.dataset.footerInit = "1";

    btn.addEventListener("click", () => {
      emitOpenCommandPalette("status");
    });
  });
}
