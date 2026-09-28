// 四个场景：序章盒子 / 盒内目录 / 回忆一幕 / 终章。

import { BOX_ITEMS, UNI_ITEMS, EXTRAS, SCENES, FINALE, ANIM_PAGE, MEET, CHAT_U5, NAV, ICONS, START, UNCLE_DAY } from './data.js';
import { chapter1Done } from './progress.js';
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
  // 高中没看完之前，中间那格是空的、第二章也进不去
  const done = chapter1Done();

  const charms = done
    ? h('div', { class: 'charms', onclick: onCharm, role: 'button', tabindex: '0' },
      h('div', { class: 'charm charm--cat' },
        h('img', { src: 'assets/photo/charm-cat.png', alt: '小猫挂件' })),
      h('div', { class: 'charm charm--sushi' },
        h('img', { src: 'assets/photo/charm-sushi.png', alt: '三文鱼寿司挂件' })),
    )
    : h('div', { class: 'charms charms--locked' },
      h('span', { class: 'charms__locked', text: MEET.lockedHint }),
    );

  // 两章用同一套格子，只是第二章多一个"锁着"的状态
  const cell = (item, locked) => h('button', {
    class: `compartment${locked ? ' is-locked' : ''}`,
    type: 'button',
    disabled: locked || null,
    onclick: () => { if (!locked) onPick(item.id); },
  },
    h('span', { class: 'compartment__icon', html: ICONS[item.icon] }),
    h('span', { class: 'compartment__label', text: item.label }),
    h('span', { class: 'compartment__meta', text: item.meta }),
  );

  const plaque = (eyebrow, title, lock) => h('div', { class: 'cavity__plaque' },
    h('span', { class: 'cavity__eyebrow', text: eyebrow }),
    h('span', { class: 'cavity__title', text: title }),
    lock ? h('span', { class: 'cavity__lock', text: lock }) : null,
  );

  const cavity = h('div', { class: 'cavity' },
    plaque('CHAPTER 01', '高中 · 我们'),
    charms,
    done ? h('p', { class: 'charms__caption', text: MEET.charmsCaption }) : null,
    h('div', { class: 'compartments' }, BOX_ITEMS.map((it) => cell(it, false))),

    plaque('CHAPTER 02', '大学 · 假如', done ? null : MEET.uniLocked),
    h('div', { class: `compartments${done ? '' : ' compartments--locked'}` },
      UNI_ITEMS.map((it) => cell(it, !done))),

    h('div', { class: 'compartments compartments--single' },
      EXTRAS.map((it) => cell(it, false))),
  );

  const elapsed = countDays(START, UNCLE_DAY);
  return h('section', { class: 'scene scene--inside' },
    cavity,
    h('p', { class: 'inside-foot', text: `盒子里一共 ${elapsed} 天` }),
  );
}

/* ── 回忆一幕 ──────────────────────────────────────────── */

