import type { Loader } from 'astro/loaders';

export interface ProjectConfig {
  /** GitHub repo in "owner/repo" form, e.g. "hierynomus/smbj" */
  repo: string;
  featured?: boolean;
  /** Override the GitHub description — useful when the repo blurb is too terse */
  descriptionOverride?: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  license: { spdx_id?: string; name?: string } | null;
  stargazers_count: number;
  forks_count: number;
}

/**
 * Astro Content Layer loader that fetches live GitHub metadata (description,
 * stars, forks, language, licence) for a list of repos at build time.
 *
 * Set GITHUB_TOKEN in the environment to raise the API rate limit from
 * 60 → 5 000 req/hour (useful in CI).
 */
export function githubProjectsLoader(projects: ProjectConfig[]): Loader {
  return {
    name: 'github-projects-loader',

    load: async ({ store, logger }) => {
      store.clear();

      const token = process.env.GITHUB_TOKEN;
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'hierynomus-site-build',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      for (const { repo, featured = false, descriptionOverride } of projects) {
        const url = `https://api.github.com/repos/${repo}`;
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) {
            logger.warn(`GitHub API returned ${res.status} for ${repo} — skipping`);
            continue;
          }
          const gh = (await res.json()) as GitHubRepo;

          store.set({
            id: repo.replace('/', '--'),
            data: {
              name: gh.name,
              description: descriptionOverride ?? gh.description ?? '',
              url: gh.html_url,
              language: gh.language ?? 'Unknown',
              license: gh.license?.spdx_id ?? gh.license?.name ?? 'Unknown',
              stars: gh.stargazers_count,
              forks: gh.forks_count,
              featured,
            },
          });
          logger.info(`Fetched ${repo}: ★${gh.stargazers_count}  ⑂${gh.forks_count}`);
        } catch (err) {
          logger.warn(`Failed to fetch GitHub data for ${repo}: ${err}`);
        }
      }
    },
  };
}
