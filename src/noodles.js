// 微游戏：泡面危机（拖拽版）
//
// 三步：
//   ① 把衣服拖到窗户上挡住玻璃
//   ② 阿姨敲开门之前，把六样东西分别放进四个柜子 / 两张上下铺
//   ③ 阿姨进来逐个拉开 —— 结果一定是化险为夷，因为真事就是这样
//
// 手机上 HTML5 的 drag 事件不能用，所以用 pointer 事件自己实现。
// 同时留了一套「点一下选中、再点一下放下」的操作：万一在某些机型上拖不动，
// 点着玩也完全能通关。

import { NOODLES } from './data.js';
import { sfx } from './audio.js';
import { h, clear } from './dom.js';

const HIDE_SECONDS = 26;
const TAP_SLOP = 8;      // 手指移动不超过这么多像素，就算「点」而不是「拖」

export function buildNoodles({ onDone }) {
  const root = h('section', { class: 'scene scene--game' });
  const game = h('div', { class: 'game' });
  root.append(game);

  const stepLabel = h('span', { class: 'game__step', text: '第 1 步 / 2' });
  const bar = h('i');
  const hud = h('div', { class: 'game__hud' }, stepLabel, h('div', { class: 'game__timer' }, bar));
  const say = h('div', { class: 'game__say' });
  const guide = h('div', { class: 'game__guide' });
  const tray = h('div', { class: 'tray' });
  const hint = h('div', { class: 'game__hint' });
  const holdBtn = h('button', { class: 'btn', type: 'button', text: '藏好了' });
  const foot = h('div', { class: 'game__foot' }, hint, h('span', { class: 'spacer' }), holdBtn);

  const zoneEls = [];
  const placed = {};        // itemId -> zoneId
  let phase = 'cloth';
  let held = null;          // 点选模式下「手上拿着」的那件东西
  let onDropInto = null;    // 当前阶段放下时要做的事

  /* ── 房间：窗户 + 四个柜子 + 两张上下铺（一共四张床） ─── */

  function zone(id, cls, label) {
    const el = h('div', { class: `zone ${cls}`, 'data-zone': id },
      h('span', { class: 'zone__label', text: label }),
      h('div', { class: 'zone__pocket' }));
    zoneEls.push(el);
    return el;
  }

  const windowCloth = h('span', { class: 'room__cloth' });
  const roomWindow = h('div', { class: 'room__window' },
    h('span', { class: 'room__glass' }), windowCloth,
    zone('window', 'zone--window', '窗户'));

  const cabinets = h('div', { class: 'room__row' },
    [1, 2, 3, 4].map((n) => zone(`c${n}`, 'zone--cabinet', `${NOODLES.spotCabinet} ${n}`)));

  const bunks = h('div', { class: 'room__row room__row--bunks' },
    ['左', '右'].map((side, i) => h('div', { class: 'bunk' },
      h('span', { class: 'bunk__frame' }),
      zone(`b${i + 1}u`, 'zone--bed', `${side} · 上铺`),
      zone(`b${i + 1}d`, 'zone--bed', `${side} · 下铺`))));

  const room = h('div', { class: 'room' }, roomWindow, cabinets, bunks);

  /* ── 拖 / 点 两套操作 ─────────────────────────────────── */

  function zoneAt(x, y) {
    for (const z of zoneEls) {
      const r = z.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return z;
    }
    return null;
  }

  function setHeld(el) {
    held = held === el ? null : el;
    tray.querySelectorAll('.item').forEach((n) => n.classList.toggle('is-held', n === held));
    if (held) hint.textContent = '再点一个柜子或床，把它放进去';
  }

  function dragify(el) {
    let start = null;
    let moved = false;

    el.addEventListener('pointerdown', (e) => {
      if (el.dataset.done) return;
      e.preventDefault();
      start = { x: e.clientX, y: e.clientY };
      moved = false;
      try { el.setPointerCapture(e.pointerId); } catch { /* 合成事件没有真的 pointerId，忽略 */ }
      el.classList.add('is-dragging');
    });

    el.addEventListener('pointermove', (e) => {
      if (!start) return;
      if (Math.abs(e.clientX - start.x) > TAP_SLOP || Math.abs(e.clientY - start.y) > TAP_SLOP) moved = true;
      if (!moved) return;
      el.style.transform = `translate(${e.clientX - start.x}px, ${e.clientY - start.y}px) scale(1.07)`;
      const z = zoneAt(e.clientX, e.clientY);
      zoneEls.forEach((n) => n.classList.toggle('is-over', n === z));
    });

    const end = (e) => {
      if (!start) return;
      const wasTap = !moved;
      el.classList.remove('is-dragging');
      el.style.transform = '';
      zoneEls.forEach((n) => n.classList.remove('is-over'));
      start = null;
      if (wasTap) { setHeld(el); return; }        // 没动 -> 当成「点选」
      const z = zoneAt(e.clientX, e.clientY);
      if (z) onDropInto(z, el);
    };

    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  // 点选模式下：点一个藏点，把手上那件放进去
  room.addEventListener('click', (e) => {
    if (!held) return;
    const z = e.target.closest('.zone');
    if (z) onDropInto(z, held);
  });

  function clearHeld() {
    held = null;
    tray.querySelectorAll('.item').forEach((n) => n.classList.remove('is-held'));
  }

  /* ── 第 1 步：把衣服挡到窗户上 ────────────────────────── */

  function startCloth() {
    phase = 'cloth';
    stepLabel.textContent = '第 1 步 / 2';
    holdBtn.style.display = 'none';

    clear(say);
    say.append(h('div', { html: NOODLES.intro }));
    clear(guide);
    guide.append(h('div', { class: 'game__guideTitle', text: NOODLES.guideTitle }));
    NOODLES.guide.forEach((g) => guide.append(h('div', { class: 'game__guideLine', text: g })));
    hint.textContent = NOODLES.clothHint;

    onDropInto = (z, el) => {
      if (z.dataset.zone !== 'window') {
        hint.textContent = '要拖到窗户上才行';
        return;
      }
      el.dataset.done = '1';
      el.remove();
      clearHeld();
      windowCloth.classList.add('is-on');
      sfx.tap();
      hint.textContent = '';
      setTimeout(afterCloth, 750);
    };

    clear(tray);
    const cloth = h('button', { class: 'item item--cloth', type: 'button' }, '衣服');
    dragify(cloth);
    tray.append(cloth);
  }

  function afterCloth() {
    clear(say);
    say.append(h('div', { html: NOODLES.clothDone }));
    windowCloth.classList.add('is-off');
    room.classList.add('is-shaken');
    sfx.curtain();
    setTimeout(() => {
      say.append(h('div', { html: NOODLES.rumble }));
      say.append(h('div', { class: 'game__say--warn', html: NOODLES.knock }));
    }, 900);
    setTimeout(startHide, 2200);
  }

  /* ── 第 2 步：藏东西 ─────────────────────────────────── */

  let hideTimer = null;

  function startHide() {
    phase = 'hide';
    stepLabel.textContent = '第 2 步 / 2';
    holdBtn.style.display = '';
    holdBtn.onclick = finishHide;
    hint.textContent = '拖进柜子或床上（也可以点一下它、再点地方）';

    clear(guide);
    clear(say);
    say.append(h('div', { html: NOODLES.clothDone }));
    say.append(h('div', { class: 'game__say--warn', html: NOODLES.knock }));

    onDropInto = (z, el) => {
      if (z.dataset.zone === 'window') return;      // 窗户不算藏点
      const id = el.dataset.item;
      placed[id] = z.dataset.zone;
      el.dataset.done = '1';
      el.remove();
      clearHeld();
      z.querySelector('.zone__pocket').append(h('span', { class: 'mini', text: el.dataset.short }));
      sfx.tap();
      renderStatus();
    };

    clear(tray);
    NOODLES.items.forEach((it) => {
      const el = h('button', { class: 'item', type: 'button' }, it.label);
      el.dataset.item = it.id;
      el.dataset.short = it.short;
      dragify(el);
      tray.append(el);
    });

    let left = HIDE_SECONDS;
    bar.style.transform = 'scaleX(1)';
    clearInterval(hideTimer);
    hideTimer = setInterval(() => {
      left -= 1;
      bar.style.transform = `scaleX(${Math.max(0, left / HIDE_SECONDS)})`;
      if (left <= 5 && left > 0) sfx.tick(true);
      if (left <= 0) { clearInterval(hideTimer); finishHide(); }
    }, 1000);

    renderStatus();
  }

  function renderStatus() {
    const n = Object.keys(placed).length;
    hint.textContent = n === NOODLES.items.length ? '都藏好了 —— 可以了' : `已藏好 ${n} / ${NOODLES.items.length}`;
  }

  function finishHide() {
    if (phase !== 'hide') return;
    phase = 'inspect';
    clearInterval(hideTimer);
    bar.style.transform = 'scaleX(0)';
    holdBtn.style.display = 'none';
    hint.textContent = '';
    runInspection();
  }

  /* ── 第 3 步：阿姨进来 ───────────────────────────────── */

  function runInspection() {
    sfx.door();
    clear(say);
    say.append(h('div', { html: '门被推开了。' }));

    // 哪个地方藏得最少（最好是空的）
    const counts = NOODLES.zones.map((z) => ({
      id: z.id,
      n: Object.values(placed).filter((v) => v === z.id).length,
    }));
    const thinnest = counts.slice().sort((a, b) => a.n - b.n)[0];

    let delay = 800;
    NOODLES.opens.forEach((id, i) => {
      setTimeout(() => {
        const el = zoneEls.find((n) => n.dataset.zone === id);
        if (el) { el.classList.add('is-open'); setTimeout(() => el.classList.add('is-safe'), 900); }
        sfx.tap();
        say.append(h('div', { html: i === 0 ? '阿姨进来，先拉开了柜子。' : '她顺手掀了一下床铺。' }));
      }, delay);
      delay += 1200;
    });

    setTimeout(() => {
      const el = zoneEls.find((n) => n.dataset.zone === thinnest.id);
      if (el) el.classList.add('is-open');
      say.append(h('div', { html: thinnest.n === 0 ? NOODLES.luck : NOODLES.near }));
    }, delay);

    setTimeout(showOutcome, delay + 1600);
  }

  function showOutcome() {
    sfx.relief();
    clear(say);
    say.append(h('div', { class: 'outcome' },
      h('h3', { text: '然后呢' }),
      NOODLES.outcome.map((line) => h('p', { html: line })),
      h('button', { class: 'btn', type: 'button', text: '松一口气', onclick: onDone, style: 'margin-top:14px' })));
  }

  game.append(hud, say, guide, room, tray, foot);
  startCloth();
  return root;
}
