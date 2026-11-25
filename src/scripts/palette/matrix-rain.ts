import { prefersReducedMotion } from "@utils/dom";

let matrixAnimationId: number | null = null;
let matrixStopTimer: ReturnType<typeof setTimeout> | null = null;

export function startMatrix(
  canvas: HTMLCanvasElement,
  appendOutput: (html: string) => void,
): void {
  if (prefersReducedMotion()) {
    appendOutput(
      `<span class="cmd-log-info">[Notice: Matrix visual rain is disabled because 'prefers-reduced-motion' is active.]</span>`,
    );
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.style.display = "block";

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);
  const chars =
    "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF{}[]<>=/\\$*+~#";
  const fontSize = 16;
  const columns = Math.floor(w / fontSize);
  const drops: number[] = Array.from(
    { length: columns },
    () => Math.random() * -50,
  );

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

  if (matrixStopTimer) clearTimeout(matrixStopTimer);
  matrixStopTimer = setTimeout(() => stopMatrix(canvas), 10000);
}

export function stopMatrix(canvas?: HTMLCanvasElement | null): void {
  if (matrixAnimationId) {
    cancelAnimationFrame(matrixAnimationId);
    matrixAnimationId = null;
  }
  if (matrixStopTimer) {
    clearTimeout(matrixStopTimer);
    matrixStopTimer = null;
  }
  if (canvas) {
    canvas.style.display = "none";
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }
}
