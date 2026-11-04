// Easter eggs hidden in the home page badge. One game at a time; Esc or × puts the badge back.
//   click the QR code                       -> Snake: eat green events, score = events indexed
//   click "Detections"                      -> Brute-force Defender: block attacks on nine hosts for 30 s
//   press / (or tap the J logo three times) -> a tiny SPL console
// Styles live in badge.css. Phones can still scan the QR; only a click or tap starts Snake.
const badge = document.querySelector('.badge');
const body = badge.querySelector('.b-body');
const saved = body.innerHTML;
const EMAIL = 'hirani.jigar117@gmail.com';
let current = null; // the open game: { stop, click, key }
let taps = [];

const bar = (label) => `<div class="egg-bar"><span>${label}</span><button class="egg-x" aria-label="Close">×</button></div>`;

function open(game) {
  body.style.minHeight = body.offsetHeight + 'px';
  current = game;
}

function close() {
  current?.stop?.();
  current = null;
  body.innerHTML = saved;
  body.style.minHeight = '';
  hints();
}

function hints() {
  badge.querySelector('.qr')?.setAttribute('title', 'Scan to save my contact, or click to play');
  badge.querySelector('.focus li:nth-child(3)')?.setAttribute('title', 'Run detection');
}
hints();
document.querySelector('footer span')?.insertAdjacentHTML('afterend', '<span class="page-hint">Press / to search</span>');

badge.addEventListener('click', (e) => {
  if (e.target.closest('.egg-x')) return close();
  if (current) return current.click?.(e);
  if (e.target.closest('.qr')) { e.preventDefault(); return snake(); }
  if (e.target.closest('.focus li:nth-child(3)')) return defend();
  if (e.target.closest('.b-head svg')) {
    taps = [...taps.filter((t) => Date.now() - t < 1200), Date.now()];
    if (taps.length >= 3) { taps = []; spl(); }
  }
});

document.addEventListener('keydown', (e) => {
  if (current) return e.key === 'Escape' ? close() : current.key?.(e);
  if (e.key === '/' && !e.target.closest('input, textarea')) { e.preventDefault(); spl(); }
});

/* ---------- Snake ---------- */
function snake() {
  const CELL = 12;
  const g = {};
  open({
    stop: () => clearInterval(g.timer),
    click: (e) => { if (g.over && e.target.closest('.egg-canvas')) reset(); },
    key: (e) => {
      if (e.key === ' ' && g.over) { e.preventDefault(); return reset(); }
      const k = KEYS[e.key] || KEYS[e.key.toLowerCase()];
      if (k) { e.preventDefault(); turn(k); }
    },
  });
  const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
  const height = parseFloat(body.style.minHeight);
  body.innerHTML = bar('SNAKE · <b class="egg-score">0</b> EVENTS INDEXED')
    + '<canvas class="egg-canvas" aria-label="Snake game board"></canvas><p class="egg-msg"></p>';
  const canvas = body.querySelector('canvas');
  const score = body.querySelector('.egg-score');
  const msg = body.querySelector('.egg-msg');
  g.cols = Math.floor(canvas.clientWidth / CELL);
  g.rows = Math.max(10, Math.floor((height - 110) / CELL));
  const dpr = devicePixelRatio || 1;
  canvas.width = g.cols * CELL * dpr;
  canvas.height = g.rows * CELL * dpr;
  canvas.style.height = g.rows * CELL + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  canvas.addEventListener('touchstart', (e) => { g.touch = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    if (!g.touch) return;
    const dx = e.changedTouches[0].clientX - g.touch[0];
    const dy = e.changedTouches[0].clientY - g.touch[1];
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
  });

  function reset() {
    const y = Math.floor(g.rows / 2);
    Object.assign(g, { snake: [[4, y], [3, y], [2, y]], dir: [1, 0], next: [1, 0], score: 0, over: false, speed: 140 });
    placeFood();
    score.textContent = '0';
    msg.textContent = 'Arrow keys, WASD or swipe. Eat the green events.';
    clearInterval(g.timer);
    g.timer = setInterval(step, g.speed);
    draw();
  }
  function placeFood() {
    do g.food = [Math.floor(Math.random() * g.cols), Math.floor(Math.random() * g.rows)];
    while (g.snake.some(([x, y]) => x === g.food[0] && y === g.food[1]));
  }
  function turn([dx, dy]) {
    if (g.over || (dx === -g.dir[0] && dy === -g.dir[1])) return; // no reversing into yourself
    g.next = [dx, dy];
  }
  function step() {
    g.dir = g.next;
    const head = [g.snake[0][0] + g.dir[0], g.snake[0][1] + g.dir[1]];
    const hit = head[0] < 0 || head[1] < 0 || head[0] >= g.cols || head[1] >= g.rows
      || g.snake.some(([x, y]) => x === head[0] && y === head[1]);
    if (hit) {
      clearInterval(g.timer);
      g.over = true;
      msg.textContent = `Index full: ${g.score} events indexed. Tap the board or press Space to play again.`;
      return draw();
    }
    g.snake.unshift(head);
    if (head[0] === g.food[0] && head[1] === g.food[1]) {
      score.textContent = ++g.score;
      placeFood();
      if (g.speed > 70) { g.speed -= 5; clearInterval(g.timer); g.timer = setInterval(step, g.speed); }
    } else g.snake.pop();
    draw();
  }
  function draw() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, g.cols * CELL, g.rows * CELL);
    ctx.fillStyle = '#17803A';
    ctx.beginPath();
    ctx.arc(g.food[0] * CELL + CELL / 2, g.food[1] * CELL + CELL / 2, CELL / 2 - 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.over ? '#A3ACA6' : '#111513';
    for (const [x, y] of g.snake) ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
  }
  reset();
}

