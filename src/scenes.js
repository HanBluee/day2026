// 四个场景：序章盒子 / 盒内目录 / 回忆一幕 / 终章。

import { BOX_ITEMS, PENDING, SCENES, FINALE, ICONS, START, UNCLE_DAY } from './data.js';
import { sfx } from './audio.js';
import { h } from './dom.js';

const ART = 'assets/char';
const FACE = 'assets/face';

/* ── 序章：纪念品盒 ────────────────────────────────────── */

export function buildBox({ onOpen }) {
  const lid = h('div', { class: 'box__lid' },
    h('div', { class: 'box__face box__face--outer' },
      h('div', { class: 'engrave' },
        h('span', { class: 'engrave__label', text: '相识第' }),
        h('span', { class: 'engrave__num', text: String(FINALE.days) }),
        h('span', { class: 'engrave__label', text: '天' }),
      ),
    ),
    h('div', { class: 'box__face box__face--inner' }),
  );

  const box = h('div', { class: 'box' },
    h('div', { class: 'box__interior' },
      h('img', { class: 'inbox-charm', src: 'assets/photo/charm-cat.png', alt: '' }),
      h('img', { class: 'inbox-charm', src: 'assets/photo/charm-sushi.png', alt: '' }),
    ),
    h('div', { class: 'box__base' }, h('div', { class: 'clasp' })),
    lid,
  );
  const stage = h('div', { class: 'box-stage' }, box);

  const head = h('div', { class: 'box-head' },
    h('p', { class: 'box-head__days', text: '第 2026 天' }),
    h('p', { class: 'box-head__range', text: '2021.03.14 — 2026.09.29' }),
  );
  const hint = h('p', { class: 'box-hint', text: '点一下 打开' });
  const root = h('section', { class: 'scene scene--box' }, head, stage, hint);

  // 盒盖掀起来会盖到标题上，让标题先退场
  function fadeChrome() {
    head.style.transition = hint.style.transition = 'opacity .8s var(--ease)';
    hint.style.animation = 'none';   // 呼吸动画优先级高于 inline style，先关掉才能淡出
    head.style.opacity = hint.style.opacity = '0';
  }

  let opened = false;

  // index.html#opened 直接看盒盖掀开的样子（调试和演示都用得上）
  if (location.hash === '#opened') {
    opened = true;
    fadeChrome();
    requestAnimationFrame(() => box.classList.add('is-open'));
  }

  root.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    sfx.clasp();
    box.classList.add('is-open');
    setTimeout(() => sfx.open(), 260);
    fadeChrome();
    setTimeout(() => {
      stage.classList.add('is-zooming');
      setTimeout(onOpen, 420);
    }, 1300);
  });

  return root;
}

/* ── 盒内：物件目录 ────────────────────────────────────── */

export function buildInside({ onPick, onCharm }) {
  const charms = h('div', { class: 'charms', onclick: onCharm, role: 'button', tabindex: '0' },
    h('div', { class: 'charm charm--cat' },
      h('img', { src: 'assets/photo/charm-cat.png', alt: '小猫挂件' })),
    h('div', { class: 'charm charm--sushi' },
      h('img', { src: 'assets/photo/charm-sushi.png', alt: '三文鱼寿司挂件' })),
  );

  const compartments = h('div', { class: 'compartments' },
    BOX_ITEMS.map((item) =>
      h('button', { class: 'compartment', type: 'button', onclick: () => onPick(item.id) },
        h('span', { class: 'compartment__icon', html: ICONS[item.icon] }),
        h('span', { class: 'compartment__label', text: item.label }),
        h('span', { class: 'compartment__meta', text: item.meta }),
      )),
    PENDING.map((p) =>
      h('div', { class: 'compartment compartment--empty compartment--wide' },
        h('span', { class: 'compartment__label', text: `${p.label} · 还在写` }),
        h('span', { class: 'compartment__meta', text: p.note }),
      )),
  );

  const cavity = h('div', { class: 'cavity' },
    h('div', { class: 'cavity__plaque' },
      h('span', { class: 'cavity__eyebrow', text: 'CHAPTER 01' }),
      h('span', { class: 'cavity__title', text: '高中 · 我们' }),
    ),
    charms,
    h('p', { class: 'charms__caption', text: '它们俩是吸在一起的 —— 最后再点这里' }),
    compartments,
  );

  const elapsed = countDays(START, UNCLE_DAY);
  return h('section', { class: 'scene scene--inside' },
    cavity,
    h('p', { class: 'inside-foot', text: `盒子里一共 ${elapsed} 天` }),
  );
}

/* ── 回忆一幕 ──────────────────────────────────────────── */

