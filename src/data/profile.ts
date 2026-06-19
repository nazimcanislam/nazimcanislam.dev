// =============================================================================
//  src/data/profile.ts
//  TEK KAYNAK (single source of truth).
//  Çalıştığın yer, rolün, kullandığın teknolojiler vb. SADECE burada yazılır;
//  ana sayfa, Hakkımda ve API Explorer hepsi buradan çeker.
//  Bir şeyi değiştirmek için tek yapman gereken: bu dosyayı düzenlemek.
// =============================================================================

import type { Lang } from "@/i18n/translations";

/** Her iki dilde de geçerli olan kısa metinler için yardımcı tip. */
type Localized = Record<Lang, string>;

export const profile = {
  name: "Nazımcan İslam",

  // ── Doğum bilgisi (yaş otomatik hesaplanır) ──────────────────────────────
  birth: { year: 2002, month: 7, day: 28 },

  region: "🇹🇷 Türkiye",
  location: { tr: "İstanbul, 🇹🇷", en: "Istanbul, 🇹🇷" } satisfies Localized,
  spokenLanguages: ["tr", "en"] as const,

  // ── Rol / unvan ──────────────────────────────────────────────────────────
  // Kendini nasıl tanıtmak istiyorsan burada değiştir.
  role: {
    tr: "Yazılım Geliştirici & Grafik Tasarımcı",
    en: "Software Developer & Graphic Designer",
  } satisfies Localized,
  // API / JSON rozetleri gibi dar alanlar için kısa hali.
  roleShort: {
    tr: "Yazılım Geliştirici",
    en: "Software Developer",
  } satisfies Localized,

  // ── ÇALIŞMA DURUMU ───────────────────────────────────────────────────────
  // İş değiştirdiğinde SADECE burayı güncelle. "iş arıyorum" yazan her yer
  // (Hero rozeti, Hakkımda kartı, İletişim kanalı) buradan beslenir.
  work: {
    isEmployed: false, // false yaparsan otomatik olarak "işe açık" moduna döner
    employer: "İGEDER",
    employerUrl: "https://igeder.org.tr",
    // Makine/terminal estetiği için tek kelimelik anahtar (Hero rozeti, API).
    statusKey: "employed",
    // İnsan-okunur durum metni.
    statusLabel: {
      tr: "İGEDER'de çalışıyor",
      en: "Working at İGEDER",
    } satisfies Localized,
    statusNote: {
      tr: "Şu anda İGEDER'de tam zamanlı çalışıyorum. İlginç projeler ve sohbetler için yine de iletişime açığım.",
      en: "Currently working full-time at İGEDER. Still open to interesting projects and conversations.",
    } satisfies Localized,
  },

  // ── YETENEKLER / TEKNOLOJİLER ────────────────────────────────────────────
  // Ana sayfadaki API Explorer ve Hakkımda sayfası AYNI listeyi buradan çeker.
  // Tek yerde değiştir, iki yerde de güncellensin.
  skills: {
    languages: ["TypeScript", "JavaScript", "CSS", "Python", "C"],
    frameworks: ["React", "Astro", "Node.js", "Django"],
    tools: ["Git", "Docker", "Linux", "Figma", "Vercel"],
    learning: ["Godot Engine", "Affinity"],
  },

  // ── İLGİ ALANLARI ────────────────────────────────────────────────────────
  interests: [
    "compilers",
    "systems programming",
    "open-source",
    "graphic design",
    "linux",
    "game dev concepts",
    "Jungian psychology",
    "competitive gaming",
  ],
  // API Explorer'daki gündelik/eğlenceli kısa ilgi listesi.
  casualInterests: ["games", "linux", "anime", "design", "ai", "basically tech"],

  // ── SOSYAL / İLETİŞİM ────────────────────────────────────────────────────
  social: {
    email: "nazimcanislam@gmail.com",
    github: "github.com/nazimcanislam",
    linkedin: "linkedin.com/in/nazimcanislam",
  },
} as const;

/** profile.birth'ten güncel yaşı hesaplar. */
export function getAge(): number {
  const { year, month, day } = profile.birth;
  const today = new Date();
  const age = today.getFullYear() - year;
  const hasBirthdayPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  return hasBirthdayPassed ? age : age - 1;
}
