// ─── Bubble count & movement ───────────────────────────────────────────────
const BUBBLE_COUNT = 8;
const MAX_OVERFLOW = 20;
const BUBBLE_SPEED = 0.05;
const BUBBLE_WOBBLE = 0.12;
const BUBBLE_PHASE_SPEED = 0.01;

// ─── Interactive bubble ─────────────────────────────────────────────────────
const INTERACTIVE_LERP = 0.08;
const SCALE_LERP = 0.12;
const INTERACTIVE_BUBBLE_SPEED = 0;
const INTERACTIVE_BUBBLE_COLOR = "rgba(37,99,235,0.7)";
const INTERACTIVE_BUBBLE_SCALE = 1.4;
const SPRITE_REBUILD_THRESHOLD = 1.5;

// ─── Bubble sizing ──────────────────────────────────────────────────────────
const BASE_RADIUS_FACTOR = 0.18;
const MIN_BUBBLE_SCALE = 0.7;
const BUBBLE_SCALE_RANGE = 0.6;

// ─── Sprite rendering ───────────────────────────────────────────────────────
const BUBBLE_BLUR_FACTOR = 0.35;
const BUBBLE_PADDING_FACTOR = 1; // padding = blur * this (was 2, reduced to shrink canvas ~30%)

// ─── Colors ─────────────────────────────────────────────────────────────────
const BUBBLE_COLORS = [
  "rgba(18,113,255,0.8)",
  "rgba(221,74,255,0.8)",
  "rgba(100,228,255,0.8)",
  "rgba(200,50,55,0.7)",
  "rgba(100,180,55,0.8)",
];

const DARK_GRADIENT = ["#0f172a", "#020617"];
const LIGHT_GRADIENT = ["#e5e7eb", "#ffffff"];

// ─── Sprite factory ─────────────────────────────────────────────────────────
function createBubbleSprite(r, color) {
  const blur = r * BUBBLE_BLUR_FACTOR;
  const padding = blur * BUBBLE_PADDING_FACTOR;
  const size = Math.ceil(r * 2 + padding * 2);
  const sprite = new OffscreenCanvas(size, size);
  const ctx = sprite.getContext("2d");

  const cx = size / 2;
  const cy = size / 2;

  ctx.filter = `blur(${blur}px)`;

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  return sprite;
}

// ─── Bubble class ────────────────────────────────────────────────────────────
class Bubble {
  constructor(x, y, r, color, speed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.phase = Math.random() * Math.PI * 2;
    this.sprite = createBubbleSprite(r, color);
  }

  update(w, h) {
    this.phase += BUBBLE_PHASE_SPEED;
    this.x += this.vx + Math.sin(this.phase) * BUBBLE_WOBBLE;
    this.y += this.vy + Math.cos(this.phase) * BUBBLE_WOBBLE;

    if (this.x < -MAX_OVERFLOW || this.x > w + MAX_OVERFLOW) this.vx *= -1;
    if (this.y < -MAX_OVERFLOW || this.y > h + MAX_OVERFLOW) this.vy *= -1;
  }

  draw(ctx) {
    const offset = this.sprite.width / 2;
    ctx.drawImage(this.sprite, this.x - offset, this.y - offset);
  }
}

// ─── State ───────────────────────────────────────────────────────────────────
let canvas, ctx, dpr, isDark, isTouchDevice;
let bubbles = [];
let interactiveBubble = null;
let backgroundGradient = null;
let animationId = null;
let targetX = 0,
  targetY = 0;
let targetScale = 1,
  currentScale = 1;
let cachedBaseRadius = 0; // cached on resize, avoids recalc every frame

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildBackgroundGradient(w, h) {
  const [start, end] = isDark ? DARK_GRADIENT : LIGHT_GRADIENT;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, start);
  g.addColorStop(1, end);
  backgroundGradient = g;
}

function spawnBubbles(w, h) {
  bubbles = Array.from(
    { length: BUBBLE_COUNT },
    (_, i) =>
      new Bubble(
        Math.random() * w,
        Math.random() * h,
        cachedBaseRadius *
          (MIN_BUBBLE_SCALE + Math.random() * BUBBLE_SCALE_RANGE),
        BUBBLE_COLORS[i % BUBBLE_COLORS.length],
        BUBBLE_SPEED,
      ),
  );

  if (!isTouchDevice) {
    interactiveBubble = new Bubble(
      w / 2,
      h / 2,
      cachedBaseRadius * INTERACTIVE_BUBBLE_SCALE,
      INTERACTIVE_BUBBLE_COLOR,
      INTERACTIVE_BUBBLE_SPEED,
    );
    targetX = w / 2;
    targetY = h / 2;
  }
}

function applyResize(w, h) {
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cachedBaseRadius = Math.min(w, h) * BASE_RADIUS_FACTOR;
  buildBackgroundGradient(w, h);
  spawnBubbles(w, h);
}

// ─── Render loop ─────────────────────────────────────────────────────────────
function drawFrame() {
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);

  if (backgroundGradient) {
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, w, h);
  }

  // Single composite pass for all bubbles (including interactive)
  ctx.globalCompositeOperation = "screen";

  for (const bubble of bubbles) {
    bubble.update(w, h);
    bubble.draw(ctx);
  }

  if (interactiveBubble) {
    interactiveBubble.x += (targetX - interactiveBubble.x) * INTERACTIVE_LERP;
    interactiveBubble.y += (targetY - interactiveBubble.y) * INTERACTIVE_LERP;
    currentScale += (targetScale - currentScale) * SCALE_LERP;

    const newR = cachedBaseRadius * INTERACTIVE_BUBBLE_SCALE * currentScale;

    // Only rebuild sprite when radius change is significant enough to matter
    // and lerp hasn't settled yet — avoids per-frame GC pressure
    if (
      Math.abs(newR - interactiveBubble.r) > SPRITE_REBUILD_THRESHOLD &&
      Math.abs(currentScale - targetScale) > 0.001
    ) {
      interactiveBubble.r = newR;
      interactiveBubble.sprite = createBubbleSprite(
        newR,
        interactiveBubble.color,
      );
    }

    interactiveBubble.draw(ctx);
  }

  ctx.globalCompositeOperation = "source-over";

  animationId = requestAnimationFrame(drawFrame);
}

// ─── Message handler ──────────────────────────────────────────────────────────
self.onmessage = ({ data }) => {
  switch (data.type) {
    case "init":
      canvas = data.canvas;
      dpr = data.dpr;
      isDark = data.isDark;
      isTouchDevice = data.isTouchDevice;
      ctx = canvas.getContext("2d", { alpha: true });
      applyResize(data.w, data.h);
      animationId = requestAnimationFrame(drawFrame);
      break;

    case "pointermove":
      targetX = data.x;
      targetY = data.y;
      break;

    case "pointerdown":
      targetScale = INTERACTIVE_BUBBLE_SCALE;
      break;

    case "pointerup":
      targetScale = 1;
      break;

    case "resize":
      applyResize(data.w, data.h);
      break;

    case "theme":
      isDark = data.isDark;
      buildBackgroundGradient(canvas.width / dpr, canvas.height / dpr);
      break;

    case "pause":
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
      break;

    case "resume":
      if (!animationId) animationId = requestAnimationFrame(drawFrame);
      break;
  }
};
