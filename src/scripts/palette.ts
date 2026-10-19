// Komut paleti: ilk kullanımda (Ctrl+K, `, /, header/footer butonu) dinamik
// import ile yüklenir. Modal DOM'u burada kurulur; veri CommandPalette.astro'nun
// bastığı <script type="application/json" id="cmd-data"> içinden okunur.
import "@/styles/command-palette.css";
import { profile, getAge } from "@/data/profile";
import { escapeHtml } from "@/utils/highlight-json";
import { ICONS } from "./palette-icons";

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
let matrixAnimationId: number | null = null;
let matrixStopTimer: ReturnType<typeof setTimeout> | null = null;
let isDeletingSystem = false;

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
  if (group === "social") attrs.push(`data-external="${item.external ? "true" : "false"}"`);
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

function build(): void {
  const raw = document.getElementById("cmd-data")?.textContent;
  if (!raw) throw new Error("cmd-data bulunamadı");
  const d: CmdData = JSON.parse(raw);
  const u = d.ui;

  const nav = d.nav.map((i) => itemHtml(i, "nav", "page")).join("");
  const cmd = d.cmd.map((i) => itemHtml(i, "cmd", i.danger ? "danger" : "run")).join("");
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
    `<input type="text" id="cmd-palette-input" class="cmd-input" placeholder="${escapeHtml(u.placeholder)}" autocomplete="off" spellcheck="false" aria-autocomplete="list" aria-controls="cmd-palette-list" /></div>` +
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

  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
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
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });
  input.addEventListener("input", () => filterCommands(input.value));
  input.addEventListener("keydown", onInputKeydown);
  list.addEventListener("click", (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>(".cmd-item");
    if (item) handleItemAction(item);
  });

  built = true;
}

function getVisibleItems(): HTMLElement[] {
  return Array.from(list.querySelectorAll<HTMLElement>(".cmd-item:not([hidden])"));
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
    group.hidden = group.querySelectorAll(".cmd-item:not([hidden])").length === 0;
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
    updateSelection(visible, (selectedIndex - 1 + visible.length) % (visible.length || 1));
  } else if (e.key === "Enter") {
    e.preventDefault();
    const typed = input.value.trim();
    if (typed) executeCommand(typed);
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
  if (cmd) executeCommand(cmd);
}

function appendOutput(html: string): void {
  output.classList.add("has-content");
  output.innerHTML += html + "\n";
  output.scrollTop = output.scrollHeight;
}

// ── Genel API (yükleyici bunları çağırır) ──────────────────────────
export function open(initialCommand?: string): void {
  if (!built) build();
  if (isOpen) {
    if (initialCommand) executeCommand(initialCommand);
    return;
  }
  isOpen = true;
  backdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
  input.value = "";
  filterCommands("");
  setTimeout(() => input.focus(), 50);
  if (initialCommand) executeCommand(initialCommand);
}

export function close(): void {
  if (!isOpen) return;
  isOpen = false;
  backdrop.classList.remove("is-open");
  document.body.style.overflow = "";
  stopMatrix();
}

export function toggle(): void {
  if (isOpen) close();
  else open();
}

// ── Komut motoru ───────────────────────────────────────────────────
const NAV_ALIASES: Record<string, string> = {
  home: "/", "cd ~": "/", cd: "/",
  about: "/about", "cd about": "/about",
  projects: "/projects", "cd projects": "/projects", "ls projects": "/projects",
  blog: "/blog", "cd blog": "/blog",
  contact: "/contact", "cd contact": "/contact", ping: "/contact",
};

