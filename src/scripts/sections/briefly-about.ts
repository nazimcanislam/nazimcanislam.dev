import { copyToClipboard } from "@utils/clipboard";
import { onPageLoad } from "@utils/dom";

function setupCopyButton(): void {
  const button = document.getElementById(
    "about-copy-button",
  ) as HTMLButtonElement | null;
  if (!button || button.dataset.copyInit === "1") return;
  button.dataset.copyInit = "1";

  const label = button.querySelector<HTMLSpanElement>("#about-copy-button-text");
  const textToCopy = button.dataset.copyText ?? "";
  const defaultText = button.dataset.defaultText ?? "";
  const copiedText = button.dataset.copiedText ?? "";
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  button.addEventListener("click", async () => {
    const success = await copyToClipboard(textToCopy);
    if (!success) return;

    button.classList.add("copied");
    button.setAttribute("aria-label", copiedText);
    if (label) label.textContent = copiedText;

    if (resetTimer) clearTimeout(resetTimer);

    resetTimer = setTimeout(() => {
      button.classList.remove("copied");
      button.setAttribute("aria-label", defaultText);
      if (label) label.textContent = defaultText;
      resetTimer = null;
    }, 3000);
  });
}

export function initBrieflyAbout(): void {
  onPageLoad(setupCopyButton);
}
