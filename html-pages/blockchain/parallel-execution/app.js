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

  // ---------------------------------------------------------------------------
  // Optimistic execution simulator
  // ---------------------------------------------------------------------------
  const sim = document.querySelector('[data-sim]');
  if (!sim) return;

  const ACCOUNTS = ['A', 'B', 'C', 'D'];
  const INITIAL = { A: 1000, B: 500, C: 800, D: 0 };

  const TX_DEFS = [
    { id: 'T1', name: 'A → B 转账 100', reads: ['A', 'B'], writes: ['A', 'B'],
      run: (s) => { s.A -= 100; s.B += 100; } },
    { id: 'T2', name: 'C → D 转账 50', reads: ['C', 'D'], writes: ['C', 'D'],
      run: (s) => { s.C -= 50; s.D += 50; } },
    { id: 'T3', name: 'A/B 池 swap 10%', reads: ['A', 'B'], writes: ['A', 'B'],
      run: (s) => { const x = Math.floor(s.A * 0.1); s.A -= x; s.B += x; } },
    { id: 'T4', name: 'B → C 转账 20', reads: ['B', 'C'], writes: ['B', 'C'],
      run: (s) => { s.B -= 20; s.C += 20; } },
    { id: 'T5', name: 'A → D 转账 5', reads: ['A', 'D'], writes: ['A', 'D'],
      run: (s) => { s.A -= 5; s.D += 5; } },
    { id: 'T6', name: '只读查询 A', reads: ['A'], writes: [],
      run: () => {} },
  ];

  // Serial execution: the ground truth every parallel run must match.
  const serialState = () => {
    const s = { ...INITIAL };
    TX_DEFS.forEach((tx) => tx.run(s));
    return s;
  };
  const SERIAL_FINAL = serialState();

  const els = {
    accounts: sim.querySelector('[data-sim-accounts]'),
    txs: sim.querySelector('[data-sim-txs]'),
    log: sim.querySelector('[data-sim-log]'),
    round: sim.querySelector('[data-sim-round]'),
    next: sim.querySelector('[data-sim-next]'),
    play: sim.querySelector('[data-sim-play]'),
    reset: sim.querySelector('[data-sim-reset]'),
    verdict: sim.querySelector('[data-sim-verdict]'),
  };

  let state;
  let timer = null;
  let busy = false;

  const fmt = (v) => {
    if (v === undefined) return '–';
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
  };

  const reset = () => {
    stopAuto();
    state = {
      committed: { ...INITIAL },
      round: 0,
      done: false,
      results: [], // per tx in current round: { observed, writes }
      statuses: TX_DEFS.map(() => 'pending'),
      notes: TX_DEFS.map(() => ''),
      replays: 0,
    };
    busy = false;
    if (els.verdict) {
      els.verdict.textContent = '串行基线：A=805 · B=670 · C=770 · D=55';
      els.verdict.className = 'verdict';
    }
    renderLog([
      ['开始', '6 笔交易按区块顺序排列。点击「下一轮」看它们如何并行执行、按序校验。'],
    ]);
    render();
  };

  const renderAccounts = () => {
    if (!els.accounts) return;
    els.accounts.innerHTML = ACCOUNTS.map((key) => {
      const changed = state.statuses.some((status, i) =>
        status === 'committed' && state.lastCommitted?.includes(i) && TX_DEFS[i].writes.includes(key));
      return `
        <div class="account-chip${changed ? ' changed' : ''}" data-account="${key}">
          <b>账户 ${key}</b>
          <span>${fmt(state.committed[key])}</span>
          <small>${changed ? '本轮已更新' : '已提交状态'}</small>
        </div>`;
    }).join('');
  };

  const renderTxs = () => {
    if (!els.txs) return;
    els.txs.innerHTML = TX_DEFS.map((tx, i) => {
      const status = state.statuses[i];
      const note = state.notes[i] || (status === 'pending' ? '等待下一轮' : '');
      const rw = [
        ...tx.reads.map((k) => `<span class="rw read">r:${k}</span>`),
        ...tx.writes.map((k) => `<span class="rw write">w:${k}</span>`),
      ].join('');
      return `
        <div class="tx-card" data-status="${status}" data-tx="${i}">
          <span class="tx-id">${tx.id}<em>#${i + 1}</em></span>
          <div class="tx-rw">${rw}</div>
          <span class="tx-state">${note}</span>
        </div>`;
    }).join('');
  };

  const render = () => {
    renderAccounts();
    renderTxs();
    if (els.round) {
      els.round.textContent = state.done
        ? `完成 · ${state.round} 轮 · 重放 ${state.replays} 次`
        : `第 ${state.round} 轮`;
    }
    if (els.next) els.next.disabled = state.done || busy;
    if (els.play) els.play.disabled = state.done;
  };

  const renderLog = (lines) => {
    if (!els.log) return;
    els.log.innerHTML = lines
      .map(([tag, text]) => `<div class="log-line"><b>${tag}</b><span>${text}</span></div>`)
      .join('');
  };

  const logForRound = (phase, payload) => {
    if (phase === 'exec') {
      renderLog([
        ['执行', `第 ${payload.round} 轮：${payload.pending.length} 笔未提交交易各读一份本轮快照，并行执行并缓冲写入。`],
        ['记录', payload.txs.map((t) => `${t.id} 读 ${t.observedText} → 写 ${t.writesText}`).join('；')],
      ]);
      return;
    }
    const lines = [
      ['校验', '按区块顺序逐笔校验读集：读到的值仍然是最新值才允许提交。'],
    ];
    payload.steps.forEach((step) => {
      lines.push([
        step.ok ? '提交' : '重放',
        step.ok
          ? `${step.id} 读集未变，写入 ${step.writesText}`
          : `${step.id} 读到的 ${step.conflictKey}=${fmt(step.oldValue)}，但已被改为 ${fmt(step.newValue)}，需要重放`,
      ]);
    });
    if (payload.done) {
      lines.push([
        '完成',
        `全部提交，最终状态与串行执行${payload.match ? '一致 ✅' : '不一致 ❌'}`,
      ]);
    }
    renderLog(lines);
  };

  const runRound = () => {
    if (state.done || busy) return;
    busy = true;
    state.round += 1;
    const round = state.round;
    const pending = TX_DEFS
      .map((tx, i) => ({ tx, i }))
      .filter(({ i }) => state.statuses[i] !== 'committed');

    // Phase 1: execute every pending tx against the same committed snapshot.
    const snapshot = { ...state.committed };
    state.lastCommitted = [];
    state.results = TX_DEFS.map(() => null);
    state.statuses = state.statuses.map((s) => (s === 'committed' ? s : 'running'));
    state.notes = state.notes.map((_, i) => (state.statuses[i] === 'running' ? '读快照…' : '已提交'));

    const roundResults = pending.map(({ tx, i }) => {
      const view = { ...snapshot };
      tx.run(view);
      const writes = {};
      tx.writes.forEach((k) => { writes[k] = view[k]; });
      const observed = {};
      tx.reads.forEach((k) => { observed[k] = snapshot[k]; });
      state.results[i] = { observed, writes };
      const writesText = Object.keys(writes).length
        ? Object.entries(writes).map(([k, v]) => `${k}=${fmt(v)}`).join(' ')
        : '无';
      state.notes[i] = `读 ${tx.reads.map((k) => `${k}=${fmt(observed[k])}`).join(' ')} → 写 ${writesText}`;
      return {
        id: tx.id,
        observedText: tx.reads.map((k) => `${k}=${fmt(observed[k])}`).join(' '),
        writesText,
      };
    });
    state.lastCommitted = [];
    render();
    logForRound('exec', { round, pending, txs: roundResults });

    const commitPhase = () => {
      const steps = [];
      pending.forEach(({ tx, i }) => {
        const { observed, writes } = state.results[i];
        const conflictKey = tx.reads.find((k) => state.committed[k] !== observed[k]);
        if (conflictKey !== undefined) {
          state.statuses[i] = 'redo';
          state.replays += 1;
          state.notes[i] = `重放：${conflictKey} 已变`;
          steps.push({
            id: tx.id,
            ok: false,
            conflictKey,
            oldValue: observed[conflictKey],
            newValue: state.committed[conflictKey],
          });
          return;
        }
        state.statuses[i] = 'committed';
        Object.assign(state.committed, writes);
        state.lastCommitted.push(i);
        state.notes[i] = Object.keys(writes).length
          ? `提交 ${Object.entries(writes).map(([k, v]) => `${k}=${fmt(v)}`).join(' ')}`
          : '提交（只读）';
        steps.push({
          id: tx.id,
          ok: true,
          writesText: Object.keys(writes).length
            ? Object.entries(writes).map(([k, v]) => `${k}=${fmt(v)}`).join(' ')
            : '无',
        });
      });

      // Reset 'redo' cards to pending for the next round.
      state.statuses = state.statuses.map((s) => (s === 'redo' ? 'pending' : s));
      const done = state.statuses.every((s) => s === 'committed');
      state.done = done;
      const match = ACCOUNTS.every((k) => state.committed[k] === SERIAL_FINAL[k]);
      busy = false;

      render();
      logForRound('validate', { steps, done, match });

      if (done) {
        if (els.verdict) {
          els.verdict.textContent = match
            ? `最终状态与串行执行一致：A=${fmt(state.committed.A)} · B=${fmt(state.committed.B)} · C=${fmt(state.committed.C)} · D=${fmt(state.committed.D)} ✅`
            : '最终状态与串行执行不一致';
          els.verdict.className = `verdict${match ? ' ok' : ''}`;
        }
        stopAuto();
      } else if (timer) {
        timer = setTimeout(runRound, reduceMotion ? 400 : 1800);
      }
    };

    if (reduceMotion) {
      commitPhase();
    } else {
      timer = setTimeout(commitPhase, 850);
    }
  };

  const stopAuto = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (els.play) els.play.textContent = '自动播放';
  };

  els.next?.addEventListener('click', () => {
    stopAuto();
    runRound();
  });

  els.play?.addEventListener('click', () => {
    if (timer) {
      stopAuto();
      return;
    }
    if (state.done) reset();
    els.play.textContent = '暂停';
    runRound();
  });

  els.reset?.addEventListener('click', reset);

  reset();
})();
