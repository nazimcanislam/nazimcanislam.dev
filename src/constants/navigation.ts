import { profile } from "@data/profile";

export interface NavLink {
  href: string;
  labelKey: string;
  icon: string;
  cmd: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/about", labelKey: "about", icon: "mdi:account", cmd: "about" },
  { href: "/uses", labelKey: "uses", icon: "mdi:laptop", cmd: "uses" },
  { href: "/projects", labelKey: "projects", icon: "mdi:code-tags", cmd: "projects" },
  { href: "/blog", labelKey: "blog", icon: "mdi:post", cmd: "blog" },
  { href: "/contact", labelKey: "contact", icon: "mdi:email", cmd: "contact" },
] as const;

export interface SocialLink {
  key: "github" | "linkedin" | "instagram" | "email";
  href: string;
  label: string;
  value: string;
  icon: string;
  external: boolean;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    key: "github",
    href: profile.socialUrls.github,
    label: "GitHub",
    value: profile.social.github,
    icon: "mdi:github",
    external: true,
  },
  {
    key: "linkedin",
    href: profile.socialUrls.linkedin,
    label: "LinkedIn",
    value: profile.social.linkedin,
    icon: "mdi:linkedin",
    external: true,
  },
  {
    key: "instagram",
    href: profile.socialUrls.instagram,
    label: "Instagram",
    value: profile.social.instagram,
    icon: "mdi:instagram",
    external: true,
  },
  {
    key: "email",
    href: profile.socialUrls.email,
    label: "nazimcanislam",
    value: profile.social.email,
    icon: "mdi:email",
    external: false,
  },
] as const;
