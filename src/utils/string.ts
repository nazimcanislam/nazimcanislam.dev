const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

/** Türkçe karakterleri normalize ederek URL/anchor uyumlu slug üretir. */
export function slugify(text: string): string {
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (match) => TURKISH_CHAR_MAP[match] ?? match)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
