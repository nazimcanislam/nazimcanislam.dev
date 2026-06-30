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

/**
 * Yıl + ay (ay 1–12). Hem "Şub 2023" gösterimi hem de otomatik süre
 * ("1 yıl 3 ay") hesabı için kullanılır.
 *   örn. Şubat 2023 → { year: 2023, month: 2 }
 */
export type YearMonth = { year: number; month: number };

/** Çalışma türü — alt pozisyonun yanında küçük bir rozet olarak görünür. */
export type Employment = "full-time" | "part-time" | "internship";

/**
 * Bir kariyer durağı İÇİNDEKİ alt pozisyon (LinkedIn'deki gibi).
 * Aynı kurumda pozisyon/unvan değiştikçe `roles` dizisine bir satır ekle.
 * Her pozisyonun süresi otomatik hesaplanır.
 */
export type CareerRole = {
  /** Pozisyon / unvan. */
  title: Localized;
  /** Başlangıç (yıl + ay). */
  start: YearMonth;
  /** Bitiş (yıl + ay); hâlâ sürüyorsa null. */
  end: YearMonth | null;
  /** Şu an devam eden pozisyon mu? */
  current?: boolean;
  /** Çalışma türü rozeti (opsiyonel). */
  employment?: Employment;
};

/**
 * Kariyer zaman çizelgesindeki tek bir durak.
 * Yeni bir satır eklemek için `career` dizisine bu şekilde bir nesne ekle —
 * sıralama otomatik (start tarihine göre). Başka hiçbir yere dokunmana gerek yok.
 *
 * Tek bir kurumda birden fazla pozisyonda bulunduysan `roles` ekle: o zaman
 * başlık olarak KURUM gösterilir, pozisyonlar altında alt-kronoloji olarak
 * sıralanır ve durak süresi pozisyonlardan otomatik türetilir.
 */