/* ---------- Brute-force Defender ---------- */
function defend() {
  const HOSTS = ['dc01', 'dc02', 'vpn01', 'web01', 'web02', 'db01', 'mail01', 'fw01', 'jump01'];
  const LIMIT = 5, ROUND = 30, TICK = 500;
  const g = {};
  open({
    stop: () => clearInterval(g.timer),
    click: (e) => {
      if (e.target.closest('.egg-again')) return reset();
      const host = e.target.closest('.hosts button');
      if (host) block(+host.dataset.i);
    },
  });
  body.innerHTML = bar(`DEFEND · <b class="egg-blocked">0</b> BLOCKED · <b class="egg-time">${ROUND}s</b>`)
    + `<div class="hosts">${HOSTS.map((h, i) => `<button data-i="${i}" aria-label="${h}"><span>${h}</span><small></small><i style="--p:0%"></i></button>`).join('')}</div>`
    + '<p class="egg-msg" aria-live="polite"></p>';
  const buttons = [...body.querySelectorAll('.hosts button')];
  const msg = body.querySelector('.egg-msg');

  function reset() {
    clearInterval(g.timer);
    Object.assign(g, { hosts: HOSTS.map(() => ({ ip: null, fails: 0 })), blocked: 0, left: ROUND * 1000, over: false });
    msg.textContent = 'Tap a host under attack to block the source IP.';
    g.timer = setInterval(tick, TICK);
    render();
  }
  function tick() {
    g.left -= TICK;
    for (const h of g.hosts) if (h.ip && ++h.fails >= LIMIT) return end(h);
    const pressure = 0.25 + 0.5 * (1 - g.left / (ROUND * 1000)); // attacks speed up as the round goes on
    if (Math.random() < pressure) {
      const idle = g.hosts.filter((h) => !h.ip);
      if (idle.length) Object.assign(idle[Math.floor(Math.random() * idle.length)], { ip: randomIp(), fails: 1 });
    }
    if (g.left <= 0) return end(null);
    render();
  }
  function block(i) {
    const h = g.hosts[i];
    if (g.over || !h.ip) return;
    Object.assign(h, { ip: null, fails: 0, justBlocked: true });
    g.blocked++;
    render();
  }
  function render() {
    body.querySelector('.egg-blocked').textContent = g.blocked;
    body.querySelector('.egg-time').textContent = Math.max(0, Math.ceil(g.left / 1000)) + 's';
    buttons.forEach((b, i) => {
      const h = g.hosts[i];
      b.classList.toggle('hot', !!h.ip);
      b.classList.toggle('ok', !!h.justBlocked);
      b.querySelector('small').textContent = h.ip ? `${h.ip} · ${h.fails}/${LIMIT}` : h.justBlocked ? 'blocked' : '';
      b.querySelector('i').style.setProperty('--p', (h.fails / LIMIT) * 100 + '%');
      h.justBlocked = false;
    });
  }
  function end(breached) {
    clearInterval(g.timer);
    g.over = true;
    render();
    msg.textContent = breached
      ? `Breach: ${HOSTS[g.hosts.indexOf(breached)]} hit ${LIMIT} failed logins from ${breached.ip}. ${g.blocked} blocked.`
      : `Held for ${ROUND}s with no breach: ${g.blocked} brute-force attempts blocked.`;
    msg.insertAdjacentHTML('beforeend', ' <button class="egg-again">Play again</button>');
  }
  function randomIp() {
    const r = () => Math.floor(Math.random() * 254) + 1;
    return `10.${r()}.${r()}.${r()}`;
  }
  reset();
}

