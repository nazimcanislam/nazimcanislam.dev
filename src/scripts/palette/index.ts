// Komut paleti: ilk kullanımda (Ctrl+K, `, /, header/footer butonu) dinamik
// import ile yüklenir. Modal DOM'u burada kurulur; veri CommandPalette.astro'nun
// bastığı <script type="application/json" id="cmd-data"> içinden okunur.
import paletteCss from "@styles/components/command-palette.css?inline";
import { escapeHtml } from "@utils/html";
import { ICONS } from "@scripts/palette/icons";
import { stopMatrix } from "@scripts/palette/matrix-rain";
import { executeCommand, resetCommandState } from "@scripts/palette/commands";

interface CmdItem {
  cmd: string;
  label: string;
  icon: string;
  href?: string;
  external?: boolean;
  danger?: boolean;
}

interface CmdData {
  ui: {
    title: string;
    placeholder: string;
    groupNav: string;
    groupCmd: string;
    groupSocial: string;
    noResults: string;
  };
  nav: CmdItem[];
  cmd: CmdItem[];
  social: CmdItem[];
}

let backdrop: HTMLElement;
let input: HTMLInputElement;
let output: HTMLElement;
let list: HTMLElement;
let emptyMsg: HTMLElement;
let statusText: HTMLElement;
let matrixCanvas: HTMLCanvasElement;

let built = false;
let isOpen = false;
let selectedIndex = 0;

function ensureStyles(): void {
  if (document.getElementById("cmd-palette-css")) return;
  const style = document.createElement("style");
  style.id = "cmd-palette-css";
  style.textContent = paletteCss;
  document.head.appendChild(style);
}

