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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // ---------------------------------------------------------------------------
  // Quote desk simulator
  // ---------------------------------------------------------------------------
  const sim = document.querySelector('[data-quote-sim]');
  if (!sim) return;

  const BPS = 10000n;
  const SCALE = 1000000000n;
  const MAX_SKEW_BPS = 2000;

  // SOL(9) / USDC(6): 1 human price unit = 1e6 mid_e9 units.
  const HUMAN_TO_PRICE = 1000000;
  const PRICE_TO_HUMAN = 1000000;

  const $ = (name) => sim.querySelector(`[data-out="${name}"]`);
  const inputs = {};
  sim.querySelectorAll('[data-k]').forEach((el) => {
    inputs[el.dataset.k] = el;
  });

  const out = {
    mid: $('mid'),
    spread: $('spread'),
    skew: $('skew'),
    base: $('base'),
    quote: $('quote'),
    maxsize: $('maxsize'),
    age: $('age'),
    maxage: $('maxage'),
    sideLabel: $('sideLabel'),
    amount: $('amount'),
    bid: $('bid'),
    ask: $('ask'),
    width: $('width'),
    effective: $('effective'),
    impact: $('impact'),
    flow: $('flow'),
    skewAfter: $('skewAfter'),
    skewNow: $('skewNow'),
    skewBound: $('skewBound'),
    balanceMarker: $('balanceMarker'),
    status: sim.querySelector('[data-sim-status]'),
    explain: sim.querySelector('[data-sim-explain]'),
  };

  const fmtPrice = (v, digits = 4) => {
    if (!Number.isFinite(v)) return '—';
    return v.toLocaleString('zh-CN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };
  const fmtAmount = (v, digits = 2) => {
    if (!Number.isFinite(v)) return '—';
    return v.toLocaleString('zh-CN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };
  const fmtBps = (v) => {
    if (!Number.isFinite(v)) return '—';
    const n = Math.round(v);
    return `${n > 0 ? '+' : ''}${n} bps`;
  };

  const sidePrice = (midE9, spreadBps, skewBps, side) => {
    const spread = BigInt(Math.round(spreadBps));
    const skew = BigInt(Math.round(skewBps));
    const denom = BPS;

    const skewed = denom + skew;
    if (skewed <= 0n) return null;
    if (spread >= denom) return null;

    const sided = side === 'bid' ? denom - spread : denom + spread;
    const numerator = midE9 * skewed * sided;
    const denominator = denom * denom;

    return side === 'bid'
      ? numerator / denominator
      : (numerator + denominator - 1n) / denominator;
  };

  const inventorySkewBps = (baseRaw, quoteRaw, midE9) => {
    const baseValue = baseRaw * midE9;
    const quoteValue = quoteRaw * SCALE;
    const total = baseValue + quoteValue;
    if (total === 0n) return 0;
    return Number(((baseValue - quoteValue) * BPS) / total);
  };

  const readState = () => ({
    mid: Number(inputs.mid.value),
    spread: Number(inputs.spread.value),
    skew: Number(inputs.skew.value),
    base: Number(inputs.base.value),
    quote: Number(inputs.quote.value),
    maxsize: Number(inputs.maxsize.value),
    age: Number(inputs.age.value),
    maxage: Number(inputs.maxage.value),
    side: inputs.side.value,
    amount: Number(inputs.amount.value),
  });

  const render = () => {
    const s = readState();
    const midE9 = BigInt(Math.round(s.mid * HUMAN_TO_PRICE));
    const baseRaw = BigInt(Math.round(s.base * 1e9));
    const quoteRaw = BigInt(Math.round(s.quote * 1e6));

    const bidE9 = sidePrice(midE9, s.spread, s.skew, 'bid');
    const askE9 = sidePrice(midE9, s.spread, s.skew, 'ask');

    const bid = bidE9 === null ? NaN : Number(bidE9) / PRICE_TO_HUMAN;
    const ask = askE9 === null ? NaN : Number(askE9) / PRICE_TO_HUMAN;

    out.mid.textContent = fmtPrice(s.mid, 2);
    out.spread.textContent = `${s.spread} bps`;
    out.skew.textContent = fmtBps(s.skew);
    out.base.textContent = `${fmtAmount(s.base, 0)} SOL`;
    out.quote.textContent = `${fmtAmount(s.quote, 0)} USDC`;
    out.maxsize.textContent = `${fmtAmount(s.maxsize, 0)} SOL`;
    out.age.textContent = `${s.age} slots`;
    out.maxage.textContent = `${s.maxage} slots`;
    out.sideLabel.textContent = s.side === 'buy' ? '买入 SOL' : '卖出 SOL';
    out.amount.textContent = `${fmtAmount(s.amount, 0)} SOL`;

    out.bid.textContent = Number.isFinite(bid) ? fmtPrice(bid) : '—';
    out.ask.textContent = Number.isFinite(ask) ? fmtPrice(ask) : '—';
    out.width.textContent = Number.isFinite(bid) && Number.isFinite(ask)
      ? `${(((ask - bid) / ((ask + bid) / 2)) * 10000).toFixed(0)} bps`
      : '—';
    out.skewBound.textContent = `±${MAX_SKEW_BPS} bps`;

    const skewBefore = inventorySkewBps(baseRaw, quoteRaw, midE9);
    out.skewNow.textContent = fmtBps(skewBefore);

    let baseLegRaw = 0n;
    let baseOutRaw = 0n;
    let quoteOutRaw = 0n;
    let quoteInRaw = 0n;
    let baseInRaw = 0n;
    let amountOut = 0;
    let effective = NaN;
    let flow = '—';

    if (s.side === 'buy' && askE9 !== null && askE9 > 0n) {
      quoteInRaw = BigInt(Math.round(s.amount * s.mid * 1e6));
      baseOutRaw = (quoteInRaw * SCALE) / askE9;
      baseLegRaw = baseOutRaw;
      amountOut = Number(baseOutRaw) / 1e9;
      effective = s.amount > 0 ? (Number(quoteInRaw) / 1e6) / Math.max(amountOut, 1e-12) : NaN;
      flow = `付 ${fmtAmount(Number(quoteInRaw) / 1e6)} USDC → 得 ${fmtAmount(amountOut)} SOL`;
    } else if (s.side === 'sell' && bidE9 !== null && bidE9 > 0n) {
      baseInRaw = BigInt(Math.round(s.amount * 1e9));
      quoteOutRaw = (baseInRaw * bidE9) / SCALE;
      baseLegRaw = baseInRaw;
      amountOut = Number(quoteOutRaw) / 1e6;
      effective = s.amount > 0 ? amountOut / s.amount : NaN;
      flow = `付 ${fmtAmount(s.amount)} SOL → 得 ${fmtAmount(amountOut)} USDC`;
    }

    const baseLeg = Number(baseLegRaw) / 1e9;
    const payoutTooLarge = s.side === 'buy'
      ? baseOutRaw > baseRaw
      : quoteOutRaw > quoteRaw;

    let baseAfter = baseRaw;
    let quoteAfter = quoteRaw;
    if (s.side === 'buy') {
      baseAfter -= baseOutRaw;
      quoteAfter += quoteInRaw;
    } else {
      baseAfter += baseInRaw;
      quoteAfter -= quoteOutRaw;
    }
    const skewAfter = inventorySkewBps(baseAfter, quoteAfter, midE9);
    const crossesBound = Math.abs(skewAfter) > MAX_SKEW_BPS
      && Math.abs(skewAfter) > Math.abs(skewBefore);

    let tone = 'ok';
    let label = '可成交';
    let reason = '';

    if (s.age > s.maxage) {
      tone = 'bad';
      label = '报价过期';
      reason = `报价已经在链上存活 ${s.age} 个 slot，超过 max_quote_age_slots = ${s.maxage}。聚合器可能还显示这张报价，但链上会直接拒绝。`;
    } else if (s.amount === 0) {
      tone = 'warn';
      label = '数量太小';
      reason = 'amount_in 为 0，链上会以 AmountTooSmall 拒绝。';
    } else if (baseLeg > s.maxsize) {
      tone = 'bad';
      label = '超过单笔上限';
      reason = `这笔单的 base 腿是 ${fmtAmount(baseLeg)} SOL，超过 max_size_base = ${fmtAmount(s.maxsize, 0)} SOL。链上不会部分成交。`;
    } else if (Number.isFinite(effective) && (amountOut <= 0 || (s.side === 'buy' ? baseOutRaw === 0n : quoteOutRaw === 0n))) {
      tone = 'warn';
      label = '输出为 0';
      reason = '金额小到输出取整为 0。链上会把“付了钱但拿不到东西”当成错误拒绝。';
    } else if (payoutTooLarge) {
      tone = 'bad';
      label = '库存不足';
      reason = `Vault 没有足够的 ${s.side === 'buy' ? 'SOL' : 'USDC'} 付出这笔单。链上会以 InsufficientLiquidity 拒绝。`;
    } else if (crossesBound) {
      tone = 'warn';
      label = '触及库存边界';
      reason = `成交后库存 skew 会从 ${fmtBps(skewBefore)} 走到 ${fmtBps(skewAfter)}，越过 ±${MAX_SKEW_BPS} bps 且继续变差。链上只拒绝“让库存更偏”的交易。`;
    } else if (Math.abs(skewAfter) > MAX_SKEW_BPS) {
      label = '越界但方向正确';
      reason = `库存已经在边界外（${fmtBps(skewBefore)}），但这笔交易把它拉回 ${fmtBps(skewAfter)}，所以链上允许成交。`;
    } else {
      reason = `报价新鲜、数量在上限内、库存足够，成交后 skew 为 ${fmtBps(skewAfter)}。链上会先收 input，再付 output。`;
    }

    out.effective.textContent = Number.isFinite(effective) ? fmtPrice(effective, 4) : '—';
    const impact = Number.isFinite(effective) && s.mid > 0
      ? ((effective - s.mid) / s.mid) * 10000
      : NaN;
    out.impact.textContent = fmtBps(impact);
    out.flow.textContent = flow;
    out.skewAfter.textContent = fmtBps(skewAfter);

    out.status.textContent = label;
    out.status.dataset.tone = tone;
    out.explain.dataset.tone = tone;
    out.explain.innerHTML = `<b>${label}。</b> ${reason}`;

    const marker = Math.max(2, Math.min(98, 50 - (skewBefore / (MAX_SKEW_BPS * 1.5)) * 50));
    out.balanceMarker.style.left = `${marker}%`;

    const impactTone = Math.abs(impact) > 30 ? 'warn' : 'ok';
    out.impact.closest('.metric').dataset.tone = Number.isFinite(impact) ? impactTone : '';
    const skewTone = Math.abs(skewAfter) > MAX_SKEW_BPS ? 'warn' : 'ok';
    out.skewAfter.closest('.metric').dataset.tone = skewTone;
  };

  const setValues = (values) => {
    Object.entries(values).forEach(([key, value]) => {
      if (inputs[key]) inputs[key].value = String(value);
    });
    render();
  };

  const presets = {
    balanced: {
      mid: 150, spread: 10, skew: 0, base: 1000, quote: 150000,
      maxsize: 50, age: 2, maxage: 12, side: 'buy', amount: 10,
    },
    long: {
      mid: 150, spread: 15, skew: -150, base: 2200, quote: 150000,
      maxsize: 200, age: 2, maxage: 12, side: 'sell', amount: 100,
    },
    stale: {
      mid: 150, spread: 10, skew: 0, base: 1000, quote: 150000,
      maxsize: 50, age: 20, maxage: 12, side: 'buy', amount: 10,
    },
    large: {
      mid: 150, spread: 10, skew: 0, base: 1000, quote: 150000,
      maxsize: 50, age: 2, maxage: 12, side: 'buy', amount: 120,
    },
  };

  sim.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = presets[button.dataset.preset];
      if (preset) setValues(preset);
    });
  });

  Object.values(inputs).forEach((input) => {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  });

  render();
})();
