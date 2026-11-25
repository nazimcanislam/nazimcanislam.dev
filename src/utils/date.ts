import type { Lang } from "@i18n/translations";

/** Verilen tarihi aktif dile göre okunabilir biçimde formatlar. */
export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