function executeCommand(rawCmd: string): void {
  const cmd = rawCmd.trim();
  if (!cmd) return;

  input.value = "";
  filterCommands("");
  appendOutput(`<span class="cmd-log-command">$ ${escapeHtml(cmd)}</span>`);

  const n = cmd.toLowerCase();

  if (["sudo rm -rf /", "rm -rf /", "sudo rm -rf", "rm -rf /*", "sudo rm -rf /*"].includes(n)) {
    triggerDestructionEasterEgg();
    return;
  }

  if (n === "matrix") {
    appendOutput(`<span class="cmd-log-success">🟢 Matrix Digital Rain protocol initialized. Press ESC to stop.</span>`);
    startMatrix();
    return;
  }

  if (n === "whoami") {
    appendOutput(
      `<span class="cmd-log-cyan">Name:</span> ${profile.name}\n` +
        `<span class="cmd-log-cyan">Role:</span> ${profile.role.en} / ${profile.role.tr}\n` +
        `<span class="cmd-log-cyan">Age:</span> ${getAge()} years old\n` +
        `<span class="cmd-log-cyan">Location:</span> ${profile.region}\n` +
        `<span class="cmd-log-cyan">Status:</span> ${profile.work.isEmployed ? profile.work.statusLabel.en : "Open to work"}\n` +
        `<span class="cmd-log-info">"I see software development not just as writing code, but as transforming ideas into working systems."</span>`,
    );
    return;
  }

  if (n === "skills") {
    appendOutput(
      `<span class="cmd-log-success">Languages:</span>  ${profile.skills.languages.join(", ")}\n` +
        `<span class="cmd-log-success">Frameworks:</span> ${profile.skills.frameworks.join(", ")}\n` +
        `<span class="cmd-log-success">Tools & OS:</span> ${profile.skills.tools.join(", ")}\n` +
        `<span class="cmd-log-warn">Learning:</span>   ${profile.skills.learning.join(", ")}`,
    );
    return;
  }

  if (n === "status") {
    appendOutput(
      `<span class="cmd-log-success">● nazimcanislam.dev:</span>       OPERATIONAL (200 OK)\n` +
        `<span class="cmd-log-success">● Vercel Edge Runtime:</span>     ACTIVE (Region: fra1, Latency: 16ms)\n` +
        `<span class="cmd-log-success">● GitHub API Integration:</span>  CONNECTED (Rate-limit: healthy)\n` +
        `<span class="cmd-log-success">● Bubble Canvas Worker:</span>    ONLINE (Multi-threaded OffscreenCanvas)\n` +
        `<span class="cmd-log-cyan">────────────────────────────────────────────</span>\n` +
        `<span class="cmd-log-success">✓ ALL SYSTEMS OPERATIONAL. 0 ERRORS DETECTED.</span>`,
    );
    return;
  }

  if (n === "clear") {
    output.innerHTML = "";
    output.classList.remove("has-content");
    return;
  }

  if (n === "help") {
    appendOutput(
      `<span class="cmd-log-cyan">Available commands:</span>\n` +
        `  <span class="cmd-log-command">whoami</span>          - Display bio & summary\n` +
        `  <span class="cmd-log-command">skills</span>          - List programming skills & stack\n` +
        `  <span class="cmd-log-command">status</span>          - Inspect system health status\n` +
        `  <span class="cmd-log-command">home / about / projects / blog / contact</span> - Navigation\n` +
        `  <span class="cmd-log-command">matrix</span>          - Start Matrix digital rain\n` +
        `  <span class="cmd-log-command">clear</span>           - Clear terminal window\n` +
        `  <span class="cmd-log-command">sudo rm -rf /</span>   - 🔥 System deletion sequence\n` +
        `  <span class="cmd-log-command">github / linkedin / email</span> - Open links`,
    );
    return;
  }

  const target = NAV_ALIASES[n];
  if (target) {
    const label = target === "/" ? "Home" : target;
    appendOutput(`<span class="cmd-log-info">Navigating to ${label}...</span>`);
    setTimeout(() => (window.location.href = target), 300);
    return;
  }

  if (n === "github") { window.open("https://github.com/nazimcanislam", "_blank"); return; }
  if (n === "linkedin") { window.open("https://linkedin.com/in/nazimcanislam", "_blank"); return; }
  if (n === "email") { window.location.href = `mailto:${profile.social.email}`; return; }

  if (n.startsWith("echo ")) { appendOutput(escapeHtml(cmd.slice(5))); return; }
  if (n === "date") { appendOutput(new Date().toString()); return; }

  appendOutput(
    `<span class="cmd-log-error">zsh: command not found: ${escapeHtml(cmd)}</span>\n` +
      `<span class="cmd-log-info">Type <span class="cmd-log-command">help</span> to view all available commands.</span>`,
  );
}

