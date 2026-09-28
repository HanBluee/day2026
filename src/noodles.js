// 微游戏：泡面危机。
// 分两拍：限时把东西藏进三个地方 → 阿姨进来逐个拉开。
// 结果一定是化险为夷 —— 因为真事就是这样，游戏只负责把紧张感还回来。

import { NOODLES } from './data.js';
import { sfx } from './audio.js';
import { h, clear } from './dom.js';

const HIDE_SECONDS = 26;

export function buildNoodles({ onDone }) {
  const root = h('section', { class: 'scene scene--game' });
  const game = h('div', { class: 'game' });
  root.append(game);

  const stepLabel = h('span', { class: 'game__step', text: 'STEP 1 / 2' });
  const bar = h('i');
  const hud = h('div', { class: 'game__hud' }, stepLabel, h('div', { class: 'game__timer' }, bar));
  const say = h('div', { class: 'game__say', html: NOODLES.intro });
  const spots = h('div', { class: 'spots' });
  const tray = h('div', { class: 'tray' });
  const hint = h('div', { class: 'game__hint', text: '点一件东西，再点一个地方' });
  const holdBtn = h('button', { class: 'btn', type: 'button', text: '藏好了', onclick: () => finishHiding() });
  const foot = h('div', { class: 'game__foot' }, hint, h('span', { class: 'spacer' }), holdBtn);

  const placed = {};        // itemId -> spotId
  let held = null;
  let timer = null;
  let left = HIDE_SECONDS;
  let phase = 'hide';

  /* ── 第一拍：藏 ──────────────────────────────────────── */

  function renderTray() {
    clear(tray);
    for (const item of NOODLES.items) {
      const done = Boolean(placed[item.id]);
      tray.append(
        h('button', {
          class: `item${item.risk ? ' item--danger' : ''}${held === item.id ? ' is-held' : ''}${done ? ' is-placed' : ''}`,
          type: 'button',
          onclick: () => { if (done) return; held = held === item.id ? null : item.id; sfx.tap(); renderTray(); renderSpots(); },
        }, item.label),
      );
    }
  }

  function renderSpots() {
    clear(spots);
    for (const spot of NOODLES.spots) {
      const inside = NOODLES.items.filter((i) => placed[i.id] === spot.id);
      spots.append(
        h('button', {
          class: `spot${held ? ' is-target' : ''}`,
          type: 'button',
          'data-spot': spot.id,
          onclick: () => put(spot.id),
        },
          h('span', { class: 'spot__name', text: spot.name }),
          h('div', { class: 'spot__pocket' },
            inside.map((i) => h('span', { class: 'mini', text: i.label[0] }))),
          h('span', { class: 'spot__count', text: inside.length ? `${inside.length} 件` : '空的' }),
        ),
      );
    }
  }

  function put(spotId) {
    if (!held) { hint.textContent = '先点下面的东西'; return; }
    placed[held] = spotId;
    held = null;
    sfx.tap();
    renderTray();
    renderSpots();
    if (Object.keys(placed).length === NOODLES.items.length) {
      hint.textContent = '都藏好了';
      holdBtn.textContent = '可以了';
    }
  }

  function startHide() {
    renderTray();
    renderSpots();
    timer = setInterval(() => {
      left -= 1;
      bar.style.transform = `scaleX(${Math.max(0, left / HIDE_SECONDS)})`;
      if (left <= 5 && left > 0) sfx.tick(true);
      if (left <= 0) finishHiding();
    }, 1000);
    sfx.tick();
  }

  function finishHiding() {
    if (phase !== 'hide') return;
    phase = 'open';
    clearInterval(timer);
    bar.style.transform = 'scaleX(0)';
    stepLabel.textContent = 'STEP 2 / 2';
    holdBtn.remove();
    hint.textContent = '';
    runInspection();
  }

  /* ── 第二拍：阿姨进来 ────────────────────────────────── */

  function runInspection() {
    sfx.door();
    const counts = NOODLES.spots.map((s) => ({
      spot: s,
      n: NOODLES.items.filter((i) => placed[i.id] === s.id).length,
    }));
    const thinnest = counts.slice().sort((a, b) => a.n - b.n)[0];
    const empty = thinnest.n === 0;

    const lines = [];
    lines.push(h('div', { html: '门被推开了。' }));

    let delay = 700;
    for (const step of NOODLES.opens) {
      setTimeout(() => {
        const el = spots.querySelector(`[data-spot="${step.spot}"]`);
        if (el) { el.classList.add('is-open'); setTimeout(() => el.classList.add('is-safe'), 900); }
        sfx.tap();
        say.append(h('div', { html: step.line }));
      }, delay);
      delay += 1150;
    }

    setTimeout(() => {
      const el = spots.querySelector(`[data-spot="${thinnest.spot.id}"]`);
      if (el) el.classList.add('is-open');
      say.append(h('div', { html: empty ? NOODLES.luck : NOODLES.near }));
    }, delay);

    delay += 1500;
    setTimeout(() => showOutcome(), delay);
  }

  function showOutcome() {
    sfx.relief();
    const card = h('div', { class: 'outcome' },
      h('h3', { text: '然后呢' }),
      NOODLES.outcome.map((line) => h('p', { html: line })),
      h('button', {
        class: 'btn', type: 'button', text: '松一口气',
        onclick: onDone,
        style: 'margin-top:14px',
      }),
    );
    clear(say);
    say.append(card);
  }

  game.append(hud, say, spots, tray, foot);
  startHide();
  return root;
}
