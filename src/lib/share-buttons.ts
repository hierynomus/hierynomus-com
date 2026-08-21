// Shared copy-to-clipboard behavior for ShareButtons.astro (corp) and
// ShellShareButtons.astro (/dev) — same script, two differently-styled
// markup shells, so only the script needed extracting.
export function initShareButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-url]').forEach((btn) => {
    // Avoid double-binding after view transitions
    if (btn.dataset.copyBound) return;
    btn.dataset.copyBound = '1';

    btn.addEventListener('click', async () => {
      const url = btn.dataset.copyUrl!;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Fallback for non-HTTPS or older browsers
        const el = document.createElement('textarea');
        el.value = url;
        el.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      const copy = btn.querySelector('.js-copy-icon');
      const check = btn.querySelector('.js-check-icon');
      copy?.classList.add('hidden');
      check?.classList.remove('hidden');
      setTimeout(() => {
        copy?.classList.remove('hidden');
        check?.classList.add('hidden');
      }, 2000);
    });
  });
}
