// Ortak JSON renklendirici: hem build zamanında (BrieflyAbout) hem
// tarayıcıda (ApiExplorer typewriter) kullanılır. Renkler CSS'teki
// .json-* sınıflarından gelir (utilities.css).

export function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** `escapeHtml` uygulanmış JSON/JSONC metnini <span class="json-*"> ile sarar. */
export function highlightJson(text: string): string {
  return text.replace(
    /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?)|([{}\[\],])/g,
    (m, comment, str, colon, bool, num, punct) => {
      if (comment) return `<span class="json-comment">${comment}</span>`;
      if (str && colon) return `<span class="json-key">${str}</span>${colon}`;
      if (str) return `<span class="json-str">${str}</span>`;
      if (bool) return `<span class="json-bool">${bool}</span>`;
      if (num) return `<span class="json-num">${num}</span>`;
      if (punct) return `<span class="json-punct">${punct}</span>`;
      return m;
    },
  );
}