export function buildStory(scene, { index, onPrev, onNext, onExit, onPlay }) {
  const stage = h('div', { class: 'story__stage' });
  if (scene.stage.bg) stage.style.background = scene.stage.bg;
  if (scene.stage.photo) {
    stage.append(h('img', { class: 'stage__photo', src: scene.stage.photo, alt: '', loading: 'lazy' }));
    if (scene.stage.dim) {
      const dim = h('div', { class: 'stage__dim' });
      dim.style.background = `rgba(20,14,10,${scene.stage.dim})`;
      stage.append(dim);
    }
  }
  stage.append(h('div', { class: 'story__floor' }));
  stage.append(h('div', { class: 'stage__no', text: String(index + 1).padStart(2, '0') }));

  // 第一章都发生在高中，穿校服；以后大学篇把 scene.set 设成 'uni' 就会换一套立绘
  const cast = scene.set || 'hs';
  if (scene.actors.length) {
    stage.append(h('div', { class: 'actors' },
      scene.actors.map((who, i) =>
        h('div', { class: `actor actor--${who}`, style: `animation-delay:${i * 0.12}s` },
          h('img', { src: `${ART}/${cast}-${who}.png`, alt: '' }))),
    ));
  }

  for (const b of scene.bubbles) {
    stage.append(h('div', { class: `bubble bubble--${b.who}` },
      h('img', { class: 'bubble__face', src: `${FACE}/${b.who}-${scene.faces[b.who] || 'laugh'}.png`, alt: '' }),
      h('span', { class: 'bubble__text', text: b.text }),
    ));
  }

  const panel = h('div', { class: 'story__panel' },
    h('div', { class: 'story__eyebrow', text: scene.eyebrow }),
    h('h2', { class: 'story__title', text: scene.title }),
    h('div', { class: 'story__rule' }),
    h('p', { class: 'story__body', html: scene.body }),
  );
  if (scene.play) {
    panel.append(h('button', {
      class: 'btn btn--dark', type: 'button', text: scene.playLabel,
      style: 'margin-top:14px',
      onclick: onPlay,
    }));
  }

  const nav = h('div', { class: 'story__nav' },
    h('button', { class: 'btn btn--ghost', type: 'button', text: '目录', onclick: onExit }),
    h('span', { class: 'spacer' }),
    h('button', {
      class: 'btn btn--ghost', type: 'button', text: '上一段',
      disabled: index === 0 || null,
      onclick: onPrev,
    }),
    h('button', { class: 'btn', type: 'button', text: scene.end ? '打开最中间那一格' : '下一段', onclick: onNext }),
  );

  return h('section', { class: 'scene scene--story' },
    h('div', { class: 'story' }, stage, panel, nav),
  );
}

/* ── 终章 ──────────────────────────────────────────────── */

export function buildFinale({ onExit }) {
  const ring = h('div', { class: 'snap-ring' });
  const stage = h('div', { class: 'charms-stage' },
    ring,
    h('img', { class: 'half half--cat', src: 'assets/photo/charm-cat.png', alt: '小猫挂件' }),
    h('img', { class: 'half half--sushi', src: 'assets/photo/charm-sushi.png', alt: '三文鱼寿司挂件' }),
  );

  const root = h('section', { class: 'scene scene--finale' },
    h('button', { class: 'back-to-box', type: 'button', text: '目录', onclick: onExit }),
    h('div', { class: 'finale' },
      stage,
      h('div', { class: 'finale__days' },
        h('span', { class: 'label', text: '相识' }),
        h('span', { class: 'num', text: String(FINALE.days) }),
        h('span', { class: 'label', text: '天' }),
      ),
      h('div', { class: 'finale__letter' },
        FINALE.letter,
        h('span', { class: 'sign', text: FINALE.sign }),
      ),
      h('div', { class: 'slot' },
        h('div', { class: 'slot__title', text: FINALE.slotTitle }),
        h('div', { class: 'slot__note', text: FINALE.slotNote }),
      ),
      h('div', { class: 'finale__foot', text: FINALE.foot }),
    ),
  );

  const finale = root.querySelector('.finale');
  setTimeout(() => {
    finale.classList.add('is-joined');
    setTimeout(() => sfx.snap(), 900);
  }, 320);

  stage.addEventListener('click', () => {
    finale.classList.remove('is-joined');
    void finale.offsetWidth;      // 强制重排，让动画能重播
    setTimeout(() => {
      finale.classList.add('is-joined');
      setTimeout(() => sfx.snap(), 900);
    }, 60);
  });

  return root;
}

/* ── 小工具 ────────────────────────────────────────────── */

function countDays(a, b) {
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d);
  return Math.round(ms / 86400000) + 1;   // 含第 1 天
}
