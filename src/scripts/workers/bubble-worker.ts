// ─── Bubble count & movement ───────────────────────────────────────────────
const BUBBLE_COUNT = 8;
const MAX_OVERFLOW = 20;
const BUBBLE_SPEED = 0.05;
const BUBBLE_WOBBLE = 0.12;
const BUBBLE_PHASE_SPEED = 0.01;

// ─── Intro animation ────────────────────────────────────────────────────────
const INTRO_MS = 900;
const INTRO_START_SCALE = 0.6;

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
const BUBBLE_PADDING_FACTOR = 1;

// ─── Colors ─────────────────────────────────────────────────────────────────
const BUBBLE_COLORS = [
  "rgba(18,113,255,0.8)",
  "rgba(221,74,255,0.8)",
  "rgba(100,228,255,0.8)",
  "rgba(200,50,55,0.7)",
  "rgba(100,180,55,0.8)",
] as const;

const DARK_GRADIENT = ["#0f172a", "#020617"] as const;
const LIGHT_GRADIENT = ["#e5e7eb", "#ffffff"] as const;

export type BubbleWorkerMessage =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      dpr: number;
      w: number;
      h: number;
      isDark: boolean;
      isTouchDevice: boolean;
    }
  | { type: "pointermove"; x: number; y: number }
  | { type: "pointerdown" }
  | { type: "pointerup" }
  | { type: "resize"; w: number; h: number; dpr?: number }
  | { type: "theme"; isDark: boolean }
  | { type: "pause" }
  | { type: "resume" };

function createBubbleSprite(r: number, color: string): OffscreenCanvas {
  const blur = r * BUBBLE_BLUR_FACTOR;
  const padding = blur * BUBBLE_PADDING_FACTOR;
  const size = Math.ceil(r * 2 + padding * 2);
  const sprite = new OffscreenCanvas(size, size);
  const spriteCtx = sprite.getContext("2d");
  if (!spriteCtx) return sprite;

  const cx = size / 2;
  const cy = size / 2;

  spriteCtx.filter = `blur(${blur}px)`;

  const g = spriteCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "transparent");

  spriteCtx.fillStyle = g;
  spriteCtx.beginPath();
  spriteCtx.arc(cx, cy, r, 0, Math.PI * 2);
  spriteCtx.fill();

  return sprite;
}

class Bubble {
  x: number;
  y: number;
  r: number;
  color: string;
  vx: number;
  vy: number;
  phase: number;
  sprite: OffscreenCanvas;

  constructor(x: number, y: number, r: number, color: string, speed: number) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.phase = Math.random() * Math.PI * 2;
    this.sprite = createBubbleSprite(r, color);
  }

  update(w: number, h: number): void {
    this.phase += BUBBLE_PHASE_SPEED;
    this.x += this.vx + Math.sin(this.phase) * BUBBLE_WOBBLE;
    this.y += this.vy + Math.cos(this.phase) * BUBBLE_WOBBLE;

    if (this.x < -MAX_OVERFLOW || this.x > w + MAX_OVERFLOW) this.vx *= -1;
    if (this.y < -MAX_OVERFLOW || this.y > h + MAX_OVERFLOW) this.vy *= -1;
  }

  draw(targetCtx: OffscreenCanvasRenderingContext2D, scale = 1): void {
    const w = this.sprite.width * scale;
    const h = this.sprite.height * scale;
    targetCtx.drawImage(this.sprite, this.x - w / 2, this.y - h / 2, w, h);
  }
}

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let dpr = 1;
let isDark = true;
let isTouchDevice = false;
let bubbles: Bubble[] = [];
let interactiveBubble: Bubble | null = null;
let backgroundGradient: CanvasGradient | null = null;
let animationId: number | null = null;
let targetX = 0;
let targetY = 0;
let targetScale = 1;
let currentScale = 1;
let cachedBaseRadius = 0;
let introStart = 0;

