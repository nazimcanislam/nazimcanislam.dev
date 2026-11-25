import { getAge, profile } from "@data/profile";
import { prefersReducedMotion } from "@utils/dom";
import { escapeHtml } from "@utils/html";
import { startMatrix } from "@scripts/palette/matrix-rain";

export interface CommandContext {
  appendOutput: (html: string) => void;
  clearOutput: () => void;
  setStatus: (text: string) => void;
  matrixCanvas: HTMLCanvasElement;
}

const NAV_ALIASES: Record<string, string> = {
  home: "/",
  "cd ~": "/",
  cd: "/",
  about: "/about",
  "cd about": "/about",
  uses: "/uses",
  "cd uses": "/uses",
  projects: "/projects",
  "cd projects": "/projects",
  "ls projects": "/projects",
  blog: "/blog",
  "cd blog": "/blog",
  contact: "/contact",
  "cd contact": "/contact",
  ping: "/contact",
};

const DESTRUCTION_COMMANDS = new Set([
  "sudo rm -rf /",
  "rm -rf /",
  "sudo rm -rf",
  "rm -rf /*",
  "sudo rm -rf /*",
]);

let isDeletingSystem = false;

function triggerDestructionEasterEgg(ctx: CommandContext): void {
  if (isDeletingSystem) return;
  isDeletingSystem = true;

  const steps = [
    { text: "[sudo] password for visitor: *********", delay: 300, cls: "cmd-log-warn" },
    { text: "⚠️ WARNING: Root deletion sequence initiated!", delay: 600, cls: "cmd-log-error" },
    { text: "Removing /bin/bash ... [OK]", delay: 900, cls: "cmd-log-info" },
    { text: "Removing /portfolio/src/layouts ... [OK]", delay: 1200, cls: "cmd-log-info" },
    { text: "Removing /portfolio/node_modules ... [1.8 GB FREED]", delay: 1500, cls: "cmd-log-cyan" },
    {
      text: "Removing /dev/coffee ... ❌ FATAL ERROR: Coffee cannot be removed! Coffee is immortal.",
      delay: 1800,
      cls: "cmd-log-error",
    },
    {
      text: "Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0)",
      delay: 2100,
      cls: "cmd-log-error",
    },
  ];

  steps.forEach(({ text, delay, cls }) => {
    setTimeout(() => ctx.appendOutput(`<span class="${cls}">${text}</span>`), delay);
  });

  const reduced = prefersReducedMotion();
  if (!reduced) {
    setTimeout(() => {
      document.body.classList.add("easter-egg-shake", "easter-egg-glitch");
      ctx.setStatus("⚠️ System Alert");
    }, 2100);
  } else {
    setTimeout(() => {
      ctx.appendOutput(
        `<span class="cmd-log-info">[Notice: Reduced motion active. Visual screen shaking bypassed for comfort.]</span>`,
      );
    }, 2100);
  }

  setTimeout(() => {
    if (!reduced) {
      document.body.classList.remove("easter-egg-shake", "easter-egg-glitch");
    }
    ctx.appendOutput(
      `\n<span class="cmd-log-cyan">────────────────────────────────────────────</span>\n` +
        `<span class="cmd-log-success">🛡️ Restoring from immutable snapshot...</span>\n` +
        `<span class="cmd-log-success">100% integrity verified.</span>\n` +
        `<span class="cmd-log-success">Just kidding! Nazımcan's architecture is indestructible. 😎</span>\n` +
        `<span class="cmd-log-cyan">────────────────────────────────────────────</span>`,
    );
    ctx.setStatus("● System Restored");
    isDeletingSystem = false;
  }, 4000);
}

export function resetCommandState(): void {
  isDeletingSystem = false;
}

