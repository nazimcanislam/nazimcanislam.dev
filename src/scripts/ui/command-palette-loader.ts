import { onPageLoad } from "@utils/dom";

type PaletteModule = typeof import("@scripts/palette/index");

let loading: Promise<PaletteModule> | null = null;
let listenersBound = false;

function loadPalette(): Promise<PaletteModule> {
  return (loading ??= import("@scripts/palette/index"));
}

export function initCommandPaletteLoader(): void {
  if (!listenersBound) {
    listenersBound = true;

    // Kısayollar: Ctrl/Cmd+K, ` ve / (Kalıcı - Window)
    window.addEventListener("keydown", (e) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK || (!typing && (e.key === "`" || e.key === "/"))) {
        e.preventDefault();
        loadPalette().then((m) => m.toggle());
      }
    });

    // Header / footer butonlarından gelen olay (Kalıcı - Window)
    window.addEventListener("open-command-palette", (e) => {
      const cmd = (e as CustomEvent<{ runCommand?: string } | undefined>).detail
        ?.runCommand;
      loadPalette().then((m) => m.open(cmd));
    });
  }

  // Sayfa geçişlerinde tetikleyicileri önceden ısıt
  onPageLoad(() => {
    ["header-cmd-trigger", "mobile-cmd-trigger", "system-status-btn"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (!el || el.dataset.paletteWarm === "1") return;
        el.dataset.paletteWarm = "1";
        el.addEventListener("pointerenter", () => void loadPalette(), {
          once: true,
        });
        el.addEventListener("focus", () => void loadPalette(), { once: true });
      },
    );
  });
}
