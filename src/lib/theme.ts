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

// Corp and tech are now two parallel, statically-generated route trees
// (corp at "/", tech at "/dev", mirrored 1:1) rather than one page CSS-toggled
// between two looks — these map a path from one tree to its counterpart in
// the other, used by ThemeSwitcher/CommandPalette (explicit switch = navigate
// to "the same content, other theme") and by the corp/dev pre-paint redirects.
export function devPath(path: string): string {
  return path === '/' ? '/dev' : `/dev${path}`;
}

export function corpPath(path: string): string {
  const stripped = path.replace(/^\/dev/, '');
  return stripped === '' ? '/' : stripped;
}