export function executeCommand(rawCmd: string, ctx: CommandContext): void {
  const cmd = rawCmd.trim();
  if (!cmd) return;

  ctx.appendOutput(`<span class="cmd-log-command">$ ${escapeHtml(cmd)}</span>`);
  const normalized = cmd.toLowerCase();

  if (DESTRUCTION_COMMANDS.has(normalized)) {
    triggerDestructionEasterEgg(ctx);
    return;
  }

  if (normalized === "matrix") {
    ctx.appendOutput(
      `<span class="cmd-log-success">🟢 Matrix Digital Rain protocol initialized. Press ESC to stop.</span>`,
    );
    startMatrix(ctx.matrixCanvas, ctx.appendOutput);
    return;
  }

  if (normalized === "whoami") {
    ctx.appendOutput(
      `<span class="cmd-log-cyan">Name:</span> ${profile.name}\n` +
        `<span class="cmd-log-cyan">Role:</span> ${profile.role.en} / ${profile.role.tr}\n` +
        `<span class="cmd-log-cyan">Age:</span> ${getAge()} years old\n` +
        `<span class="cmd-log-cyan">Location:</span> ${profile.region}\n` +
        `<span class="cmd-log-cyan">Status:</span> ${profile.work.isEmployed ? profile.work.statusLabel.en : "Open to work"}\n` +
        `<span class="cmd-log-info">"I see software development not just as writing code, but as transforming ideas into working systems."</span>`,
    );
    return;
  }

  if (normalized === "skills") {
    ctx.appendOutput(
      `<span class="cmd-log-success">Languages:</span>  ${profile.skills.languages.join(", ")}\n` +
        `<span class="cmd-log-success">Frameworks:</span> ${profile.skills.frameworks.join(", ")}\n` +
        `<span class="cmd-log-success">Tools & OS:</span> ${profile.skills.tools.join(", ")}\n` +
        `<span class="cmd-log-warn">Learning:</span>   ${profile.skills.learning.join(", ")}`,
    );
    return;
  }

  if (normalized === "status") {
    ctx.appendOutput(
      `<span class="cmd-log-success">● nazimcanislam.dev:</span>       OPERATIONAL (200 OK)\n` +
        `<span class="cmd-log-success">● Vercel Edge Runtime:</span>     ACTIVE (Region: fra1, Latency: 16ms)\n` +
        `<span class="cmd-log-success">● GitHub API Integration:</span>  CONNECTED (Rate-limit: healthy)\n` +
        `<span class="cmd-log-success">● Bubble Canvas Worker:</span>    ONLINE (Multi-threaded OffscreenCanvas)\n` +
        `<span class="cmd-log-cyan">────────────────────────────────────────────</span>\n` +
        `<span class="cmd-log-success">✓ ALL SYSTEMS OPERATIONAL. 0 ERRORS DETECTED.</span>`,
    );
    return;
  }

  if (normalized === "clear") {
    ctx.clearOutput();
    return;
  }

  if (normalized === "help") {
    ctx.appendOutput(
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

  const target = NAV_ALIASES[normalized];
  if (target) {
    const label = target === "/" ? "Home" : target;
    ctx.appendOutput(`<span class="cmd-log-info">Navigating to ${label}...</span>`);
    setTimeout(() => {
      window.location.href = target;
    }, 300);
    return;
  }

  if (normalized === "github") {
    window.open(profile.socialUrls.github, "_blank");
    return;
  }
  if (normalized === "linkedin") {
    window.open(profile.socialUrls.linkedin, "_blank");
    return;
  }
  if (normalized === "email") {
    window.location.href = profile.socialUrls.email;
    return;
  }

  if (normalized.startsWith("echo ")) {
    ctx.appendOutput(escapeHtml(cmd.slice(5)));
    return;
  }
  if (normalized === "date") {
    ctx.appendOutput(new Date().toString());
    return;
  }

  ctx.appendOutput(
    `<span class="cmd-log-error">zsh: command not found: ${escapeHtml(cmd)}</span>\n` +
      `<span class="cmd-log-info">Type <span class="cmd-log-command">help</span> to view all available commands.</span>`,
  );
}
