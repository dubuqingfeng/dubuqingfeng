(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = `${ratio * 100}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

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

  const player = document.querySelector('[data-lifecycle-player]');
  if (player) {
    const nodes = {
      create: player.querySelector('[data-lifecycle-node="create"]'),
      execute: player.querySelector('[data-lifecycle-node="execute"]'),
      freeze: player.querySelector('[data-lifecycle-node="freeze"]'),
      squash: player.querySelector('[data-lifecycle-node="squash"]'),
      drop: player.querySelector('[data-lifecycle-node="drop"]'),
    };
    const caption = player.querySelector('[data-lifecycle-caption]');
    const counter = player.querySelector('[data-lifecycle-counter]');
    const playButton = player.querySelector('[data-lifecycle-play]');
    const prevButton = player.querySelector('[data-lifecycle-prev]');
    const nextButton = player.querySelector('[data-lifecycle-next]');

    const steps = [
      { key: 'create', text: 'new_from_parent：先 freeze 父节点，再共享 AccountsDB，分配新的 bank_id，并挂上 parent 指针。' },
      { key: 'execute', text: 'Bank 把交易交给 SVM：验证、加载账户、执行指令，得到 ProcessedTransaction。' },
      { key: 'freeze', text: 'freeze：阻止新提交，完成费用/slot history/incinerator 收尾，等待 lt hash，再计算 bank hash。' },
      { key: 'squash', text: 'squash：对自身及父链 add_root，清空 parent 指针，把 root 写入 status cache。' },
      { key: 'drop', text: 'drop：未 root 的 slot 从缓存清理；已 root 的 slot 进入持久化与快照生命周期。' },
    ];

    let current = 0;
    let timer = null;

    const render = () => {
      Object.values(nodes).forEach((node) => node && node.classList.remove('active'));
      if (nodes[steps[current].key]) nodes[steps[current].key].classList.add('active');
      if (caption) caption.textContent = steps[current].text;
      if (counter) counter.textContent = `${current + 1} / ${steps.length}`;
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
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

    document.querySelectorAll('[data-play-lifecycle]').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('freeze')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (!timer) play();
      });
    });

    render();
  }
})();
