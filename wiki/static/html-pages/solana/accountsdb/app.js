(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = `${ratio * 100}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Reveal on scroll
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // Write path player
  const player = document.querySelector('[data-player="write"]');
  if (player) {
    const nodes = {
      bank: player.querySelector('[data-node="bank"]'),
      cache: player.querySelector('[data-node="cache"]'),
      flush: player.querySelector('[data-node="flush"]'),
      file: player.querySelector('[data-node="file"]'),
      index: player.querySelector('[data-node="index"]'),
      clean: player.querySelector('[data-node="clean"]'),
    };
    const caption = player.querySelector('[data-step-caption]');
    const counter = player.querySelector('[data-step-counter]');
    const listItems = [...player.querySelectorAll('[data-step-list] li')];
    const playButton = player.querySelector('[data-step-play]');
    const prevButton = player.querySelector('[data-step-prev]');
    const nextButton = player.querySelector('[data-step-next]');

    const steps = [
      {
        nodes: ['bank'],
        caption: 'Bank 提交写集：Accounts::store_accounts 把账户变更交给 AccountsDB，此时还没有碰主索引。',
      },
      {
        nodes: ['bank', 'cache'],
        caption: 'write_accounts_to_cache：反向去重，同一批只保留每个 pubkey 的最后值；零 lamport 且无旧值时直接跳过。',
      },
      {
        nodes: ['cache'],
        caption: '账户进入 per-slot SlotCache。主索引完全不知道这条写入，读路径必须先查缓存。',
      },
      {
        nodes: ['flush'],
        caption: 'slot 成为 root，flush_accounts_cache 只处理 rooted slots；未 root 的状态不会落盘。',
      },
      {
        nodes: ['file', 'index'],
        caption: 'store_accounts_for_flush：写 AppendVec → 插入存储映射 → 更新索引 → 处理 reclaims。',
      },
      {
        nodes: ['index', 'clean'],
        caption: '移除缓存；后续 clean 删除旧版本，shrink 才物理回收字节，tombstone/obsolete 处理零 lamport。',
      },
    ];

    let current = 0;
    let timer = null;

    const render = () => {
      Object.values(nodes).forEach((node) => node && node.classList.remove('active'));
      steps[current].nodes.forEach((key) => nodes[key] && nodes[key].classList.add('active'));
      if (caption) caption.textContent = steps[current].caption;
      if (counter) counter.textContent = `${current + 1} / ${steps.length}`;
      listItems.forEach((item, index) => item.classList.toggle('active', index === current));
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (playButton) playButton.textContent = '播放';
    };

    const go = (index) => {
      current = (index + steps.length) % steps.length;
      render();
    };

    const play = () => {
      if (timer) {
        stop();
        return;
      }
      if (current === steps.length - 1) go(0);
      if (playButton) playButton.textContent = '暂停';
      render();
      timer = setInterval(() => {
        if (current === steps.length - 1) {
          stop();
          return;
        }
        go(current + 1);
      }, reduceMotion ? 900 : 1700);
    };

    if (prevButton) prevButton.addEventListener('click', () => { stop(); go(current - 1); });
    if (nextButton) nextButton.addEventListener('click', () => { stop(); go(current + 1); });
    if (playButton) playButton.addEventListener('click', play);

    document.querySelectorAll('[data-play-write]').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('write')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (!timer) play();
      });
    });

    render();
  }

  // Account form tabs
  document.querySelectorAll('[data-acct-tabs]').forEach((tabsRoot) => {
    const tabs = [...tabsRoot.querySelectorAll('[data-acct-view]')];
    const panels = [...tabsRoot.querySelectorAll('[data-acct-panel]')];
    if (!tabs.length || !panels.length) return;

    const render = (view) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.acctView === view;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.acctPanel !== view;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => render(tab.dataset.acctView));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const index = tabs.indexOf(tab);
        const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus();
        render(tabs[next].dataset.acctView);
      });
    });

    render(tabs[0].dataset.acctView);
  });

  // Fork / cache-first demo
  const forkDemo = document.querySelector('.fork-demo');
  if (forkDemo) {
    const result = forkDemo.querySelector('[data-fork-result]');
    const cacheRow = forkDemo.querySelector('[data-cache-row="102"]');
    const rows = [...forkDemo.querySelectorAll('[data-index-row]')];
    const buttons = [...forkDemo.querySelectorAll('[data-bank]')];

    const renderBank = (bank) => {
      buttons.forEach((button) => {
        button.classList.toggle('primary', button.dataset.bank === String(bank));
      });
      rows.forEach((row) => {
        row.classList.toggle('active', bank === 100 && row.dataset.indexRow === '100');
      });
      if (cacheRow) cacheRow.classList.toggle('active', bank === 102);
      if (result) {
        result.textContent = bank === 102
          ? '当前 Bank 102：先命中缓存 slot 102；如果缓存没有，再在索引里选祖先链上最高的可见 root。'
          : '当前 Bank 100：缓存里没有可见的 100 版本，回退到索引，选中 slot 100 的文件位置。';
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => renderBank(Number(button.dataset.bank)));
    });
    renderBank(102);
  }
})();