function buildBackgroundGradient(w: number, h: number): void {
  const [start, end] = isDark ? DARK_GRADIENT : LIGHT_GRADIENT;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, start);
  g.addColorStop(1, end);
  backgroundGradient = g;
}

function spawnBubbles(w: number, h: number): void {
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

function applyResize(w: number, h: number, newDpr?: number): void {
  const oldW = canvas.width / (dpr || 1);
  const oldH = canvas.height / (dpr || 1);
  if (newDpr) dpr = newDpr;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const newBaseRadius = Math.min(w, h) * BASE_RADIUS_FACTOR;
  const radiusRatio = cachedBaseRadius > 0 ? newBaseRadius / cachedBaseRadius : 1;
  cachedBaseRadius = newBaseRadius;

  buildBackgroundGradient(w, h);

  if (bubbles.length === 0) {
    spawnBubbles(w, h);
    return;
  }

  const scaleX = oldW > 0 ? w / oldW : 1;
  const scaleY = oldH > 0 ? h / oldH : 1;

  for (const bubble of bubbles) {
    bubble.x = Math.max(-MAX_OVERFLOW, Math.min(w + MAX_OVERFLOW, bubble.x * scaleX));
    bubble.y = Math.max(-MAX_OVERFLOW, Math.min(h + MAX_OVERFLOW, bubble.y * scaleY));

    if (Math.abs(radiusRatio - 1) > 0.15) {
      bubble.r = Math.max(10, bubble.r * radiusRatio);
      bubble.sprite = createBubbleSprite(bubble.r, bubble.color);
    }
  }

  if (interactiveBubble) {
    interactiveBubble.x = Math.max(0, Math.min(w, interactiveBubble.x * scaleX));
    interactiveBubble.y = Math.max(0, Math.min(h, interactiveBubble.y * scaleY));
    targetX = Math.max(0, Math.min(w, targetX * scaleX));
    targetY = Math.max(0, Math.min(h, targetY * scaleY));

    if (Math.abs(radiusRatio - 1) > 0.15) {
      interactiveBubble.r = cachedBaseRadius * INTERACTIVE_BUBBLE_SCALE * currentScale;
      interactiveBubble.sprite = createBubbleSprite(
        interactiveBubble.r,
        interactiveBubble.color,
      );
    }
  }
}

function drawFrame(): void {
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);

  if (backgroundGradient) {
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, w, h);
  }

  const intro = introStart
    ? Math.min((performance.now() - introStart) / INTRO_MS, 1)
    : 1;
  const introE = 1 - Math.pow(1 - intro, 3);
  const introScale = INTRO_START_SCALE + (1 - INTRO_START_SCALE) * introE;

  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = introE;

  for (const bubble of bubbles) {
    bubble.update(w, h);
    bubble.draw(ctx, introScale);
  }

  if (interactiveBubble) {
    interactiveBubble.x += (targetX - interactiveBubble.x) * INTERACTIVE_LERP;
    interactiveBubble.y += (targetY - interactiveBubble.y) * INTERACTIVE_LERP;
    currentScale += (targetScale - currentScale) * SCALE_LERP;

    const newR = cachedBaseRadius * INTERACTIVE_BUBBLE_SCALE * currentScale;

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

    interactiveBubble.draw(ctx, introScale);
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  animationId = requestAnimationFrame(drawFrame);
}

self.addEventListener("message", (event: MessageEvent<BubbleWorkerMessage>) => {
  const data = event.data;
  switch (data.type) {
    case "init": {
      canvas = data.canvas;
      dpr = data.dpr;
      isDark = data.isDark;
      isTouchDevice = data.isTouchDevice;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) return;
      ctx = context;
      applyResize(data.w, data.h);
      introStart = performance.now();
      animationId = requestAnimationFrame(drawFrame);
      break;
    }
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
      applyResize(data.w, data.h, data.dpr);
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
});
