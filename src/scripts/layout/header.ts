import { emitOpenCommandPalette, onPageLoad } from "@utils/dom";

let documentClickBound = false;

function getHeaderElements() {
  const toggle = document.getElementById("navbar-toggle");
  const menu = document.getElementById("navbar-mobile");
  return { toggle, menu };
}

function setMenuOpen(open: boolean): void {
  const { toggle, menu } = getHeaderElements();
  if (!menu || !toggle) return;
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-hidden", String(!open));
}

function bindDocumentOutsideClick(): void {
  if (documentClickBound) return;
  documentClickBound = true;

  document.addEventListener("click", (e) => {
    const { menu } = getHeaderElements();
    if (
      menu?.classList.contains("open") &&
      !document.querySelector("header.site-header")?.contains(e.target as Node)
    ) {
      setMenuOpen(false);
    }
  });
}

export function initHeader(): void {
  bindDocumentOutsideClick();

  onPageLoad(() => {
    const { toggle, menu } = getHeaderElements();

    if (toggle && toggle.dataset.headerInit !== "1") {
      toggle.dataset.headerInit = "1";
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = menu?.classList.contains("open") ?? false;
        setMenuOpen(!isOpen);
      });
    }

    menu?.querySelectorAll("a").forEach((link) => {
      if (link.dataset.headerInit === "1") return;
      link.dataset.headerInit = "1";
      link.addEventListener("click", () => setMenuOpen(false));
    });

    // Dil değiştiriciye tıklanınca seçimi hatırla; otomatik yönlendirme bunu ezmez.
    document.querySelectorAll<HTMLElement>("a.lang-switch").forEach((el) => {
      if (el.dataset.langInit === "1") return;
      el.dataset.langInit = "1";
      el.addEventListener("click", () => {
        const lang = el.getAttribute("data-set-lang");
        if (!lang) return;
        try {
          localStorage.setItem("preferred-lang", lang);
        } catch {}
      });
    });

    const headerTrigger = document.getElementById("header-cmd-trigger");
    if (headerTrigger && headerTrigger.dataset.cmdInit !== "1") {
      headerTrigger.dataset.cmdInit = "1";
      headerTrigger.addEventListener("click", () => emitOpenCommandPalette());
    }

    const mobileTrigger = document.getElementById("mobile-cmd-trigger");
    if (mobileTrigger && mobileTrigger.dataset.cmdInit !== "1") {
      mobileTrigger.dataset.cmdInit = "1";
      mobileTrigger.addEventListener("click", () => {
        setMenuOpen(false);
        emitOpenCommandPalette();
      });
    }
  });
}
