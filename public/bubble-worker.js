const BUBBLE_COUNT = 8;
const MAX_OVERFLOW = 20;
const BUBBLE_SPEED = 0.05;
const BUBBLE_WOBBLE = 0.12;
const BUBBLE_PHASE_SPEED = 0.01;
const INTERACTIVE_LERP = 0.08;
const SCALE_LERP = 0.12;

const BUBBLE_COLORS = [
  "rgba(18,113,255,0.8)",
  "rgba(221,74,255,0.8)",
  "rgba(100,228,255,0.8)",
  "rgba(200,50,55,0.7)",
  "rgba(100,180,55,0.8)",
];

const DARK_GRADIENT = ["#0f172a", "#020617"];
const LIGHT_GRADIENT = ["#e5e7eb", "#ffffff"];

function createBubbleSprite(r, color) {
  const blur = r * 0.35;
  const padding = blur * 2;
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

let canvas, ctx, dpr, isDark, isTouchDevice;
let bubbles = [];
let interactiveBubble = null;
let backgroundGradient = null;
let animationId = null;
let targetX = 0,
  targetY = 0;
let targetScale = 1,
  currentScale = 1;

function getBaseRadius() {
  return Math.min(canvas.width / dpr, canvas.height / dpr) * 0.18;
}

function buildBackgroundGradient() {
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const [start, end] = isDark ? DARK_GRADIENT : LIGHT_GRADIENT;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, start);
  g.addColorStop(1, end);
  backgroundGradient = g;
}

function spawnBubbles(w, h) {
  const base = getBaseRadius();

  bubbles = Array.from(
    { length: BUBBLE_COUNT },
    (_, i) =>
      new Bubble(
        Math.random() * w,
        Math.random() * h,
        base * (0.7 + Math.random() * 0.6),
        BUBBLE_COLORS[i % BUBBLE_COLORS.length],
        BUBBLE_SPEED,
      ),
  );

  if (!isTouchDevice) {
    interactiveBubble = new Bubble(
      w / 2,
      h / 2,
      base * 1.4,
      "rgba(37,99,235,0.7)",
      0,
    );
    targetX = w / 2;
    targetY = h / 2;
  }
}

function applyResize(w, h) {
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildBackgroundGradient();
  spawnBubbles(w, h);
}

function drawFrame() {
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);

  if (backgroundGradient) {
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.globalCompositeOperation = "screen";

  for (const bubble of bubbles) {
    bubble.update(w, h);
    bubble.draw(ctx);
  }

  if (interactiveBubble) {
    interactiveBubble.x += (targetX - interactiveBubble.x) * INTERACTIVE_LERP;
    interactiveBubble.y += (targetY - interactiveBubble.y) * INTERACTIVE_LERP;
    currentScale += (targetScale - currentScale) * SCALE_LERP;

    const newR = getBaseRadius() * 1.4 * currentScale;
    if (Math.abs(newR - interactiveBubble.r) > 0.5) {
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
      targetScale = 1.4;
      break;

    case "pointerup":
      targetScale = 1;
      break;

    case "resize":
      applyResize(data.w, data.h);
      break;

    case "theme":
      isDark = data.isDark;
      buildBackgroundGradient();
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
