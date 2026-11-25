/** GitHub Linguist renk paleti (en sık kullanılanlar + genişletilmiş liste). */
export const LANG_COLOR_MAP: Record<string, string> = {
  Astro: "#ff5a03",
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Swift: "#F05138",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Less: "#1d365d",
  HTML: "#e34c26",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Go: "#00ADD8",
  Kotlin: "#A97BFF",
  Java: "#b07219",
  Shell: "#89e051",
  PowerShell: "#012456",
  Batchfile: "#C1F12E",
  PHP: "#474A8A",
  Ruby: "#701516",
  Dart: "#00B4AB",
  Lua: "#000080",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Nix: "#7e7eff",
  Zig: "#ec915c",
  "Jupyter Notebook": "#DA5B0B",
  TeX: "#3D6117",
  MDX: "#fcb32c",
  Markdown: "#083fa1",
  "Vim Script": "#199f4b",
  Nunjucks: "#3d8137",
  Handlebars: "#f7931e",
  Procfile: "#3B2F63",
};

export const LANG_FALLBACK_COLOR = "#8b949e";

export function getLanguageColor(language: string | null | undefined): string {
  if (!language) return LANG_FALLBACK_COLOR;
  return LANG_COLOR_MAP[language] ?? LANG_FALLBACK_COLOR;
}