function icon(name: string, cls: string): string {
  return `<svg class="${cls}" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;
}

function itemHtml(item: CmdItem, group: string, badge: string): string {
  const attrs = [
    `class="cmd-item${item.danger ? " danger" : ""}"`,
    `role="option"`,
    `data-cmd="${escapeHtml(item.cmd)}"`,
    `data-label="${escapeHtml(item.label)}"`,
    `data-group="${group}"`,
    `tabindex="-1"`,
  ];
  if (item.href) attrs.push(`data-href="${escapeHtml(item.href)}"`);
  if (group === "social") {
    attrs.push(`data-external="${item.external ? "true" : "false"}"`);
  }
  return (
    `<div ${attrs.join(" ")}>` +
    `<div class="cmd-item-left">${icon(item.icon, "cmd-item-icon")}` +
    `<span class="cmd-item-name">${escapeHtml(item.cmd)}</span>` +
    `<span class="cmd-item-label">${escapeHtml(item.label)}</span></div>` +
    `<span class="cmd-item-badge">${badge}</span></div>`
  );
}

function groupHtml(group: string, label: string, items: string): string {
  return `<div class="cmd-group" data-group="${group}"><div class="cmd-group-label">${escapeHtml(label)}</div>${items}</div>`;
}

function appendOutput(html: string): void {
  output.classList.add("has-content");
  output.innerHTML += html + "\n";
  output.scrollTop = output.scrollHeight;
}

function clearOutput(): void {
  output.innerHTML = "";
  output.classList.remove("has-content");
}

function runCommand(rawCmd: string): void {
  input.value = "";
  filterCommands("");
  executeCommand(rawCmd, {
    appendOutput,
    clearOutput,
    setStatus: (text) => {
      statusText.textContent = text;
    },
    matrixCanvas,
  });
}

function build(): void {
  ensureStyles();
  const raw = document.getElementById("cmd-data")?.textContent;
  if (!raw) throw new Error("cmd-data bulunamadı");
  const d: CmdData = JSON.parse(raw);
  const u = d.ui;

  const nav = d.nav.map((i) => itemHtml(i, "nav", "page")).join("");
  const cmd = d.cmd
    .map((i) => itemHtml(i, "cmd", i.danger ? "danger" : "run"))
    .join("");
  const social = d.social
    .map((i) => itemHtml(i, "social", i.external ? "external ↗" : "link"))
    .join("");

  const wrap = document.createElement("div");
  wrap.innerHTML =
    `<canvas id="matrix-canvas" aria-hidden="true"></canvas>` +
    `<div class="cmd-backdrop" id="cmd-palette-backdrop" role="dialog" aria-modal="true" aria-label="${escapeHtml(u.title)}">` +
    `<div class="cmd-modal" id="cmd-palette-modal">` +
    `<div class="cmd-titlebar">` +
    `<div class="cmd-traffic-lights">` +
    `<span class="cmd-dot cmd-dot-red" id="cmd-close-btn" title="Close"></span>` +
    `<span class="cmd-dot cmd-dot-yellow" title="Minimize"></span>` +
    `<span class="cmd-dot cmd-dot-green" title="Maximize"></span></div>` +
    `<div class="cmd-title">${icon("mdi:console", "cmd-title-icon")}<span>${escapeHtml(u.title)}</span></div>` +
    `<span class="cmd-close-hint">ESC</span></div>` +
    `<div class="cmd-input-wrap">` +
    `<span class="cmd-prompt"><span>~/portfolio</span><span class="cmd-prompt-sep">❯</span></span>` +
    `<input type="search" id="cmd-palette-input" class="cmd-input" placeholder="${escapeHtml(u.placeholder)}" autocomplete="off" spellcheck="false" aria-autocomplete="list" aria-controls="cmd-palette-list" /></div>` +
    `<div class="cmd-output" id="cmd-palette-output" role="log" aria-live="polite"></div>` +
    `<div class="cmd-results" id="cmd-palette-list" role="listbox">` +
    groupHtml("nav", u.groupNav, nav) +
    groupHtml("cmd", u.groupCmd, cmd) +
    groupHtml("social", u.groupSocial, social) +
    `<div class="cmd-empty" id="cmd-empty-msg" hidden>${escapeHtml(u.noResults)}</div></div>` +
    `<div class="cmd-footer"><div class="cmd-shortcuts">` +
    `<span class="cmd-shortcut-key"><kbd>↑</kbd><kbd>↓</kbd> navigate</span>` +
    `<span class="cmd-shortcut-key"><kbd>↵</kbd> select / run</span>` +
    `<span class="cmd-shortcut-key"><kbd>ESC</kbd> close</span></div>` +
    `<span id="cmd-footer-status">● Ready</span></div></div></div>`;
  document.body.append(...Array.from(wrap.childNodes));

  const $ = <T extends HTMLElement>(id: string) =>
    document.getElementById(id) as T;
  backdrop = $("cmd-palette-backdrop");
  input = $<HTMLInputElement>("cmd-palette-input");
  output = $("cmd-palette-output");
  list = $("cmd-palette-list");
  emptyMsg = $("cmd-empty-msg");
  statusText = $("cmd-footer-status");
  matrixCanvas = $<HTMLCanvasElement>("matrix-canvas");

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  $("cmd-close-btn").addEventListener("click", close);
  input.addEventListener("input", () => filterCommands(input.value));
  input.addEventListener("keydown", onInputKeydown);
  list.addEventListener("click", (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>(".cmd-item");
    if (item) handleItemAction(item);
  });

  built = true;
}

function getVisibleItems(): HTMLElement[] {
  return Array.from(
    list.querySelectorAll<HTMLElement>(".cmd-item:not([hidden])"),
  );
}

function updateSelection(items: HTMLElement[], index: number): void {
  items.forEach((item, i) => {
    const sel = i === index;
    item.classList.toggle("is-selected", sel);
    item.setAttribute("aria-selected", String(sel));
    if (sel) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  selectedIndex = index;
}

function filterCommands(query: string): void {
  const q = query.trim().toLowerCase();
  let matchCount = 0;
  list.querySelectorAll<HTMLElement>(".cmd-item").forEach((item) => {
    const cmd = item.dataset.cmd?.toLowerCase() ?? "";
    const label = item.dataset.label?.toLowerCase() ?? "";
    const matches = q === "" || cmd.includes(q) || label.includes(q);
    item.hidden = !matches;
    if (matches) matchCount++;
  });
  list.querySelectorAll<HTMLElement>(".cmd-group").forEach((group) => {
    group.hidden =
      group.querySelectorAll(".cmd-item:not([hidden])").length === 0;
  });
  emptyMsg.hidden = matchCount > 0;
  updateSelection(getVisibleItems(), 0);
}

function onInputKeydown(e: KeyboardEvent): void {
  const visible = getVisibleItems();
  if (e.key === "ArrowDown") {
    e.preventDefault();
    updateSelection(visible, (selectedIndex + 1) % (visible.length || 1));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    updateSelection(
      visible,
      (selectedIndex - 1 + visible.length) % (visible.length || 1),
    );
  } else if (e.key === "Enter") {
    e.preventDefault();
    const typed = input.value.trim();
    if (typed) runCommand(typed);
    else if (visible[selectedIndex]) handleItemAction(visible[selectedIndex]);
  }
}

function handleItemAction(item: HTMLElement): void {
  const { cmd, href } = item.dataset;
  if (href) {
    if (item.dataset.external === "true") {
      window.open(href, "_blank", "noopener,noreferrer");
      close();
    } else {
      window.location.href = href;
    }
    return;
  }
  if (cmd) runCommand(cmd);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) close();
});

document.addEventListener("astro:after-swap", () => {
  stopMatrix(matrixCanvas);
  resetCommandState();
  built = false;
  isOpen = false;
  document.documentElement.style.overflow = "";
});

export function open(initialCommand?: string): void {
  if (!built || !backdrop?.isConnected) {
    built = false;
    isOpen = false;
    build();
  }
  if (isOpen) {
    if (initialCommand) runCommand(initialCommand);
    return;
  }
  isOpen = true;
  backdrop.classList.add("is-open");
  document.documentElement.style.overflow = "hidden";
  input.value = "";
  filterCommands("");
  if (initialCommand) runCommand(initialCommand);
}

export function close(): void {
  if (!isOpen) return;
  isOpen = false;
  backdrop.classList.remove("is-open");
  document.documentElement.style.overflow = "";
  stopMatrix(matrixCanvas);
}

export function toggle(): void {
  if (isOpen) close();
  else open();
}
