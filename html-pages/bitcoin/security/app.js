(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll progress */
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = `${ratio * 100}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* Reveal */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  /* Active nav link */
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const navTargets = navLinks
    .map((link) => {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') ? document.querySelector(href) : null;
    })
    .filter(Boolean);
  if ('IntersectionObserver' in window && navTargets.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-18% 0px -70% 0px', threshold: 0 });
    navTargets.forEach((target) => navObserver.observe(target));
  }

  /* CVE matrix filters */
  const filterBar = document.querySelector('[data-cve-filter]');
  if (filterBar) {
    const table = document.querySelector('[data-cve-table]');
    const rows = [...table.querySelectorAll('tbody tr')];
    const count = filterBar.querySelector('[data-filter-count]');
    let severity = 'all';
    let surface = 'all';

    const apply = () => {
      let shown = 0;
      rows.forEach((row) => {
        const visible = (severity === 'all' || row.dataset.severity === severity)
          && (surface === 'all' || row.dataset.surface === surface);
        row.classList.toggle('hidden', !visible);
        if (visible) shown++;
      });
      if (count) count.textContent = `显示 ${shown} / ${rows.length}`;
    };

    filterBar.querySelectorAll('[data-filter-severity]').forEach((button) => {
      button.addEventListener('click', () => {
        severity = button.dataset.filterSeverity;
        filterBar.querySelectorAll('[data-filter-severity]').forEach((item) => {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
    filterBar.querySelectorAll('[data-filter-surface]').forEach((button) => {
      button.addEventListener('click', () => {
        surface = button.dataset.filterSurface;
        filterBar.querySelectorAll('[data-filter-surface]').forEach((item) => {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  /* Compact block attack player */
  const compact = document.querySelector('[data-compact-player]');
  if (compact) {
    const nodes = {};
    compact.querySelectorAll('[data-compact-node]').forEach((node) => {
      nodes[node.dataset.compactNode] = node;
    });
    const caption = compact.querySelector('[data-compact-caption]');
    const counter = compact.querySelector('[data-compact-counter]');
    const playButton = compact.querySelector('[data-compact-play]');
    const nextButton = compact.querySelector('[data-compact-next]');
    const modeTabs = [...compact.querySelectorAll('[data-compact-mode]')];

    const modes = {
      normal: [
        { nodes: ['peer'], text: 'Peer 发送 cmpctblock：区块头 + short ID 列表。节点先假定自己能从 mempool 或 extra pool 补齐。' },
        { nodes: ['init'], text: 'InitData 用 short ID 在 mempool 中查找交易，记录哪些位置还缺交易。' },
        { nodes: ['request'], text: '缺失交易通过 getblocktxn 向同一个 peer 请求。' },
        { nodes: ['fill'], text: '收到 blocktxn，FillBlock 重建区块；随后立刻 header.SetNull()、txn_available.clear()，让状态不可复用。' },
        { nodes: ['mutate'], text: 'IsBlockMutated 同时检查 merkle root 和 witness root；正常区块通过。' },
        { nodes: ['process'], text: 'RemoveBlockRequest 清掉 in-flight 状态，区块进入 ProcessBlock / 完整验证。' },
      ],
      replay: [
        { nodes: ['peer'], text: '攻击者先发 cmpctblock，制造一个会失败的紧凑区块重建。' },
        { nodes: ['init'], text: 'InitData 照常填充，节点准备请求缺失交易。' },
        { nodes: ['fill'], text: 'blocktxn 中的交易不承诺在 merkle root 里，FillBlock 返回失败；旧代码回退 GETDATA，但把 PartiallyDownloadedBlock 留在请求表里。' },
        { nodes: ['request'], text: '节点向同一个 peer 请求完整区块，等待最多 10 分钟。' },
        { nodes: ['fill', 'mutate'], danger: true, text: '第二个 blocktxn 到达。旧代码再次 FillBlock，命中“只能调用一次”的断言，节点崩溃；这是 CVE-2024-35202。' },
        { nodes: ['process'], text: '修复后 header 已为空：ProcessCompactBlockTxns 直接 RemoveBlockRequest + Misbehaving，不再调用 FillBlock。' },
      ],
      malleate: [
        { nodes: ['peer'], text: '攻击者发送 cmpctblock，short ID 对应 txid；witness 不在 txid 的承诺内。' },
        { nodes: ['init'], text: '节点从 mempool 或 blocktxn 补齐交易，表面上 merkle root 可以成立。' },
        { nodes: ['fill'], text: 'blocktxn 中交易的 witness 被篡改；txid 不变，但 witness commitment 已经不同。' },
        { nodes: ['mutate'], danger: true, text: '旧逻辑在重建后过早清掉下载状态，再检查 witness；失败后回退到同一个 peer 的 GETDATA。IsBlockMutated 现在在 FillBlock 返回 OK 前执行。' },
        { nodes: ['request'], text: 'first-in-flight 的 peer 获得一次 GETDATA 回退；攻击者控制 3 个 high-bandwidth peer，或节点运行 -blocksonly 时，可反复制造 10 分钟等待。' },
        { nodes: ['process'], text: '修复后 READ_STATUS_FAILED 且下载状态不可复用；重复的 compact block / blocktxn 会被移除并惩罚。' },
      ],
    };

    let mode = 'normal';
    let current = 0;
    let timer = null;

    const render = () => {
      compact.querySelectorAll('.compact-node').forEach((node) => {
        node.classList.remove('active', 'danger');
      });
      const step = modes[mode][current];
      step.nodes.forEach((key) => {
        const node = nodes[key];
        if (!node) return;
        node.classList.add('active');
        if (step.danger) node.classList.add('danger');
      });
      if (caption) caption.textContent = step.text;
      if (counter) counter.textContent = `${current + 1} / ${modes[mode].length}`;
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (playButton) playButton.textContent = '播放';
    };

    const go = (index) => {
      const len = modes[mode].length;
      current = (index + len) % len;
      render();
    };

    const play = () => {
      if (timer) {
        stop();
        return;
      }
      if (current === modes[mode].length - 1) go(0);
      if (playButton) playButton.textContent = '暂停';
      render();
      timer = setInterval(() => {
        if (current === modes[mode].length - 1) {
          stop();
          return;
        }
        go(current + 1);
      }, reduceMotion ? 1100 : 2200);
    };

    const selectMode = (name, start = false) => {
      if (!modes[name]) return;
      stop();
      mode = name;
      current = 0;
      modeTabs.forEach((tab) => {
        const active = tab.dataset.compactMode === name;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      render();
      if (start) play();
    };

    modeTabs.forEach((tab) => {
      tab.addEventListener('click', () => selectMode(tab.dataset.compactMode));
    });
    if (nextButton) nextButton.addEventListener('click', () => { stop(); go(current + 1); });
    if (playButton) playButton.addEventListener('click', play);

    document.querySelectorAll('[data-play-compact]').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('download')?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
        window.setTimeout(() => selectMode('replay', true), reduceMotion ? 50 : 520);
      });
    });

    render();
  }
})();
