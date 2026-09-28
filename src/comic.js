// 分镜播放器
//
// 一格一屏，镜头缓慢推近／抖一下，对白气泡和底部字幕按节奏出来，配一点音效。
// 自动往下走，点屏幕可以立刻翻到下一格；放完给几个选择。
//
// 每一幕的分镜脚本（镜头顺序、台词、布景）都在 data.js 里，
// 这里只负责"怎么放"。要新加一段分镜：在 data.js 写 beats + 在 KINDS 里加布景。

import { sfx } from './audio.js';
import { h, clear } from './dom.js';

const ART = 'assets/char';

/* ── 每一格画什么（布景都是纯 CSS 画的） ────────────────── */

const KINDS = {
  /* 泡面危机 */
  dorm(panel) {
    panel.append(h('img', { class: 'panel__photo', src: 'assets/photo/dorm.jpg', alt: '' }));
  },
  cover(panel) {
    panel.append(h('span', { class: 'win win--dim' }), h('span', { class: 'cloth' }));
  },
  window(panel) {
    panel.append(h('span', { class: 'win win--bright' }));
  },
  panic(panel) {
    panel.append(...[1, 2, 3].map((n) => h('i', { class: `streak streak--${n}` })));
  },
  cabinet(panel) {
    panel.append(h('span', { class: 'cabinet' }, h('i', { class: 'cabinet__door' })));
  },
  seed(panel) {
    panel.append(h('span', { class: 'table' }, h('i', { class: 'seed' })));
  },

  /* 宿舍 · 熄灯之后 */
  darkroom(panel) {
    panel.append(
      h('span', { class: 'p_moon' }),
      h('span', { class: 'p_bunks' }, ...[1, 2].map((n) => h('i', { class: `p_bunk p_bunk--${n}` }))),
    );
  },
  sneak(panel) {
    panel.append(h('span', { class: 'p_moon' }), h('span', { class: 'p_ladder' }), h('span', { class: 'p_floorlight' }));
  },
  intoBed(panel) {
    panel.append(h('span', { class: 'p_moon' }), h('span', { class: 'p_bed' }), h('span', { class: 'p_gap' }));
  },
  quiltTalk(panel) {
    panel.append(h('span', { class: 'p_moon' }), h('span', { class: 'p_bed' }), h('span', { class: 'p_glow' }));
  },
  fuzzy(panel) {
    panel.append(
      h('span', { class: 'p_moon' }),
      ...['one', 'two', 'three', 'four'].map((n) => h('i', { class: `p_fuz ${n}` })),
      h('span', { class: 'p_glow p_glow--warm' }),
    );
  },
  pullBack(panel) {
    panel.append(h('span', { class: 'p_moon' }), h('span', { class: 'p_wide' }));
  },
};

/* ── 播放器 ─────────────────────────────────────────────── */

export function playComic({ script, onPlay, onDone }) {
  const stage = h('div', { class: 'comic__stage' });
  const bar = h('i');
  const progress = h('div', { class: 'comic__bar' }, bar);
  const count = h('span', { class: 'comic__count' });
  const sub = h('div', { class: 'comic__sub' });
  const hint = h('div', { class: 'comic__hint', text: script.hint });
  const end = h('div', { class: 'comic__end' });

  const root = h('section', { class: 'scene scene--comic' },
    h('div', { class: 'comic__from', text: script.from }),
    h('button', { class: 'back-to-box', type: 'button', text: '目录', onclick: onDone }),
    stage, progress, count, sub, hint, end,
  );

  const beats = script.beats;
  let index = -1;
  let timer = null;
  let done = false;

  const alive = () => root.isConnected;

  function panel(b) {
    const p = h('div', { class: `panel panel--${b.kind} cam--${b.cam}` });
    (KINDS[b.kind] || (() => {}))(p, b);

    if (b.actors) {
      p.append(h('div', { class: 'panel__actors' },
        b.actors.map((who, i) => h('img', {
          class: `panel__actor panel__actor--${who}`,
          src: `${ART}/${script.set || 'hs'}-${who}.png`,
          alt: '',
          style: `animation-delay:${.1 + i * .12}s`,
        })),
      ));
    }
    if (b.bubble) {
      p.append(h('div', { class: `panel__bubble panel__bubble--${b.bubble}` },
        h('span', { text: b.bubbleText })));
    }
    return p;
  }

  function showSub(text) {
    clear(sub);
    String(text).split('\n').forEach((line, i) => {
      sub.append(h('p', { class: 'comic__line', style: `animation-delay:${.3 + i * .55}s`, text: line }));
    });
    setTimeout(() => { if (alive()) sfx.blip(); }, 300);
  }

  function go(next) {
    clearTimeout(timer);
    index = next;

    if (index >= beats.length) { finish(); return; }

    const b = beats[index];
    const fresh = panel(b);
    stage.append(fresh);
    requestAnimationFrame(() => fresh.classList.add('is-live'));

    const old = stage.firstElementChild;
    if (old !== fresh) {
      old.classList.remove('is-live');
      setTimeout(() => old.remove(), 520);
    }

    sfx.whoosh();
    showSub(b.sub);
    if (b.bubble) setTimeout(() => { if (alive()) sfx.tap(); }, 900);
    if (b.sfx === 'curtain') setTimeout(() => { if (alive()) sfx.curtain(); }, 400);
    if (b.sfx === 'door') setTimeout(() => { if (alive()) sfx.door(); }, 400);

    count.textContent = `${index + 1} / ${beats.length}`;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${b.dur}ms linear`;
      bar.style.width = '100%';
    });

    hint.style.opacity = '1';
    timer = setTimeout(() => go(index + 1), b.dur);
  }

  function finish() {
    done = true;
    clearTimeout(timer);
    hint.style.opacity = '0';
    count.textContent = '';
    bar.style.transition = 'width 240ms linear';
    bar.style.width = '100%';

    clear(end);
    clear(sub);
    const buttons = [];
    if (onPlay && script.endPlay) {
      buttons.push(h('button', { class: 'btn', type: 'button', text: script.endPlay, onclick: onPlay }));
    }
    buttons.push(h('button', { class: 'btn btn--ghost', type: 'button', text: script.endReplay, onclick: replay }));
    buttons.push(h('button', { class: 'btn btn--ghost', type: 'button', text: script.endBack, onclick: onDone }));
    end.append(...buttons);
    end.classList.add('is-live');
    sfx.relief();
  }

  function replay() {
    done = false;
    end.classList.remove('is-live');
    clear(end);
    clear(stage);
    go(0);
  }

  root.addEventListener('click', (e) => {
    if (done) return;
    if (e.target.closest('.back-to-box') || e.target.closest('.btn')) return;
    go(index + 1);
  });

  go(0);
  return root;
}
