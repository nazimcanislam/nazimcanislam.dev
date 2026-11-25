/** Astro View Transitions (`astro:page-load`) için birleştirilmiş dinleyici kaydı. */
export function onPageLoad(callback: () => void): void {
  document.addEventListener("astro:page-load", callback);
}

export function getMotionMediaQuery(): MediaQueryList {
  return window.matchMedia("(prefers-reduced-motion: reduce)");
}

export function prefersReducedMotion(): boolean {
  return getMotionMediaQuery().matches;
}

export function emitOpenCommandPalette(runCommand?: string): void {
  window.dispatchEvent(
    new CustomEvent("open-command-palette", {
      detail: runCommand ? { runCommand } : undefined,
    }),
  );
}
