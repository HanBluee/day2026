// 小剧场：把「泡面危机」当分镜放一遍。
//
// 一格一屏，镜头缓慢推近／抖一下，对白气泡和字幕按节奏出来，配一点音效。
// 自动往下走，点屏幕可以立刻翻到下一格；全放完给三个选择：
// 自己玩一遍（接原来那个小游戏）、再看一遍、回到这一幕。

import { COMIC } from './data.js';
import { sfx } from './audio.js';
import { h, clear } from './dom.js';

const ART = 'assets/char';

export function buildComic({ onPlay, onExit }) {
  const stage = h('div', { class: 'comic__stage' });
  const bar = h('i');
  const progress = h('div', { class: 'comic__bar' }, bar);
  const count = h('span', { class: 'comic__count' });
  const sub = h('div', { class: 'comic__sub' });
  const hint = h('div', { class: 'comic__hint', text: COMIC.hint });
  const end = h('div', { class: 'comic__end' });

  const root = h('section', { class: 'scene scene--comic' },
    h('div', { class: 'comic__from', text: COMIC.from }),
    h('button', { class: 'back-to-box', type: 'button', text: '目录', onclick: onExit }),
    stage, progress, count, sub, hint, end,
  );

  const beats = COMIC.beats;
  let index = -1;
  let timer = null;
  let done = false;

  const alive = () => root.isConnected;

  function panel(b) {
    const p = h('div', { class: `panel panel--${b.kind} cam--${b.cam}` });

    if (b.kind === 'dorm') p.append(h('img', { class: 'panel__photo', src: 'assets/photo/dorm.jpg', alt: '' }));
    if (b.kind === 'cover') p.append(h('span', { class: 'win win--dim' }), h('span', { class: 'cloth' }));
    if (b.kind === 'window') p.append(h('span', { class: 'win win--bright' }));
    if (b.kind === 'panic') p.append(...[1, 2, 3].map((n) => h('i', { class: `streak streak--${n}` })));
    if (b.kind === 'cabinet') p.append(h('span', { class: 'cabinet' }, h('i', { class: 'cabinet__door' })));
    if (b.kind === 'seed') p.append(h('span', { class: 'table' }, h('i', { class: 'seed' })));

    if (b.actors) {
      p.append(h('div', { class: 'panel__actors' },
        b.actors.map((who, i) => h('img', {
          class: `panel__actor panel__actor--${who}`,
          src: `${ART}/hs-${who}.png`,
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

    count.textContent = `${index + 1} / ${beats.length}`;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${b.dur}ms linear`;
      bar.style.width = '100%';
    });

    if (index === 2) setTimeout(() => { if (alive()) sfx.curtain(); }, 400);

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
    end.append(
      h('button', { class: 'btn', type: 'button', text: COMIC.endPlay, onclick: onPlay }),
      h('button', { class: 'btn btn--ghost', type: 'button', text: COMIC.endReplay, onclick: replay }),
      h('button', { class: 'btn btn--ghost', type: 'button', text: COMIC.endBack, onclick: onExit }),
    );
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
