// Generic "copy this field's value to the clipboard" behavior. Any number of
// [data-copy-trigger] elements can point at the same source (by id) — e.g.
// an icon button and a separate "Copy to clipboard" link both copying the
// same field, each with its own icon/label swap feedback. The source
// element's data-copy-text (an explicit, pre-formatted string) is preferred
// over its rendered textContent, since scraping textContent across
// multiple sibling <p> paragraphs concatenates them with no separation.
export function initCopyToClipboard(): void {
  document.querySelectorAll<HTMLElement>('[data-copy-trigger]').forEach((trigger) => {
    // Avoid double-binding after view transitions
    if (trigger.dataset.copyBound) return;
    trigger.dataset.copyBound = '1';

    const label = trigger.querySelector<HTMLElement>('.js-copy-label');
    const originalLabel = label?.textContent ?? '';

    trigger.addEventListener('click', async () => {
      const source = document.getElementById(trigger.dataset.copyTrigger!);
      const value = source?.dataset.copyText ?? source?.textContent?.trim() ?? '';

      try {
        await navigator.clipboard.writeText(value);
      } catch {
        // Fallback for non-HTTPS or older browsers
        const el = document.createElement('textarea');
        el.value = value;
        el.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }

      trigger.querySelector('.js-copy-icon')?.classList.add('hidden');
      trigger.querySelector('.js-check-icon')?.classList.remove('hidden');
      if (label) label.textContent = 'Copied!';
      setTimeout(() => {
        trigger.querySelector('.js-copy-icon')?.classList.remove('hidden');
        trigger.querySelector('.js-check-icon')?.classList.add('hidden');
        if (label) label.textContent = originalLabel;
      }, 2000);
    });
  });
}