export function buildStory(scene, { index, onPrev, onNext, onExit, onPlay }) {
  const stage = h('div', { class: `story__stage${scene.fx === 'picnic' ? ' stage--picnic' : ''}` });
  if (scene.stage.bg) stage.style.background = scene.stage.bg;
  if (scene.stage.blur) stage.classList.add('stage--softphoto');
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
  // 布景小道具：纯 CSS 画的（桌子、外卖、床、长椅、奶茶…），按 scene.props 里的名字渲染。
  // 名字可以写成 { name, text }，那样里面还能带一两句小字（比如"第 1 天"）。
  (scene.props || []).forEach((p) => {
    const name = typeof p === 'string' ? p : p.name;
    const el = h('span', { class: `sprop sprop--${name}` });
    if (typeof p === 'object' && p.text) el.append(h('span', { class: 'sprop__text', text: p.text }));
    stage.append(el);
  });

  // 穿裙子那一页：画面上飘着他们那天聊的几句微信
  if (scene.chat) {
    stage.append(h('div', { class: 'wxbox' },
      CHAT_U5.map((line, i) => h('span', {
        class: `wxbox__line ${i % 2 ? 'wxbox__line--me' : 'wxbox__line--her'}`,
        style: `animation-delay:${(i * 1.1).toFixed(2)}s`,
        text: line,
      })),
    ));
  }

  // 第一章穿校服（hs），第二章换大学那套（uni）
  const cast = scene.set || 'hs';

  // 「两地合一」：第二章第一页用它，让画面把这页的话演一遍。
  // 分屏（两个城市各一半）-> 两地之间的连线亮起来 -> 缝消失、两人走到一起。
  if (scene.fx === 'merge') {
    stage.append(h('div', { class: 'merge' },
      h('span', { class: 'merge__side merge__side--jing' }),
      h('span', { class: 'merge__side merge__side--ya' }),
      h('span', { class: 'merge__divider' }),
      h('svg', { class: 'merge__route', viewBox: '0 0 100 38', preserveAspectRatio: 'none' },
        h('path', { class: 'merge__arc', d: 'M8 30 Q50 2 92 30' }),
        h('circle', { class: 'merge__pin merge__pin--jing', cx: 8, cy: 30, r: 2.4 }),
        h('circle', { class: 'merge__pin merge__pin--ya', cx: 92, cy: 30, r: 2.4 }),
        // 两点之间来回流动的小光点
        h('circle', { class: 'merge__dot', r: 1.6 },
          h('animateMotion', { dur: '3s', repeatCount: 'indefinite', path: 'M8 30 Q50 2 92 30' })),
        h('circle', { class: 'merge__dot', r: 1.6 },
          h('animateMotion', { dur: '3s', begin: '1.5s', repeatCount: 'indefinite', path: 'M8 30 Q50 2 92 30' })),
      ),
      h('span', { class: 'merge__city merge__city--jing', text: scene.cities.jing }),
      h('span', { class: 'merge__city merge__city--ya', text: scene.cities.ya }),
      h('span', { class: 'merge__glow' }),
      h('div', { class: 'merge__pair' },
        h('img', { class: 'merge__actor merge__actor--jing', src: `${ART}/${cast}-jing.png`, alt: '' }),
        h('img', { class: 'merge__actor merge__actor--ya', src: `${ART}/${cast}-ya.png`, alt: '' }),
      ),
    ));

    setTimeout(() => sfx.blip(), 520);       // 湖北亮出来
    setTimeout(() => sfx.blip(), 900);       // 广州亮出来
    setTimeout(() => sfx.tap(), 1700);       // 连线开始走
    setTimeout(() => sfx.relief(), 3050);    // 合到一起
  }

  if (scene.actors.length) {
    const wide = scene.gap === 'wide' ? ' actors--wide' : '';
    stage.append(h('div', { class: `actors${wide}` },
      scene.actors.map((who, i) =>
        h('div', { class: `actor actor--${who}`, style: `animation-delay:${i * 0.12}s` },
          h('img', { src: `${ART}/${cast}-${who}.png`, alt: '' }))),
    ));
  }

  scene.bubbles.forEach((b, i) => {
    stage.append(h('div', { class: `bubble bubble--${b.who} bubble--k${i}` },
      h('img', { class: 'bubble__face', src: `${FACE}/${b.who}-${scene.faces[b.who] || 'laugh'}.png`, alt: '' }),
      h('span', { class: 'bubble__text', text: b.text }),
    ));
  });

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
    h('button', { class: 'btn', type: 'button', text: scene.nextLabel || (scene.end ? NAV.nextEnd : NAV.next), onclick: onNext }),
  );

  return h('section', { class: `scene scene--story${scene.tone === 'cool' ? ' tone-cool' : ''}` },
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
      h('div', { class: 'finale__head' },
        h('div', { class: 'finale__eyebrow', text: FINALE.eyebrow }),
        h('h2', { class: 'finale__title', text: FINALE.title }),
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

/* ── 会合：高中看完之后，两只挂件吸在一起 ───────────────── */

export function buildMeet({ onNext, onExit }) {
  const stage = h('div', { class: 'meet__stage' },
    h('div', { class: 'meet__half meet__half--cat' }, h('img', { src: 'assets/photo/charm-cat.png', alt: '' })),
    h('div', { class: 'meet__half meet__half--sushi' }, h('img', { src: 'assets/photo/charm-sushi.png', alt: '' })),
    h('span', { class: 'meet__ring' }),
  );
  const inner = h('div', { class: 'meet' },
    h('div', { class: 'meet__eyebrow', text: MEET.eyebrow }),
    // 两只挂件中间那条柔和的连线，两端是两座城市
    h('div', { class: 'meet__cities' },
      h('span', { class: 'meet__city', text: MEET.cities.jing }),
      h('i', { class: 'meet__link' }),
      h('span', { class: 'meet__city', text: MEET.cities.ya })),
    stage,
    h('h2', { class: 'meet__title', text: MEET.title }),
    h('p', { class: 'meet__body', text: MEET.body }),
    h('button', { class: 'btn', type: 'button', text: MEET.action, onclick: onNext }),
  );
  const root = h('section', { class: 'scene scene--meet' },
    h('button', { class: 'back-to-box', type: 'button', text: '目录', onclick: onExit }),
    inner,
  );
  setTimeout(() => {
    inner.classList.add('is-joined');
    setTimeout(() => sfx.snap(), 900);
  }, 420);
  return root;
}

/* ── 附录：用形象做的几段小动画 ──────────────────────────
   全是 CSS 循环动画，没有定时器、没有 canvas；只用 transform / opacity，
   手机上跑起来不费电。每段的结构在这里，文字在 文案.txt。 */

export function buildAnim({ onNext, onExit }) {
  return h('section', { class: 'scene scene--anim' },
    h('button', { class: 'back-to-box', type: 'button', text: '目录', onclick: onExit }),
    h('div', { class: 'anim' },
      h('div', { class: 'anim__head' },
        h('div', { class: 'anim__eyebrow', text: ANIM_PAGE.eyebrow }),
        h('h2', { class: 'anim__title', text: ANIM_PAGE.title }),
        h('p', { class: 'anim__lead', text: ANIM_PAGE.lead }),
      ),
      ANIM_PAGE.items.map(vignette),
      h('p', { class: 'anim__bridge', text: ANIM_PAGE.bridge }),
      h('div', { class: 'anim__quote' },
        h('p', { class: 'anim__quote-text', text: ANIM_PAGE.quote }),
        h('p', { class: 'anim__quote-sign', text: ANIM_PAGE.quoteSign }),
      ),
      h('button', { class: 'btn', type: 'button', text: '打开最中间那一格', onclick: onNext }),
    ),
  );
}

function vignette(v) {
  const stage = h('div', { class: `vig__stage vig__stage--${v.kind}` });
  const actors = v.actors.map((who) => h('img', {
    class: `vig__actor vig__actor--${who}`,
    src: `${ART}/${v.set}-${who}.png`,
    alt: '',
  }));

  if (v.kind === 'dance') {
    // 我跳，她举着手机拍；后面再浮出一小块回看的画面
    stage.append(
      h('i', { class: 'beam beam--1' }), h('i', { class: 'beam beam--2' }),
      ...[1, 2, 3, 4, 5].map((n) => h('i', { class: `spark spark--${n}` })),
      ...actors,
      h('span', { class: 'phone' }, h('i', { class: 'phone__rec' })),
      h('span', { class: 'clip' },
        h('i', { class: 'clip__play' }),
        h('span', { class: 'clip__bar' }, h('i')),
      ),
    );
  } else if (v.kind === 'tv') {
    // 同一张床上一起看：床垫在下、人坐在上面、被子盖在他们前面
    stage.append(
      h('span', { class: 'bed' }),
      h('span', { class: 'bed__pillow' }),
      ...actors,
      h('span', { class: 'tv' }, h('i')),
      h('span', { class: 'quilt' }),
    );
  } else if (v.kind === 'ppt') {
    stage.append(
      h('span', { class: 'laptop' }, h('i'), h('i'), h('i')),
      h('b', { class: 'vig__tag', text: '接单 · 拿奖' }),
      ...actors,
    );
  } else if (v.kind === 'far') {
    stage.append(
      h('i', { class: 'link' }),
      h('b', { class: 'msg', text: v.msg }),
      ...actors,
    );
  } else {
    stage.append(...actors);
  }

  return h('div', { class: `vig vig--${v.kind}` },
    stage,
    h('div', { class: 'vig__text' },
      h('h3', { class: 'vig__title', text: v.title }),
      h('p', { class: 'vig__cap', text: v.cap }),
    ),
  );
}

/* ── 小工具 ────────────────────────────────────────────── */

function countDays(a, b) {
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d);
  return Math.round(ms / 86400000) + 1;   // 含第 1 天
}
