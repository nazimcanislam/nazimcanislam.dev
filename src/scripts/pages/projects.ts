import { onPageLoad, prefersReducedMotion } from "@utils/dom";

function setupLanguageFilter(): void {
  const root = document.querySelector<HTMLElement>("[data-lang-filter-root]");
  const grid = document.querySelector<HTMLUListElement>(
    "[data-repo-filter-grid]",
  );
  if (!root || !grid || grid.dataset.filterInit === "1") return;
  grid.dataset.filterInit = "1";

  const items = Array.from(grid.querySelectorAll<HTMLLIElement>("li"));
  const chips = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-lang-filter]"),
  );
  const segments = Array.from(
    root.querySelectorAll<HTMLElement>(".lang-bar-segment"),
  );
  const statusEl = root.querySelector<HTMLElement>("#filter-status");
  const emptyEl = document.querySelector<HTMLElement>("[data-filter-empty]");

  const projectsWord = root.dataset.labelProjects ?? "projects";
  const allLabel = root.dataset.labelAll ?? "All";
  const reduceMotion = prefersReducedMotion();

  let active = "*";

  const matches = (li: HTMLLIElement, lang: string): boolean => {
    if (lang === "*") return true;
    const langs = (li.dataset.languages ?? "").split("|").filter(Boolean);
    return langs.includes(lang);
  };

  function setActiveUI(lang: string): void {
    chips.forEach((c) => {
      const on = c.dataset.langFilter === lang;
      c.setAttribute("aria-pressed", String(on));
      c.classList.toggle("is-active", on);
    });
    segments.forEach((seg) => {
      const on = lang === "*" || seg.dataset.lang === lang;
      seg.classList.toggle("is-dimmed", !on);
    });
  }

  function announce(count: number, lang: string): void {
    if (!statusEl) return;
    statusEl.textContent =
      lang === "*"
        ? `${allLabel} · ${count} ${projectsWord}`
        : `${lang} · ${count} ${projectsWord}`;
  }

  function applyFilter(lang: string): void {
    const next = lang !== "*" && lang === active ? "*" : lang;
    active = next;
    setActiveUI(next);

    // FLIP — 1) Eski konumları ölç.
    const firstRects = new Map<HTMLLIElement, DOMRect>();
    items.forEach((li) => {
      if (!li.hidden) firstRects.set(li, li.getBoundingClientRect());
    });

    // 2) Görünürlüğü uygula.
    let visible = 0;
    items.forEach((li) => {
      const show = matches(li, next);
      li.hidden = !show;
      if (show) visible++;
    });

    if (emptyEl) emptyEl.hidden = visible !== 0;
    announce(visible, next);

    if (reduceMotion) return;

    // 3) Yeni konumları ölç, invert uygula.
    items.forEach((li) => {
      if (li.hidden) return;
      const first = firstRects.get(li);
      const last = li.getBoundingClientRect();
      if (first) {
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (dx || dy) {
          li.style.transition = "none";
          li.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      } else {
        li.style.transition = "none";
        li.style.transform = "scale(0.94)";
        li.style.opacity = "0";
      }
    });

    void grid!.offsetHeight;

    requestAnimationFrame(() => {
      items.forEach((li) => {
        if (li.hidden) return;
        li.style.transition =
          "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease";
        li.style.transform = "";
        li.style.opacity = "";
      });
    });
  }

  grid.addEventListener("transitionend", (e) => {
    const li = e.target as HTMLElement;
    if (li.tagName === "LI") {
      li.style.transition = "";
      li.style.transform = "";
      li.style.opacity = "";
    }
  });

  chips.forEach((chip) =>
    chip.addEventListener("click", () =>
      applyFilter(chip.dataset.langFilter ?? "*"),
    ),
  );
  segments.forEach((seg) =>
    seg.addEventListener("click", () => applyFilter(seg.dataset.lang ?? "*")),
  );
}

export function initLanguageFilter(): void {
  onPageLoad(setupLanguageFilter);
}
