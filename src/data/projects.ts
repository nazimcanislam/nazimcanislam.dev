import type { Badge } from "@/types/badge";

export interface FeaturedProject {
  title: string;
  description: { section: string; desc: string };
  url: string;
  tech: Badge[];
}

export const FEATURED_PROJECTS: readonly FeaturedProject[] = [
  {
    title: "metaweave",
    description: {
      section: "featured_projects",
      desc: "metaweave_desc",
    },
    url: "https://github.com/nazimcanislam/metaweave",
    tech: [
      {
        name: "Rust",
        color: "orange",
        theme: "tech",
      },
    ],
  },
  {
    title: "gphotos-fixer",
    description: {
      section: "featured_projects",
      desc: "gphotos_fixer_desc",
    },
    url: "https://github.com/nazimcanislam/gphotos-fixer",
    tech: [
      {
        name: "Python",
        color: "blue",
        theme: "tech",
      },
    ],
  },
  {
    title: "Shrinkify",
    description: {
      section: "featured_projects",
      desc: "shrinkify_desc",
    },
    url: "https://github.com/nazimcanislam/shrinkify",
    tech: [
      {
        name: "Python",
        color: "blue",
        theme: "tech",
      },
    ],
  },
];