export type CareerEntry = {
  /** Görsel kategori: rozet metnini ve nokta rengini belirler. */
  kind: "freelance" | "education" | "work" | "building";
  /** Başlangıç (yıl + ay). Sıralama ve süre bunu kullanır. */
  start: YearMonth;
  /** Bitiş (yıl + ay); hâlâ devam ediyorsa null bırak. */
  end: YearMonth | null;
  /** Şu an devam eden durak mı? (çizgide "şimdi" olarak vurgulanır) */
  current?: boolean;
  /** Pozisyon / başlık. (roles varsa gösterilmez; kurum başlık olur.) */
  title: Localized;
  /** Kurum/şirket adı (opsiyonel). */
  org?: Localized;
  /** Kuruma bağlanan link (opsiyonel). */
  orgUrl?: string;
  /** 1–2 cümlelik özet. */
  summary: Localized;
  /** Teknoloji / etiketler (opsiyonel). */
  tags?: string[];
  /** Opsiyonel alt-kronoloji: aynı kurumdaki farklı pozisyonlar. */
  roles?: CareerRole[];
};

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
    languages: ["HTML", "CSS", "JavaScript", "Python", "C"],
    frameworks: ["React", "Astro", "Node.js", "Django"],
    tools: ["Git", "Docker", "Linux", "Figma", "Vercel"],
    learning: ["Godot Engine", "Payload CMS", "Affinity"],
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
  casualInterests: [
    "games",
    "linux",
    "anime",
    "design",
    "ai",
    "basically tech",
  ],

  // ── KARİYER ZAMAN ÇİZELGESİ ──────────────────────────────────────────────
  // Hakkımda sayfasındaki "yolculuk" bölümü buradan beslenir.
  // SIRALAMA OTOMATİKTİR (start tarihine göre, en yeni en üstte); istediğin
  // sırada yazabilirsin. Tarihler { year, month } biçimindedir (month 1–12);
  // her durağın süresi ("1 yıl 3 ay") bunlardan otomatik hesaplanır.
  //
  // NOT: Aşağıdaki AYLAR yer tutucudur — gerçek başlangıç/bitiş aylarını
  // bildiğin değerlerle güncelle. Yıllar CV'ndeki değerlerle aynı.
  //
  // Aynı kurumda birden fazla pozisyon için `roles` ekle (Analythinx örneği).
  career: [
    {
      kind: "building",
      start: { year: 2025, month: 4 },
      end: null,
      current: true,
      title: {
        tr: "Bağımsız Üretim & Açık Kaynak",
        en: "Building Independently & Open Source",
      },
      org: { tr: "Kendi projelerim", en: "My own projects" },
      summary: {
        tr: "Kendi araçlarımı kurarak ve açık kaynağa katkıda bulunarak üretmeye devam ediyorum: video sıkıştırma için masaüstü uygulaması Shrinkify, Google Photos Takeout düzeltici gphotos-fixer ve Astro ile geliştirdiğim bu portföy sitesi. Kalıplarla değil, temelden düşünerek çözüyorum.",
        en: "Still building — shipping my own tools and contributing to open source: Shrinkify (a desktop app for video compression), gphotos-fixer (a Google Photos Takeout fixer), and this portfolio site built with Astro. I solve things by reasoning from first principles, not from templates.",
      },
      tags: [
        "Python",
        "Astro",
        "HTML",
        "CSS",
        "JavaScript",
        "TypeScript",
        "Open Source",
      ],
    },
    {
      kind: "work",
      // start/end roles'tan otomatik türetilir; yine de tutarlılık için yazılı.
      start: { year: 2023, month: 1 },
      end: { year: 2025, month: 4 },
      title: {
        tr: "Yazılım Geliştirici",
        en: "Software Developer",
      },
      org: { tr: "Analythinx", en: "Analythinx" },
      summary: {
        tr: "20 yaşında, diploma şartı aranmadan yalnızca kod incelemesiyle işe alındım. Ability ML Platform için React/TypeScript tabanlı SaaS arayüzleri geliştirdim, Figma tasarımlarını yeniden kullanılabilir bileşen sistemlerine dönüştürdüm ve Docker ile dağıtımı üstlendim. Brisa ve Şişecam gibi kurumsal müşterilerle doğrudan çalıştım.",
        en: "Hired at 20 with no degree required — purely on a code review. I built and maintained React/TypeScript SaaS interfaces for the Ability ML Platform, turned Figma designs into reusable component systems, and handled deployment with Docker. I worked directly with enterprise clients including Brisa and Şişecam.",
      },
      // Alt-kronoloji: aynı şirkette ilerleyen pozisyonlar (LinkedIn tarzı).
      roles: [
        {
          title: { tr: "Danışman", en: "Consultant" },
          start: { year: 2024, month: 2 },
          end: { year: 2025, month: 4 },
          employment: "full-time",
        },
        {
          title: {
            tr: "Junior Yazılım Mühendisi",
            en: "Junior Software Engineer",
          },
          start: { year: 2023, month: 10 },
          end: { year: 2024, month: 2 },
          employment: "full-time",
        },
        {
          title: {
            tr: "Junior Yazılım Geliştirici",
            en: "Junior Software Developer",
          },
          start: { year: 2023, month: 1 },
          end: { year: 2023, month: 10 },
          employment: "part-time",
        },
      ],
      tags: [
        "React",
        "React Email",
        "React Keycloak",
        "HTML",
        "CSS/SCSS",
        "JavaScript",
        "TypeScript",
        "Python",
        "Django",
        "Flask",
        "Flutter",
        "Docker",
        "DevOps",
        "MinIO",
        "Bash",
        "Linux",
        "Git",
        "GitHub",
        "Figma",
        "Documentating",
        "SaaS",
      ],
    },
    {
      kind: "education",
      start: { year: 2022, month: 9 },
      end: { year: 2026, month: 1 },
      title: {
        tr: "Bilgisayar Programcılığı",
        en: "Computer Programming",
      },
      org: { tr: "Ahmet Yesevi Üniversitesi", en: "Ahmet Yesevi University" },
      summary: {
        tr: "Ön lisans eğitimim. Şu anda DGS ile Bilgisayar Mühendisliği'ne dikey geçiş için hazırlanıyorum.",
        en: "My associate degree. Currently preparing for the DGS exam to transfer into a Computer Engineering bachelor's program.",
      },
      tags: [
        "C",
        "C++",
        "C#",
        "Java",
        "HTML/CSS/JavaScript",
        "DGS",
        "Computer Engineering",
      ],
    },
    {
      kind: "freelance",
      start: { year: 2018, month: 6 },
      end: { year: 2023, month: 1 },
      title: {
        tr: "Serbest Web Geliştirici",
        en: "Freelance Web Developer",
      },
      org: { tr: "Bağımsız", en: "Independent" },
      summary: {
        tr: "Daha 17 yaşında, üniversite söz konusu bile değilken ilk ücretli müşteri sitelerimi yapmaya başladım. Sigorta brokeri, oto galeri, tasarım stüdyosu, kargo firması, tur şirketi ve bir siyasi aday için ticari siteler geliştirdim; tasarımdan yayına alma sürecine kadar her şeyi tek başıma yönettim.",
        en: "At just 17, before university was even on the table, I started building paid client sites. I designed and shipped commercial sites for an insurance broker, a car dealership, a design studio, a courier company, a tour operator, and a political candidate — owning the whole process from design to deployment myself.",
      },
      tags: ["HTML/CSS", "JavaScript", "PHP", "Bootstrap"],
    },
    {
      kind: "education",
      start: { year: 2016, month: 9 },
      end: { year: 2020, month: 6 },
      title: {
        tr: "Bilişim/Web Tasarım",
        en: "IT/Web Design",
      },
      org: {
        tr: "Yakacık Mesleki ve Teknik Anadolu Lisesi",
        en: "Yakacık Vocational and Technical Anatolian High School",
      },
      summary: {
        tr: "Yazılım geliştirme temellerini lise yıllarımda attım. Okul müfredatının ötesine geçerek, kendi inisiyatifimle yürüttüğüm bireysel projeler ve araştırmalar sayesinde teknik becerilerimi erkenden geliştirmeye başladım. Bu süreç, sadece kod yazmayı öğrenmemi değil, aynı zamanda çözüm odaklı bir bakış açısı ve sürekli öğrenme disiplini kazanmamı sağladı.",
        en: "I laid the foundations of software development during my high school years. Going beyond the school curriculum, I proactively engaged in self-directed projects and research to advance my technical skills. This journey not only allowed me to master coding fundamentals but also fostered a solution-oriented mindset and a discipline for continuous learning.",
      },
      tags: [
        "HTML",
        "CSS",
        "JavaScript",
        "PHP",
        "Laravel",
        "ASP.NET",
        "C#",
        "Visual Basic",
        "Python",
        "Adobe Flash",
      ],
    },
  ] satisfies CareerEntry[],

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
