// Shared site-theme (corp/tech) state, imported by every tech-theme-aware
// client script (ThemeSwitcher, BootSequence, NavProgress, CommandPalette).
// Keeping this in one place means there's exactly one implementation of
// "is tech active" and "set the theme", instead of each component
// re-deriving/re-mutating dataset.siteTheme independently and risking drift
// (e.g. a caller that forgets to sync ThemeSwitcher's aria-pressed state).

export function isTechTheme(): boolean {
  return document.documentElement.dataset.siteTheme === 'tech';
}

export function setSiteTheme(theme: 'corp' | 'tech'): void {
  if (theme === 'tech') {
    document.documentElement.dataset.siteTheme = 'tech';
  } else {
    delete document.documentElement.dataset.siteTheme;
  }
  localStorage.setItem('site-theme', theme);

  document.querySelectorAll<HTMLButtonElement>('#theme-switch-corp, #theme-switch-tech').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.id === `theme-switch-${theme}`));
  });

  // No same-page "activated tech" event/boot-animation trigger here anymore:
  // corp and tech are separate route trees now, so setSiteTheme('tech') is
  // always immediately followed by a real navigation (see ThemeSwitcher /
  // CommandPalette). BootSequence's own unconditional "play once per session
  // on first tech page-load" already covers the switch correctly — an event
  // fired here would race that navigation and get lost before ever painting.
}

// Corp and tech are two parallel, statically-generated route trees (corp at
// "/", tech at "/dev") that mirror each other by simple path prefix for most
// pages — except where a /dev page's content/framing diverges enough from
// its corp counterpart that it isn't at the mirrored path (e.g. corp's
// "/about" is tech's "/dev/profile", not "/dev/about" — see the profile.yml
// redesign). Exported as plain data, not folded into devPath/corpPath's
// closures, so the is:inline pre-paint scripts in Layout.astro/
// ExperimentLayout.astro — which can't use `import` since they must run
// synchronously before paint — can still inject it via Astro's
// define:vars instead of hand-duplicating the mapping in multiple files.
export const PATH_OVERRIDES: [corp: string, dev: string][] = [
  ['/about', '/dev/profile'],
];

// These map a path from one tree to its counterpart in the other, used by
// ThemeSwitcher/CommandPalette (explicit switch = navigate to "the same
// content, other theme") and by the corp/dev pre-paint redirects.
export function devPath(path: string): string {
  const override = PATH_OVERRIDES.find(([corp]) => corp === path);
  if (override) return override[1];
  return path === '/' ? '/dev' : `/dev${path}`;
}

export function corpPath(path: string): string {
  const override = PATH_OVERRIDES.find(([, dev]) => dev === path);
  if (override) return override[0];
  const stripped = path.replace(/^\/dev/, '');
  return stripped === '' ? '/' : stripped;
}