/* ---------- SPL console ---------- */
function spl() {
  const ANSWERS = {
    help: () => [['dim', 'Try: whoami · index=jigar · | table certs · | stats count by focus\n     | table toolbox · sourcetype=coffee · sudo make me admin\n     | delete · resume · hire · exit']],
    whoami: () => [['', 'jigar · Splunk, Cribl and SIEM engineer\nrole=power   next_role=admin']],
    'index=jigar': () => [['', '4 events\nfocus=Platform\nfocus=Pipelines\nfocus=Detections\nfocus=Observability']],
    '| table certs': () => [['', 'cert              status\n----------------  -----------\nEnterprise Admin  in progress\nPower User        Nov 2026\nCore User         Oct 2026\nCribl Admin       in progress']],
    '| stats count by focus': () => [['', 'focus          count\n-------------  -----\nPlatform       1\nPipelines      1\nDetections     1\nObservability  1\n\n(4 for 4. No noise.)']],
    '| table toolbox': () => [['', [...document.querySelectorAll('.chips li')].map((li) => li.textContent).join('\n')]],
    'sourcetype=coffee': () => [['', 'count=∞\nAverage dashboards per coffee: 2']],
    'sudo make me admin': () => [['err', 'Permission denied: Splunk Enterprise Certified Admin is in progress.\nAsk again after the exam.']],
    '| delete': () => [['err', "Nice try. role=power can't run | delete.\n(Not that anyone should.)"]],
    resume: () => { window.open('/assets/Jigar-Hirani-Resume.pdf', '_blank', 'noopener'); return [['dim', 'Opening resume.pdf…']]; },
    hire: () => { location.href = `mailto:${EMAIL}`; return [['dim', `Opening your mail app: ${EMAIL}`]]; },
  };
  ANSWERS['search index=jigar'] = ANSWERS['index=jigar'];
  ANSWERS['| sendemail'] = ANSWERS.hire;

  open({});
  body.innerHTML = bar('SEARCH · index=jigar')
    + '<div class="spl-out" aria-live="polite"></div>'
    + '<form class="spl-in"><span>&gt;</span><input aria-label="Search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="help"></form>';
  const out = body.querySelector('.spl-out');
  const form = body.querySelector('form');
  const input = form.querySelector('input');

  const print = (lines) => {
    for (const [cls, text] of lines) {
      const div = document.createElement('div');
      div.className = cls;
      div.textContent = text;
      out.append(div);
    }
    out.scrollTop = out.scrollHeight;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim().replace(/\s+/g, ' ');
    input.value = '';
    if (!q) return;
    print([['q', '> ' + q]]);
    const key = q.toLowerCase();
    if (key === 'exit' || key === 'quit') return close();
    const answer = ANSWERS[key];
    if (answer) return print(answer());
    const cmd = key.startsWith('|') ? key.split(' ')[1] : null;
    print([['err', cmd ? `Unknown search command '${cmd}'. Try help.` : 'No results found. Try help.']]);
  });
  print([['dim', 'Splunk-ish console. Type help, press Enter.']]);
  input.focus();
}
