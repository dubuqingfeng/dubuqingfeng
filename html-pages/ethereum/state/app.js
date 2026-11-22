(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- *
   * Scroll progress
   * ---------------------------------------------------------------- */
  const progressBar = document.getElementById('progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = `${ratio * 100}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------------------- *
   * Reveal on scroll
   * ---------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------- *
   * Active section in header nav
   * ---------------------------------------------------------------- */
  const navLinks = [...document.querySelectorAll('.site-nav a')];
  const navTargets = navLinks
    .map((link) => {
      const id = link.getAttribute('href');
      return id && id.startsWith('#') ? document.querySelector(id) : null;
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

  /* ---------------------------------------------------------------- *
   * Account field explorer
   * ---------------------------------------------------------------- */
  const accountDetails = {
    nonce: {
      title: 'Nonce：账户自己的计数器',
      body: 'EOA 每发一笔交易加一；合约每创建一个合约加一。它不是交易里的 nonce 字段，但交易 nonce 必须与账户 nonce 对齐。',
      formula: 'key = keccak256(address)\nvalue = RLP(nonce, balance, storageRoot, codeHash)',
    },
    balance: {
      title: 'Balance：原生 ETH，单位 wei',
      body: '这是共识层的 ETH 余额，不是 ERC-20 的 balanceOf。转账、出块奖励、提款、gas 结算都会改它；零值转账也可能 touch 一个空账户。',
      formula: 'balance : uint256\n1 ETH = 10^18 wei',
    },
    root: {
      title: 'StorageRoot：合约存储 trie 的根',
      body: '每个合约账户都指向一棵独立的存储 trie。槽的 key 是 keccak256(slot)，value 是 RLP(trim 后的 32 字节值)。存储根变化会反过来改账户叶子。',
      formula: 'storageRoot = root(storageTrie)\nstorageTrie[keccak(slot)] = RLP(value)',
    },
    code: {
      title: 'CodeHash：代码的承诺，不是代码本身',
      body: '账户体里没有字节码，只有哈希。代码按 codeHash 存在 CodeDB；没有代码的账户用 EmptyCodeHash。EOA 与合约账户的结构因此完全相同。',
      formula: 'EmptyCodeHash = keccak256(nil)\nCodeDB[codeHash] = bytecode',
    },
  };

  const accountKind = document.querySelector('[data-account-kind]');
  document.querySelectorAll('[data-account-field]').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.dataset.accountField;
      const detail = accountDetails[field];
      if (!detail) return;

      document.querySelectorAll('[data-account-field]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      if (accountKind) accountKind.textContent = field === 'code' || field === 'root' ? '合约账户' : 'EOA / 合约';

      const panel = document.querySelector('[data-account-detail]');
      if (!panel) return;
      panel.innerHTML = `<h4>${detail.title}</h4><p>${detail.body}</p><p class="mini-code">${detail.formula.replace(/\n/g, '<br>')}</p>`;
    });
  });

  /* ---------------------------------------------------------------- *
   * Mini MPT explorer
   * ---------------------------------------------------------------- */
  const mptExplorer = document.querySelector('[data-mpt-explorer]');
  if (mptExplorer) {
    const svg = mptExplorer.querySelector('[data-mpt-svg]');
    const select = mptExplorer.querySelector('[data-mpt-key]');
    const lookupButton = mptExplorer.querySelector('[data-mpt-lookup]');
    const caption = mptExplorer.querySelector('[data-mpt-caption]');
    const svgNS = 'http://www.w3.org/2000/svg';

    const items = [
      { key: '1a2b', value: '0xA1' },
      { key: '1a2c', value: '0xB7' },
      { key: '1a3b', value: '0xC3' },
      { key: '2b1a', value: '0xD9' },
      { key: '2b1b', value: '0xE5' },
    ];

    let nextId = 0;
    let nextEdgeId = 0;

    const makeNode = (type, depth, extra = {}) => ({
      id: `n${nextId++}`,
      type,
      depth,
      x: 0,
      y: 0,
      edgeId: null,
      edgeLabel: '',
      ...extra,
    });

    // Build a compressed trie: branch on the first differing nibble,
    // extension for a shared prefix, leaf for the remaining suffix.
    const build = (entries, depth = 0) => {
      if (entries.length === 1) {
        return makeNode('leaf', depth, {
          key: entries[0].key.slice(depth),
          fullKey: entries[0].key,
          value: entries[0].value,
        });
      }

      const first = entries[0].key;
      let common = 0;
      while (
        depth + common < first.length &&
        entries.every((entry) => entry.key[depth + common] === first[depth + common])
      ) {
        common++;
      }
      if (common > 0) {
        const key = first.slice(depth, depth + common);
        return makeNode('ext', depth, {
          key,
          child: build(entries, depth + common),
        });
      }

      const branch = makeNode('branch', depth, { children: Array(16).fill(null) });
      for (let nibble = 0; nibble < 16; nibble++) {
        const group = entries.filter((entry) => parseInt(entry.key[depth], 16) === nibble);
        if (group.length) branch.children[nibble] = build(group, depth + 1);
      }
      return branch;
    };

    const root = build(items);
    const allNodes = [];
    const allEdges = [];
    let leafIndex = 0;

    const layout = (node) => {
      allNodes.push(node);
      node.y = 34 + node.depth * 78;
      if (node.type === 'leaf') {
        node.x = 82 + leafIndex * 158;
        leafIndex++;
      } else if (node.type === 'ext') {
        layout(node.child);
        node.x = node.child.x;
      } else {
        const children = node.children.filter(Boolean);
        children.forEach(layout);
        node.x = children.reduce((sum, child) => sum + child.x, 0) / children.length;
      }
    };
    layout(root);

    const svgEl = (tag, attrs = {}) => {
      const element = document.createElementNS(svgNS, tag);
      Object.entries(attrs).forEach(([key, value]) => {
        element.setAttribute(key, String(value));
      });
      return element;
    };

    const appendEdge = (parent, child, label) => {
      const edgeId = `e${nextEdgeId++}`;
      const midY = parent.y + 48 + (child.y - (parent.y + 48)) / 2;
      const path = svgEl('path', {
        class: 'mpt-edge',
        id: edgeId,
        d: `M ${parent.x} ${parent.y + 48} C ${parent.x} ${midY}, ${child.x} ${midY}, ${child.x} ${child.y}`,
      });
      svg.appendChild(path);

      const text = svgEl('text', {
        class: 'mpt-edge-label',
        x: (parent.x + child.x) / 2,
        y: midY + 3,
        'text-anchor': 'middle',
        'data-edge-label': edgeId,
      });
      text.textContent = label;
      svg.appendChild(text);

      allEdges.push({ id: edgeId, parent: parent.id, child: child.id });
      child.edgeId = edgeId;
      child.edgeLabel = label;
    };

    const drawNode = (node) => {
      const group = svgEl('g', {
        class: `mpt-node ${node.type}`,
        'data-node-id': node.id,
      });
      group.appendChild(svgEl('rect', {
        x: node.x - 66,
        y: node.y,
        width: 132,
        height: 48,
        rx: 10,
      }));

      const typeText = svgEl('text', {
        class: 'node-type',
        x: node.x,
        y: node.y + 16,
        'text-anchor': 'middle',
      });
      typeText.textContent = node.type === 'ext'
        ? `extension "${node.key}"`
        : node.type === 'leaf'
          ? (node.key ? `leaf "${node.key}"` : 'leaf · key end')
          : 'branch · 16-way';
      group.appendChild(typeText);

      const label = svgEl('text', {
        class: 'node-label',
        x: node.x,
        y: node.y + 34,
        'text-anchor': 'middle',
      });
      label.textContent = node.type === 'leaf'
        ? `${node.fullKey} → ${node.value}`
        : node.type === 'ext'
          ? `跳过 ${node.key.length} nibble`
          : `path depth ${node.depth}`;
      group.appendChild(label);
      svg.appendChild(group);
    };

    const draw = () => {
      allNodes.length = 0;
      allEdges.length = 0;
      leafIndex = 0;
      layout(root);
      svg.innerHTML = '';
      const drawEdges = (node) => {
        if (node.type === 'ext') {
          appendEdge(node, node.child, node.key);
          drawEdges(node.child);
        } else if (node.type === 'branch') {
          node.children.forEach((child, nibble) => {
            if (!child) return;
            appendEdge(node, child, nibble.toString(16));
            drawEdges(child);
          });
        }
      };
      drawEdges(root);
      const drawNodes = (node) => {
        drawNode(node);
        if (node.type === 'ext') drawNodes(node.child);
        if (node.type === 'branch') node.children.filter(Boolean).forEach(drawNodes);
      };
      drawNodes(root);
      const height = Math.max(...allNodes.map((node) => node.y)) + 78;
      svg.setAttribute('viewBox', `0 0 900 ${Math.max(380, height)}`);
    };

    const clearPath = () => {
      mptExplorer.querySelectorAll('.mpt-node.path, .mpt-edge.path, .mpt-edge-label.path')
        .forEach((element) => element.classList.remove('path'));
    };

    let lookupToken = 0;

    const findPath = (node, key, depth, path, edges) => {
      path.push({ node, depth });
      if (node.type === 'leaf') {
        return node.key === key.slice(depth);
      }
      if (node.type === 'ext') {
        if (!key.slice(depth).startsWith(node.key)) return false;
        edges.push(node.child.edgeId);
        return findPath(node.child, key, depth + node.key.length, path, edges);
      }
      const nibble = parseInt(key[depth], 16);
      const child = node.children[nibble];
      if (!child) return false;
      edges.push(child.edgeId);
      return findPath(child, key, depth + 1, path, edges);
    };

    const describe = ({ node, depth }) => {
      if (node.type === 'branch') {
        return `branch：读取第 ${depth + 1} 个 nibble，沿 child 继续。`;
      }
      if (node.type === 'ext') {
        return `extension "${node.key}"：共享前缀匹配，直接跳过 ${node.key.length} 个 nibble。`;
      }
      return `leaf：key 匹配，返回 ${node.value}。`;
    };

    const runLookup = () => {
      const key = select.value;
      const token = ++lookupToken;
      clearPath();
      if (caption) caption.textContent = `从根开始查找 ${key}…`;

      const path = [];
      const edges = [];
      const found = findPath(root, key, 0, path, edges);

      const setStep = (index) => {
        if (token !== lookupToken) return;
        clearPath();
        for (let i = 0; i <= Math.min(index, path.length - 1); i++) {
          const node = mptExplorer.querySelector(`[data-node-id="${path[i].node.id}"]`);
          if (node) node.classList.add('path');
          if (i > 0 && edges[i - 1]) {
            const edge = mptExplorer.querySelector(`#${edges[i - 1]}`);
            const label = mptExplorer.querySelector(`[data-edge-label="${edges[i - 1]}"]`);
            if (edge) edge.classList.add('path');
            if (label) label.classList.add('path');
          }
        }
        if (caption) {
          const current = path[index];
          caption.textContent = current
            ? `${describe(current)}${index === path.length - 1 ? (found ? ' 命中。' : ' 未命中。') : ''}`
            : (found ? '命中。' : '未命中。');
        }
      };

      if (reduceMotion) {
        setStep(path.length - 1);
        return;
      }

      let index = 0;
      const tick = () => {
        if (token !== lookupToken) return;
        setStep(index);
        index++;
        if (index < path.length) {
          window.setTimeout(tick, 760);
        }
      };
      tick();
    };

    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.key;
      option.textContent = `${item.key} → ${item.value}`;
      select.appendChild(option);
    });
    draw();
    lookupButton.addEventListener('click', runLookup);
    select.addEventListener('change', () => {
      lookupToken++;
      clearPath();
      if (caption) caption.textContent = `选择 ${select.value}，点击“逐跳查找”。`;
    });
  }

  /* ---------------------------------------------------------------- *
   * State write lifecycle player
   * ---------------------------------------------------------------- */
  const writePlayer = document.querySelector('[data-player="write"]');
  if (writePlayer) {
    const nodeKeys = ['evm', 'object', 'journal', 'finalise', 'storage', 'account', 'update', 'db'];
    const nodes = {};
    nodeKeys.forEach((key) => {
      nodes[key] = writePlayer.querySelector(`[data-node="${key}"]`);
    });

    const caption = writePlayer.querySelector('[data-step-caption]');
    const counter = writePlayer.querySelector('[data-step-counter]');
    const listItems = [...writePlayer.querySelectorAll('[data-step-list] li')];
    const playButton = writePlayer.querySelector('[data-step-play]');
    const prevButton = writePlayer.querySelector('[data-step-prev]');
    const nextButton = writePlayer.querySelector('[data-step-next]');

    const steps = [
      {
        key: 'evm',
        text: 'EVM 执行 SSTORE，把新值交给 StateDB.SetState。此时还没有碰 trie。',
      },
      {
        key: 'object',
        text: 'stateObject 先取当前值和原值；值没变就直接返回，否则写入 dirtyStorage。',
      },
      {
        key: 'journal',
        text: 'journal 记录 prev 和 origin。CALL 失败时按 revision 反向重放，恢复调用前的状态。',
      },
      {
        key: 'finalise',
        text: '交易结束 Finalise：dirtyStorage 汇总到 pendingStorage，uncommittedStorage 记录区块内首次偏离原值的槽。',
      },
      {
        key: 'storage',
        text: 'IntermediateRoot 并发调用 updateTrie：key 先 keccak256，value 去前导零再做 RLP，写入 storage trie。',
      },
      {
        key: 'account',
        text: 'storageRoot 变化后，账户叶子的 StateAccount 也要更新；账户 trie 重新计算，得到新的 stateRoot。',
      },
      {
        key: 'update',
        text: 'commit 收集 AccountUpdate、storage diff、代码和 trie 节点，封装成 StateUpdate。',
      },
      {
        key: 'db',
        text: 'MPTDatabase.Commit 写 CodeDB、更新 snapshot，再调用 triedb.Update：PathDB 挂 diff layer，HashDB 进 dirties。',
      },
    ];

    let current = 0;
    let timer = null;

    const render = () => {
      Object.values(nodes).forEach((node) => node && node.classList.remove('active'));
      const active = nodes[steps[current].key];
      if (active) active.classList.add('active');
      if (caption) caption.textContent = steps[current].text;
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
      }, reduceMotion ? 900 : 1900);
    };

    if (prevButton) prevButton.addEventListener('click', () => { stop(); go(current - 1); });
    if (nextButton) nextButton.addEventListener('click', () => { stop(); go(current + 1); });
    if (playButton) playButton.addEventListener('click', play);

    document.querySelectorAll('[data-play-write]').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('statedb')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        stop();
        go(0);
        window.setTimeout(() => {
          if (!timer) play();
        }, reduceMotion ? 50 : 480);
      });
    });

    render();
  }

  /* ---------------------------------------------------------------- *
   * Transaction scenarios
   * ---------------------------------------------------------------- */
  const scenarioPanel = document.querySelector('[data-scenario-panel]');
  if (scenarioPanel) {
    const title = scenarioPanel.querySelector('[data-scenario-title]');
    const desc = scenarioPanel.querySelector('[data-scenario-desc]');
    const rows = scenarioPanel.querySelector('[data-scenario-rows]');
    const note = scenarioPanel.querySelector('[data-scenario-note]');

    const scenarios = {
      eth: {
        title: 'EOA A → EOA B，转账 1 ETH',
        desc: '只有账户元数据变化，没有合约存储变化。stateRoot 仍然会因为 nonce 和 balance 改变。',
        rows: [
          ['A（EOA）', 'nonce', '<span class="delta-up">7 → 8</span>', '账户 trie 叶子'],
          ['A', 'balance', '<span class="delta-down">10 ETH → 8.99958 ETH</span>', '账户 trie 叶子'],
          ['B（EOA）', 'balance', '<span class="delta-up">0 → 1 ETH</span>', '账户 trie 叶子'],
          ['coinbase', 'balance', '<span class="delta-up">+0.000105 ETH（tip）</span>', '账户 trie 叶子'],
          ['A / B', 'storageRoot', '<span class="delta-flat">不变（空存储）</span>', '无 storage trie 更新'],
          ['A / B', 'codeHash', '<span class="delta-flat">不变</span>', 'CodeDB 无写入'],
        ],
        note: 'gas 费 0.00042 ETH：base fee 部分销毁，tip 给 coinbase。日志为空；收据根会变，但不进 stateRoot。',
      },
      erc20: {
        title: 'EOA A 调用合约 C 的 transfer(B, 100)',
        desc: '原生 ETH 只用于 gas；代币数量写在 C 的存储槽里。C 的 codeHash 不变，storageRoot 变。',
        rows: [
          ['A（EOA）', 'nonce', '<span class="delta-up">7 → 8</span>', '账户 trie 叶子'],
          ['A', 'balance', '<span class="delta-down">- gas 费</span>', '账户 trie 叶子'],
          ['C（合约）', 'balance', '<span class="delta-flat">不变（msg.value = 0）</span>', '账户 trie 叶子'],
          ['C', 'storage[keccak(A, slot)]', '<span class="delta-down">500 → 400</span>', 'C 的 storage trie'],
          ['C', 'storage[keccak(B, slot)]', '<span class="delta-up">0 → 100</span>', 'C 的 storage trie'],
          ['C', 'storageRoot', '<span class="delta-up">改变</span>', '账户叶子 Root 更新'],
          ['C', 'codeHash', '<span class="delta-flat">不变</span>', 'CodeDB 无写入'],
          ['收据', 'Transfer log', '<span class="delta-flat">写入日志，不进 state</span>', 'receipts / bloom'],
        ],
        note: 'Solidity 的 mapping(address => uint256) 位于 slot 0 时，balances[holder] 的槽是 keccak256(abi.encode(holder, uint256(0)))。真实 key 还会在 trie 层再做一次 keccak256。',
      },
      deploy: {
        title: 'EOA A 部署合约 C',
        desc: '部署会创建账户、写 codeHash 和 runtime code；如果构造函数写存储，还会创建 storage trie。',
        rows: [
          ['A（EOA）', 'nonce', '<span class="delta-up">7 → 8</span>', '账户 trie 叶子'],
          ['A', 'balance', '<span class="delta-down">- gas 费</span>', '账户 trie 叶子'],
          ['C（新合约）', 'nonce', '<span class="delta-up">0 → 1（EIP-161）</span>', '账户 trie 叶子'],
          ['C', 'codeHash', '<span class="delta-up">empty → keccak(runtime code)</span>', '账户 trie 叶子'],
          ['CodeDB', 'codeHash', '<span class="delta-up">写入 runtime bytecode</span>', 'CodeDB / rawdb'],
          ['C', 'storageRoot', '<span class="delta-flat">空或由构造函数写入</span>', 'C 的 storage trie'],
          ['C', 'balance', '<span class="delta-flat">0（除非随交易转入）</span>', '账户 trie 叶子'],
        ],
        note: 'init code 只用于执行构造过程，不进入状态；保存的是返回的 runtime code。EIP-170 限制运行时代码大小。',
      },
    };

    const renderScenario = (key) => {
      const scenario = scenarios[key];
      if (!scenario) return;
      if (title) title.textContent = scenario.title;
      if (desc) desc.textContent = scenario.desc;
      if (note) note.textContent = scenario.note;
      if (rows) {
        rows.innerHTML = scenario.rows.map((row) => (
          `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
        )).join('');
      }
    };

    document.querySelectorAll('[data-scenario]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-scenario]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        renderScenario(button.dataset.scenario);
      });
    });

    renderScenario('eth');
  }
})();
