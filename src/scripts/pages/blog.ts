import { onPageLoad } from "@utils/dom";

const PREV_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const NEXT_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

function setupBlog(): void {
  const root = document.querySelector<HTMLElement>("[data-blog-root]");
  if (!root || root.dataset.blogInit === "1") return;
  root.dataset.blogInit = "1";

  const perPage = parseInt(root.dataset.perPage ?? "10", 10);
  const tplCount = root.dataset.tplCount ?? "{n}";
  const tplPage = root.dataset.tplPage ?? "Page";

  const list = root.querySelector<HTMLUListElement>("[data-posts-list]");
  if (!list) return;
  const items = Array.from(list.querySelectorAll<HTMLLIElement>("li"));

  const searchInput = root.querySelector<HTMLInputElement>("#blog-search");
  const tagsToggle = root.querySelector<HTMLButtonElement>("[data-tags-toggle]");
  const tagsPanel = root.querySelector<HTMLElement>("#tags-panel");
  const tagBadge = root.querySelector<HTMLElement>("[data-tags-badge]");
  const tagsClear = root.querySelector<HTMLButtonElement>("[data-tags-clear]");
  const tagChips = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-tag]"),
  );
  const resultCount = root.querySelector<HTMLElement>("[data-result-count]");
  const noResults = root.querySelector<HTMLElement>("[data-no-results]");
  const pagination = root.querySelector<HTMLElement>("[data-pagination]");

  // Türkçe locale-aware küçük harf (İ/ı doğru çalışsın).
  const lower = (s: string) => s.toLocaleLowerCase("tr");

  let query = "";
  const selectedTags = new Set<string>();
  let page = 1;
  let firstRender = true;

  const meta = items.map((li) => ({
    li,
    haystack: lower(
      `${li.dataset.title ?? ""} ${li.dataset.desc ?? ""} ${(
        li.dataset.tags ?? ""
      ).replace(/\|/g, " ")}`,
    ),
    tags: (li.dataset.tags ?? "").split("|").filter(Boolean),
  }));

  function getFiltered() {
    const q = lower(query.trim());
    return meta.filter((m) => {
      const matchQ = q === "" || m.haystack.includes(q);
      const matchTags =
        selectedTags.size === 0 || m.tags.some((tg) => selectedTags.has(tg));
      return matchQ && matchTags;
    });
  }

  function renderPagination(pageCount: number): void {
    if (!pagination) return;
    pagination.innerHTML = "";

    if (pageCount <= 1) {
      pagination.classList.remove("is-visible");
      return;
    }
    pagination.classList.add("is-visible");

    const makeBtn = (
      label: string,
      opts: {
        page?: number;
        current?: boolean;
        disabled?: boolean;
        nav?: boolean;
        aria?: string;
        html?: string;
      } = {},
    ) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "page-btn" + (opts.nav ? " page-nav" : "");
      if (opts.current) {
        b.classList.add("is-current");
        b.setAttribute("aria-current", "page");
      }
      if (opts.disabled) b.disabled = true;
      if (opts.aria) b.setAttribute("aria-label", opts.aria);
      b.innerHTML = opts.html ?? label;
      if (opts.page && !opts.current && !opts.disabled) {
        b.addEventListener("click", () => goTo(opts.page as number));
      }
      return b;
    };

    pagination.appendChild(
      makeBtn("", {
        page: page - 1,
        disabled: page === 1,
        nav: true,
        aria: "prev",
        html: PREV_ICON_SVG,
      }),
    );

    const pagesToShow: (number | "…")[] = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pagesToShow.push(i);
    } else {
      pagesToShow.push(1);
      const lo = Math.max(2, page - 1);
      const hi = Math.min(pageCount - 1, page + 1);
      if (lo > 2) pagesToShow.push("…");
      for (let i = lo; i <= hi; i++) pagesToShow.push(i);
      if (hi < pageCount - 1) pagesToShow.push("…");
      pagesToShow.push(pageCount);
    }

    pagesToShow.forEach((p) => {
      if (p === "…") {
        const span = document.createElement("span");
        span.className = "page-ellipsis";
        span.textContent = "…";
        span.setAttribute("aria-hidden", "true");
        pagination.appendChild(span);
      } else {
        pagination.appendChild(
          makeBtn(String(p), {
            page: p,
            current: p === page,
            aria: `${tplPage} ${p}`,
          }),
        );
      }
    });

    pagination.appendChild(
      makeBtn("", {
        page: page + 1,
        disabled: page === pageCount,
        nav: true,
        aria: "next",
        html: NEXT_ICON_SVG,
      }),
    );
  }

  function render(): void {
    const filtered = getFiltered();
    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / perPage));
    if (page > pageCount) page = pageCount;

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const visibleSet = new Set(filtered.slice(start, end).map((m) => m.li));

    let shownIndex = 0;
    items.forEach((li) => {
      const show = visibleSet.has(li);
      li.hidden = !show;
      if (show) {
        if (!firstRender) {
          const card = li.querySelector<HTMLElement>(".post-card");
          if (card) {
            card.style.animation = "none";
            void card.offsetHeight;
            card.style.animation = "";
            card.style.animationDelay = `${shownIndex * 55}ms`;
          }
        }
        shownIndex++;
      }
    });

    if (noResults) noResults.hidden = total !== 0;
    if (resultCount) {
      resultCount.textContent =
        total === 0 ? "" : tplCount.replace("{n}", String(total));
    }

    renderPagination(pageCount);
    firstRender = false;
  }

  function goTo(p: number): void {
    page = p;
    render();
    list?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  let debounce: number | undefined;
  searchInput?.addEventListener("input", () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      query = searchInput.value;
      page = 1;
      render();
    }, 120);
  });

  tagsToggle?.addEventListener("click", () => {
    const open = tagsToggle.getAttribute("aria-expanded") === "true";
    tagsToggle.setAttribute("aria-expanded", String(!open));
    tagsPanel?.classList.toggle("is-open", !open);
  });

  function updateTagUI(): void {
    tagChips.forEach((c) =>
      c.classList.toggle("is-active", selectedTags.has(c.dataset.tag ?? "")),
    );
    if (tagBadge) {
      tagBadge.hidden = selectedTags.size === 0;
      tagBadge.textContent = String(selectedTags.size);
    }
    if (tagsClear) tagsClear.hidden = selectedTags.size === 0;
  }

  tagChips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const tag = chip.dataset.tag ?? "";
      if (selectedTags.has(tag)) selectedTags.delete(tag);
      else selectedTags.add(tag);
      chip.setAttribute("aria-pressed", String(selectedTags.has(tag)));
      page = 1;
      updateTagUI();
      render();
    }),
  );

  tagsClear?.addEventListener("click", () => {
    selectedTags.clear();
    tagChips.forEach((c) => c.setAttribute("aria-pressed", "false"));
    page = 1;
    updateTagUI();
    render();
  });

  render();
}

export function initBlog(): void {
  onPageLoad(setupBlog);
}
