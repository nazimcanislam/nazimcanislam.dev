import { getMotionMediaQuery } from "@utils/dom";
import BubbleWorker from "@scripts/workers/bubble-worker.ts?worker";

export function initBubbleCanvas(): void {
  const canvasEl = document.getElementById(
    "bubble-canvas",
  ) as HTMLCanvasElement | null;
  if (!canvasEl || canvasEl.dataset.bubbleInit === "1") return;
  canvasEl.dataset.bubbleInit = "1";

  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  if (isTouchDevice) {
    console.info(
      "Touch device detected, removing bubble canvas for performance.",
    );
    canvasEl.remove();
    return;
  }

  const motionQuery = getMotionMediaQuery();
  if (motionQuery.matches) {
    console.info(
      "Prefers reduced motion detected, skipping bubble canvas for accessibility.",
    );
    return;
  }

  if (!("transferControlToOffscreen" in canvasEl)) {
    console.warn(
      "OffscreenCanvas not supported, bubble background will not be initialized.",
    );
    return;
  }

  const canvas = canvasEl;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  let worker: Worker | null = null;
  let workerStarted = false;

  function startWorker(): void {
    if (workerStarted) return;
    workerStarted = true;

    const offscreen = canvas.transferControlToOffscreen();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    worker = new BubbleWorker();
    worker.postMessage(
      {
        type: "init",
        canvas: offscreen,
        dpr,
        w: window.innerWidth,
        h: window.innerHeight,
        isDark: true,
        isTouchDevice: false,
      },
      [offscreen],
    );

    canvas.style.display = "";

    window.addEventListener(
      "pointermove",
      (e) => {
        worker?.postMessage({
          type: "pointermove",
          x: e.clientX,
          y: e.clientY,
        });
      },
      { passive: true },
    );

    window.addEventListener("pointerdown", () => {
      worker?.postMessage({ type: "pointerdown" });
    });

    window.addEventListener("pointerup", () => {
      worker?.postMessage({ type: "pointerup" });
    });

    let resizeTimeout: ReturnType<typeof setTimeout>;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
        worker?.postMessage({ type: "resize", w, h, dpr: nextDpr });
      }, 80);
    });

    document.addEventListener("visibilitychange", () => {
      if (!workerStarted) return;
      worker?.postMessage({ type: document.hidden ? "pause" : "resume" });
    });

    motionQuery.addEventListener("change", (e) => {
      if (!workerStarted) return;
      worker?.postMessage({ type: e.matches ? "pause" : "resume" });
    });
  }

  function syncTheme(isDark: boolean): void {
    if (isDark) {
      if (!workerStarted) {
        startWorker();
      } else {
        worker?.postMessage({ type: "theme", isDark: true });
        canvas.style.display = "";
        if (!document.hidden) {
          worker?.postMessage({ type: "resume" });
        }
      }
      return;
    }

    if (workerStarted) {
      worker?.postMessage({ type: "pause" });
      worker?.postMessage({ type: "theme", isDark: false });
      canvas.style.display = "none";
    }
  }

  if (!darkQuery.matches) {
    canvas.style.display = "none";
  } else {
    startWorker();
  }

  darkQuery.addEventListener("change", (e) => {
    syncTheme(e.matches);
  });
}