// ── Easter egg: sudo rm -rf / ──────────────────────────────────────
function triggerDestructionEasterEgg(): void {
  if (isDeletingSystem) return;
  isDeletingSystem = true;

  const steps = [
    { text: `[sudo] password for visitor: *********`, delay: 300, cls: "cmd-log-warn" },
    { text: `⚠️ WARNING: Root deletion sequence initiated!`, delay: 600, cls: "cmd-log-error" },
    { text: `Removing /bin/bash ... [OK]`, delay: 900, cls: "cmd-log-info" },
    { text: `Removing /portfolio/src/layouts ... [OK]`, delay: 1200, cls: "cmd-log-info" },
    { text: `Removing /portfolio/node_modules ... [1.8 GB FREED]`, delay: 1500, cls: "cmd-log-cyan" },
    { text: `Removing /dev/coffee ... ❌ FATAL ERROR: Coffee cannot be removed! Coffee is immortal.`, delay: 1800, cls: "cmd-log-error" },
    { text: `Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)`, delay: 2100, cls: "cmd-log-error" },
  ];
  steps.forEach(({ text, delay, cls }) => {
    setTimeout(() => appendOutput(`<span class="${cls}">${text}</span>`), delay);
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    setTimeout(() => {
      document.body.classList.add("easter-egg-shake", "easter-egg-glitch");
      statusText.textContent = "⚠️ System Alert";
    }, 2100);
  } else {
    setTimeout(() => {
      appendOutput(`<span class="cmd-log-info">[Notice: Reduced motion active. Visual screen shaking bypassed for comfort.]</span>`);
    }, 2100);
  }

  setTimeout(() => {
    if (!reduced) document.body.classList.remove("easter-egg-shake", "easter-egg-glitch");
    appendOutput(
      `\n<span class="cmd-log-cyan">────────────────────────────────────────────</span>\n` +
        `<span class="cmd-log-success">🛡️ Restoring from immutable snapshot...</span>\n` +
        `<span class="cmd-log-success">100% integrity verified.</span>\n` +
        `<span class="cmd-log-success">Just kidding! Nazımcan's architecture is indestructible. 😎</span>\n` +
        `<span class="cmd-log-cyan">────────────────────────────────────────────</span>`,
    );
    statusText.textContent = "● System Restored";
    isDeletingSystem = false;
  }, 4000);
}

// ── Matrix yağmuru ─────────────────────────────────────────────────
function startMatrix(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    appendOutput(`<span class="cmd-log-info">[Notice: Matrix visual rain is disabled because 'prefers-reduced-motion' is active.]</span>`);
    return;
  }
  const ctx = matrixCanvas.getContext("2d");
  if (!ctx) return;
  matrixCanvas.style.display = "block";

  const w = (matrixCanvas.width = window.innerWidth);
  const h = (matrixCanvas.height = window.innerHeight);
  const chars = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF{}[]<>=/\\$*+~#";
  const fontSize = 16;
  const columns = Math.floor(w / fontSize);
  const drops: number[] = Array.from({ length: columns }, () => Math.random() * -50);

  function draw(): void {
    ctx!.fillStyle = "rgba(2, 6, 23, 0.08)";
    ctx!.fillRect(0, 0, w, h);
    ctx!.font = `${fontSize}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const y = drops[i] * fontSize;
      ctx!.fillStyle = "#ffffff";
      ctx!.fillText(text, i * fontSize, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    matrixAnimationId = requestAnimationFrame(draw);
  }

  if (matrixAnimationId) cancelAnimationFrame(matrixAnimationId);
  matrixAnimationId = requestAnimationFrame(draw);

  // 10 sn sonra otomatik dur (önceki zamanlayıcıyı temizle).
  if (matrixStopTimer) clearTimeout(matrixStopTimer);
  matrixStopTimer = setTimeout(stopMatrix, 10000);
}

function stopMatrix(): void {
  if (matrixAnimationId) {
    cancelAnimationFrame(matrixAnimationId);
    matrixAnimationId = null;
  }
  if (matrixStopTimer) {
    clearTimeout(matrixStopTimer);
    matrixStopTimer = null;
  }
  if (matrixCanvas) {
    matrixCanvas.style.display = "none";
    matrixCanvas.getContext("2d")?.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  }
}
