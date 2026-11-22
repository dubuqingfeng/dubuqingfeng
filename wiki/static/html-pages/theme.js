(() => {
  const KEY = 'solana-html-theme';
  const root = document.documentElement;

  const apply = (theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', theme === 'dark' ? '切换到日间模式' : '切换到夜间模式');
      button.setAttribute('title', theme === 'dark' ? '切换到日间模式' : '切换到夜间模式');
      const icon = button.querySelector('[data-theme-icon]');
      if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
    });
  };

  let stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch (_) {
    stored = null;
  }

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(stored || (systemDark ? 'dark' : 'light'));

  const bind = () => {
    apply(root.dataset.theme || (systemDark ? 'dark' : 'light'));
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem(KEY, next);
        } catch (_) {
          // localStorage can be unavailable in private or sandboxed contexts.
        }
        apply(next);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = (event) => {
    let hasStored = false;
    try {
      hasStored = Boolean(localStorage.getItem(KEY));
    } catch (_) {
      hasStored = false;
    }
    if (!hasStored) apply(event.matches ? 'dark' : 'light');
  };
  if (media.addEventListener) media.addEventListener('change', onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange);
})();
