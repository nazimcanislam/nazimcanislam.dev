import type {
  CareerEntry,
  CareerRole,
  Employment,
  YearMonth,
} from "@data/profile";
import type { Lang } from "@i18n/translations";

const MONTHS: Record<Lang, readonly string[]> = {
  tr: [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

export const EMPLOYMENT_LABELS: Record<Employment, Record<Lang, string>> = {
  "full-time": { tr: "Tam Zamanlı", en: "Full-time" },
  "part-time": { tr: "Yarı Zamanlı", en: "Part-time" },
  internship: { tr: "Staj", en: "Internship" },
};

export const CAREER_KIND_META: Record<
  CareerEntry["kind"],
  { label: Record<Lang, string>; color: string }
> = {
  freelance: { label: { tr: "serbest", en: "freelance" }, color: "#fab387" },
  education: { label: { tr: "eğitim", en: "education" }, color: "#cba6f7" },
  work: { label: { tr: "kurumsal", en: "corporate" }, color: "#89b4fa" },
  building: { label: { tr: "bağımsız", en: "independent" }, color: "#a6e3a1" },
};

const toMonthIndex = (d: YearMonth): number => d.year * 12 + d.month;

function getCurrentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function formatMonth(d: YearMonth, lang: Lang): string {
  return `${MONTHS[lang][d.month - 1]} ${d.year}`;
}

export function formatCareerPeriod(
  start: YearMonth,
  end: YearMonth | null,
  lang: Lang,
  presentLabel: string,
): string {
  return `${formatMonth(start, lang)} — ${end === null ? presentLabel : formatMonth(end, lang)}`;
}

/** LinkedIn'deki gibi her iki uç dahil edilerek süre hesaplar (+1). */
export function formatCareerDuration(
  start: YearMonth,
  end: YearMonth | null,
  lang: Lang,
): string {
  const total = Math.max(
    1,
    toMonthIndex(end ?? getCurrentYearMonth()) - toMonthIndex(start) + 1,
  );
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];

  if (lang === "tr") {
    if (years) parts.push(`${years} yıl`);
    if (months) parts.push(`${months} ay`);
    return parts.join(" ") || "1 ay";
  }

  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 month";
}

export function sortCareerEntries(entries: readonly CareerEntry[]): CareerEntry[] {
  return [...entries].sort(
    (a, b) => toMonthIndex(b.start) - toMonthIndex(a.start),
  );
}

/** Bir durağın efektif tarih aralığını (varsa alt pozisyonlardan) türetir. */
export function resolveCareerEntry(entry: CareerEntry) {
  const roles: CareerRole[] = entry.roles
    ? [...entry.roles].sort(
        (a, b) => toMonthIndex(b.start) - toMonthIndex(a.start),
      )
    : [];
  const hasRoles = roles.length > 0;

  const start = hasRoles
    ? roles.reduce(
        (acc, r) => (toMonthIndex(r.start) < toMonthIndex(acc) ? r.start : acc),
        roles[0].start,
      )
    : entry.start;

  const ongoing = hasRoles
    ? roles.some((r) => r.end === null || r.current)
    : entry.end === null;

  let end: YearMonth | null;
  if (ongoing) {
    end = null;
  } else if (hasRoles) {
    end = roles.reduce(
      (acc, r) =>
        r.end && toMonthIndex(r.end) > toMonthIndex(acc) ? r.end : acc,
      roles[0].end as YearMonth,
    );
  } else {
    end = entry.end;
  }

  const current = Boolean(entry.current || roles.some((r) => r.current));

  return { roles, hasRoles, start, end, current };
}
