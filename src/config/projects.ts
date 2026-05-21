import type { ProjectConfig } from '../lib/github-projects-loader';

/**
 * Projects shown on the home page and eventually a /projects page.
 * Order here = display order (featured ones bubble up to the home grid).
 *
 * descriptionOverride is optional — omit it to use the live GitHub description.
 */
export const PROJECTS: ProjectConfig[] = [
  {
    repo: 'hierynomus/sshj',
    featured: true,
  },
  {
    repo: 'hierynomus/smbj',
    featured: true,
  },
  {
    repo: 'hierynomus/license-gradle-plugin',
    featured: false,
  },
];
