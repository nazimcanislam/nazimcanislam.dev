import type { Localized } from "./profile";

export interface UseItem {
  emoji: string;
  title: string;
  description: Localized;
  link?: string;
}

export interface UseCategory {
  id: string;
  title: Localized;
  items: UseItem[];
}

export const usesData: UseCategory[] = [
  {
    id: "hardware",
    title: { tr: "Donanım & Çevre Birimleri", en: "Hardware & Peripherals" },
    items: [
      {
        emoji: "💻",
        title: "Monster Notebook Abra A5 V20.4.2",
        description: {
          tr: "Windows 11 Pro üzerinde çalışan; i5-12450H işlemci, RTX 4050 ekran kartı ve 32 GB RAM ile günlük yazılım geliştirme, grafik tasarım ve oyun projelerimi sırtlayan ana bilgisayarım.",
          en: "Running on Windows 11 Pro with an i5-12450H CPU, RTX 4050 GPU, and 32 GB RAM; my primary machine for daily software development, graphic design, and gaming.",
        },
        link: "https://www.monsternotebook.com.tr/abra/monster-abra-a5-v20-4-2",
      },
      {
        emoji: "🖱️",
        title: "Pusat V11 Oyuncu Mouse & Clutch Gamepad",
        description: {
          tr: "Günlük hassas imleç kontrolü, rekabetçi oyunlar ve hikaye odaklı yapımlar için masaüstü kontrol ikilim.",
          en: "My desktop control duo for precise daily navigation, competitive matches, and story-driven games.",
        },
      },
      {
        emoji: "🎧",
        title: "Pusat 7.1 Surround Lite RGB & Samsung Galaxy Buds2",
        description: {
          tr: "Masa başında oyun ve odaklanma seansları için Pusat kulaklığımı, dışarıda ve mobil kullanımda ise Galaxy Buds2'yi tercih ediyorum.",
          en: "I use the Pusat headset for desktop gaming and focus sessions, and Galaxy Buds2 while on the go.",
        },
      },
      {
        emoji: "📱",
        title: "Samsung Galaxy A54 5G & Galaxy Watch6 Classic",
        description: {
          tr: "Günlük iletişim, bildirim takibi ve sağlık verilerim için kullandığım mobil ekosistemim.",
          en: "My daily mobile ecosystem for communication, notifications, and health tracking.",
        },
      },
    ],
  },
  {
    id: "software",
    title: { tr: "Yazılım & Geliştirme Araçları", en: "Software & Dev Tools" },
    items: [
      {
        emoji: "🛠️",
        title: "Visual Studio Code",
        description: {
          tr: "Ana kod editörüm. Koyu tema, özelleştirilmiş kısayollar ve minimalist eklenti kurulumuyla kullanıyorum.",
          en: "My primary code editor, configured with a dark theme, custom shortcuts, and a minimalist extension setup.",
        },
        link: "https://code.visualstudio.com/",
      },
      {
        emoji: "🚀",
        title: "Astro & TypeScript",
        description: {
          tr: "Bu kişisel web sitem de dahil olmak üzere hızlı, statik ve içerik odaklı modern web projelerimdeki ilk tercihim.",
          en: "My go-to stack for fast, static, and content-focused modern web projects, including this portfolio.",
        },
        link: "https://astro.build/",
      },
      {
        emoji: "🎨",
        title: "Figma & Affinity Designer",
        description: {
          tr: "Arayüz (UI/UX) prototipleme, vektörel illüstrasyon ve dijital grafik tasarım süreçlerimde kullandığım tasarım ikilim.",
          en: "My design duo for UI/UX prototyping, vector illustrations, and digital graphic design workflows.",
        },
        link: "https://www.figma.com/",
      },
      {
        emoji: "⚡",
        title: "Bun, uv & Docker",
        description: {
          tr: "JavaScript/TypeScript ve Python projelerinde paket yönetimini hızlandırmak ve izole geliştirme ortamları kurmak için kullanıyorum.",
          en: "Used to speed up package management in JS/TS and Python projects and run isolated development environments.",
        },
      },
      {
        emoji: "🧠",
        title: "Obsidian",
        description: {
          tr: "Teknik notlarımı, proje fikirlerimi ve kişisel arşivimi Markdown formatında düzenli tuttuğum ikinci beynim.",
          en: "My second brain for keeping technical notes, project ideas, and personal archives organized in Markdown.",
        },
        link: "https://obsidian.md/",
      },
      {
        emoji: "✨",
        title: "Google Gemini",
        description: {
          tr: "Kodlama süreçlerinde fikir alışverişi yapmak, hata ayıklamak ve içerik üretmek için kullandığım yapay zeka asistanım.",
          en: "My AI pair-programmer and brainstorming assistant for coding, debugging, and content creation.",
        },
        link: "https://gemini.google.com/",
      },
    ],
  },
  {
    id: "games",
    title: { tr: "Oyunlar", en: "Games" },
    items: [
      {
        emoji: "⚔️",
        title: "League of Legends",
        description: {
          tr: "Rekabetçi ruhumu canlı tuttuğum ana MOBA oyunum. Mekanik derinliği yüksek şampiyonlarla (özellikle Zed) oynamayı seviyorum.",
          en: "My main competitive MOBA where I enjoy mastering mechanically intensive champions, especially Zed.",
        },
      },
      {
        emoji: "⛏️",
        title: "Minecraft (Java Edition)",
        description: {
          tr: "Fabric, Iris ve shader paketleriyle görsel olarak zenginleştirdiğim; yaratıcılık ve keşif odaklı kaçış noktam.",
          en: "My creative sandbox escape, visually enhanced with Fabric, Iris, and custom shader packs.",
        },
      },
      {
        emoji: "🌌",
        title: "Neverness to Everness (NTE)",
        description: {
          tr: "Doğaüstü şehir atmosferi ve takım sinerjileriyle keyifle vakit geçirdiğim açık dünya aksiyon RPG oyunu.",
          en: "An open-world action RPG I enjoy for its supernatural urban atmosphere and team synergy mechanics.",
        },
      },
      {
        emoji: "🎖️",
        title: "Command & Conquer: Generals – Zero Hour",
        description: {
          tr: "Strateji türündeki vazgeçilmez klasiğim. Yıllar geçse de taktiksel derinliğinden hiçbir şey kaybetmeyen efsane.",
          en: "My all-time favorite RTS classic that never loses its tactical charm even after all these years.",
        },
      },
    ],
  },
];
