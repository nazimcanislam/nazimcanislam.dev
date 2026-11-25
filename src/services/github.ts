import { getLanguageColor } from "@constants/language-colors";
import type { Lang } from "@i18n/translations";

export interface Repo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  fork: boolean;
}

export interface RepoWithLangs extends Repo {
  languages: string[];
}

export interface LanguageStat {
  name: string;
  bytes: number;
  pct: number;
  color: string;
}

export interface GitHubProjectsResult {
  repos: RepoWithLangs[];
  languageStats: LanguageStat[];
  fetchError: boolean;
}

/**
 * Build zamanında GitHub API'den açık kaynak repoları ve dil dağılımını çeker.
 * Opsiyonel `GITHUB_TOKEN` tanımlıysa rate-limit 5000/saat'e çıkar.
 */
export async function fetchPublicReposWithLanguageStats(
  username: string,
  token?: string,
): Promise<GitHubProjectsResult> {
  const headers: Record<string, string> = {
    "User-Agent": "nazimcanislam.dev",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let baseRepos: Repo[] = [];
  let fetchError = false;

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=public`,
      { headers },
    );
    if (res.ok) {
      const data = (await res.json()) as Repo[];
      baseRepos = data.filter((r) => !r.fork);
    } else {
      fetchError = true;
    }
  } catch {
    fetchError = true;
  }

  const perRepoBytes: Array<Record<string, number>> = await Promise.all(
    baseRepos.map(async (repo) => {
      const fallback = repo.language ? { [repo.language]: 1 } : {};
      try {
        const res = await fetch(
          `https://api.github.com/repos/${repo.full_name}/languages`,
          { headers },
        );
        if (!res.ok) return fallback;
        const bytes = (await res.json()) as Record<string, number>;
        return bytes && Object.keys(bytes).length > 0 ? bytes : fallback;
      } catch {
        return fallback;
      }
    }),
  );

  const repos: RepoWithLangs[] = baseRepos.map((repo, i) => ({
    ...repo,
    languages: Object.keys(perRepoBytes[i]),
  }));

  const aggregate: Record<string, number> = {};
  for (const bytes of perRepoBytes) {
    for (const [name, count] of Object.entries(bytes)) {
      aggregate[name] = (aggregate[name] ?? 0) + count;
    }
  }

  const totalBytes = Object.values(aggregate).reduce((sum, n) => sum + n, 0);

  const languageStats: LanguageStat[] = Object.entries(aggregate)
    .map(([name, bytes]) => ({
      name,
      bytes,
      pct: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return { repos, languageStats, fetchError };
}

/** GitHub gibi her zaman tek ondalık formatlar ("71,0" / "18,1"). */
export function formatPct(pct: number, lang: Lang): string {
  return pct.toLocaleString(lang === "tr" ? "tr-TR" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
