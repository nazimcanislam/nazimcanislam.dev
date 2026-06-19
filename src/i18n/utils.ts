// src/i18n/utils.ts
import { translations, type Lang } from "./translations";

export const DEFAULT_LANG: Lang = "en";
export const LOCALES = Object.keys(translations) as Lang[];

/**
 * Aktif dili URL tabanlı i18n yönlendirmesinden okur (Astro.currentLocale).
 * Artık `accept-language` header'ına ihtiyaç yok → site statik olabilir,
 * dolayısıyla Vercel'de sunucu (cold start) gecikmesi ortadan kalkar.
 *
 * Hem global `Astro` nesnesini hem de sade `{ currentLocale }` objesini kabul eder.
 */
export function getLang(astro: { currentLocale?: string }): Lang {
  const loc = astro?.currentLocale;
  return loc && loc in translations ? (loc as Lang) : DEFAULT_LANG;
}

export function useTranslations(lang: Lang) {
  const t = (section: string, key: string): string => {
    return (
      (translations[lang] as Record<string, Record<string, string>>)[section]?.[
        key
      ] ?? ""
    );
  };
  return t;
}

/** Bir yoldaki dil ön ekini ("/tr") söker; karşılaştırma/aktif-link için. */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (l === DEFAULT_LANG) continue;
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname || "/";
}

/**
 * Bir yolu verilen dile göre üretir.
 * Varsayılan dil ön eksizdir (/about), diğer diller ön ekli (/tr/about).
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LANG) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}
