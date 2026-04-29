// src/i18n/utils.ts
import { translations, type Lang } from "./translations";

export function getLang(request: Request): Lang {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  return (
    acceptLanguage
      .split(",")
      .map((p) => p.split(";")[0].trim().slice(0, 2).toLowerCase())
      .find((l): l is Lang => l in translations) ?? "en"
  );
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
