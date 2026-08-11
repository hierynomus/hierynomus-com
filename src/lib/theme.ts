// Shared site-theme (corp/tech) state, imported by every tech-theme-aware
// client script (ThemeSwitcher, BootSequence, NavProgress, CommandPalette).
// Keeping this in one place means there's exactly one implementation of
// "is tech active" and "set the theme", instead of each component
// re-deriving/re-mutating dataset.siteTheme independently and risking drift
// (e.g. a caller that forgets to sync ThemeSwitcher's aria-pressed state).

export const TECH_ACTIVATED_EVENT = 'site-theme:activated-tech';

export function isTechTheme(): boolean {
  return document.documentElement.dataset.siteTheme === 'tech';
}

export function setSiteTheme(theme: 'corp' | 'tech'): void {
  const wasTech = isTechTheme();
  if (theme === 'tech') {
    document.documentElement.dataset.siteTheme = 'tech';
  } else {
    delete document.documentElement.dataset.siteTheme;
  }
  localStorage.setItem('site-theme', theme);

  document.querySelectorAll<HTMLButtonElement>('#theme-switch-corp, #theme-switch-tech').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.id === `theme-switch-${theme}`));
  });

  if (theme === 'tech' && !wasTech) {
    document.dispatchEvent(new CustomEvent(TECH_ACTIVATED_EVENT));
  }
}
