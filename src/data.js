// 结构层：谁在哪一幕、用什么布景、图标怎么画。
//
// ⚠️ 这个文件里**不放给人看的文字**。所有文案都在根目录的 文案.txt 里，
//   由 tools/copy.mjs 生成 content.js 供这里读取（键名一致的 T('…')）。
//     node tools/copy.mjs --build    改完文案后重新生成

import COPY from './content.js';

const T = (key) => {
  if (key in COPY) return COPY[key];
  console.warn('[文案缺失]', key);
  return `〔${key}〕`;
};

export const START = { y: 2021, m: 3, d: 14 };     // 第 1 天
export const UNCLE_DAY = { y: 2026, m: 9, d: 29 }; // 第 2026 天

export const ME = { name: T('me.name'), nick: T('me.nick') };   // 蓝
export const HER = { name: T('her.name'), nick: T('her.nick') }; // 绿

/* 有些场景要显示一两句小字（比如"第 1 天"），单独放这儿 */
export const SCENE_TEXT = {
  s1: { day1: T('s1.day1'), wx: T('s1.wx') },
  s2: { chat: T('s2.chat') },
};

/* ── 图标（纯结构，不是文案） ───────────────────────────── */

const svg = (body, stroke = 'currentColor') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.4"
        stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  desk: svg('<path d="M3 9h18M4 9v10M20 9v10M8 9V6h8v3M4 15h16"/>'),
  card: svg('<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M2.5 10h19M6 14h4"/>'),
  cards: svg('<rect x="3" y="5" width="9" height="13" rx="1"/><path d="M14.5 7.5l2.5-1.6 4 6.4-3 1.8"/><path d="M6 9.5l1.5 2"/>'),
  ticket: svg('<path d="M3 7.5h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4z"/><path d="M9 7.5v10" stroke-dasharray="1.6 1.8"/>'),
  lamp: svg('<path d="M8 4h8l3 7H5z"/><path d="M12 11v6M9 20h6"/>'),
  notebook: svg('<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 3v18M12 8h4M12 12h4"/>'),
  calendar: svg('<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M8 13h3v3H8z"/>'),
  train: svg('<rect x="5" y="3.5" width="14" height="13" rx="2.5"/><path d="M5 11h14M9 20l-1.5 2M15 20l1.5 2M8.5 16.5h7"/><circle cx="9" cy="13.6" r=".9"/><circle cx="15" cy="13.6" r=".9"/>'),
  bowl: svg('<path d="M3.5 11.5h17c0 4.7-3.8 8.5-8.5 8.5s-8.5-3.8-8.5-8.5z"/><path d="M12 20v2.5M16 3.5l-2 7M18.5 4.5l-1.8 6"/>'),
  person: svg('<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>'),
  play: svg('<circle cx="12" cy="12" r="8.5"/><path d="M10.2 8.6l5.6 3.4-5.6 3.4z"/>'),
  door: svg('<rect x="5" y="3" width="14" height="18" rx="1.5"/><circle cx="15.4" cy="12" r=".9"/><path d="M10 21v-1.6"/>'),
  music: svg('<path d="M9 17.5V5l10-2v12.5"/><circle cx="6.6" cy="17.6" r="2.5"/><circle cx="16.6" cy="15.6" r="2.5"/>'),
  tv: svg('<rect x="2.5" y="6.5" width="19" height="12.5" rx="1.5"/><path d="M8 3l4 3.2L16 3"/>'),
  dress: svg('<path d="M9.2 3.4L12 5.6l2.8-2.2M12 5.6v2.6"/><path d="M12 8.2c-3.6 1.2-6.2 4.8-6.2 9.6h12.4c0-4.8-2.6-8.4-6.2-9.6z"/>'),
  cloud: svg('<path d="M7.2 18h9.3a3.6 3.6 0 000-7.2 5.1 5.1 0 00-9.8-1.2A4 4 0 007.2 18z"/>'),
};

/* ── 盒内布局：8 格高中回忆，然后是第二章入口和附录 ─────── */

export const BOX_ITEMS = [
  { id: 's1', icon: 'desk',     label: T('box.1.label'), meta: T('box.1.meta') },
  { id: 's2', icon: 'card',     label: T('box.2.label'), meta: T('box.2.meta') },
  { id: 's3', icon: 'cards',    label: T('box.3.label'), meta: T('box.3.meta') },
  { id: 's4', icon: 'ticket',   label: T('box.4.label'), meta: T('box.4.meta') },
  { id: 's5', icon: 'lamp',     label: T('box.5.label'), meta: T('box.5.meta') },
  { id: 's6', icon: 'notebook', label: T('box.6.label'), meta: T('box.6.meta') },
  { id: 's7', icon: 'calendar', label: T('box.7.label'), meta: T('box.7.meta') },
  { id: 's8', icon: 'train',    label: T('box.8.label'), meta: T('box.8.meta') },
];

// 第二章跟第一章一样，也是一格格摆在盒子里
export const UNI_ITEMS = [
  { id: 'u1', icon: 'door',  label: T('unibox.1.label'), meta: T('unibox.1.meta') },
  { id: 'u2', icon: 'bowl',  label: T('unibox.2.label'), meta: T('unibox.2.meta') },
  { id: 'u3', icon: 'music', label: T('unibox.3.label'), meta: T('unibox.3.meta') },
  { id: 'u4', icon: 'tv',    label: T('unibox.4.label'), meta: T('unibox.4.meta') },
  { id: 'u5', icon: 'dress', label: T('unibox.5.label'), meta: T('unibox.5.meta') },
  { id: 'u6', icon: 'cloud', label: T('unibox.6.label'), meta: T('unibox.6.meta') },
];


export const EXTRAS = [
  { id: 'anim', icon: 'play', label: T('extra.label'), note: T('extra.note') },
];

/* ── 第一幕到第八幕：高中（真实发生） ───────────────────── */

const HS = [
  {
    id: 's1',
    eyebrow: T('s1.eyebrow'), title: T('s1.title'), body: T('s1.body'),
    // 春日教室：斜阳、樱花瓣、课桌和摊开的课本、微信加好友的小窗
    stage: { bg: 'linear-gradient(176deg,#FDF3E4 0%,#F7E7D2 42%,#E9DCC8 70%,#D8CFBC 100%)' },
    props: [
      'sunray',
      'desk', 'book', 'pen',
      'petal1', 'petal2', 'petal3', 'petal4', 'petal5', 'petal6',
      { name: 'wxadd', text: SCENE_TEXT.s1.wx },
      { name: 'day1', text: SCENE_TEXT.s1.day1 },
    ],
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: T('s1.bubble.1') }, { who: 'ya', text: T('s1.bubble.2') }],
  },
  {
    id: 's2',
    eyebrow: T('s2.eyebrow'), title: T('s2.title'), body: T('s2.body'),
    // 合照当柔焦底，前面摆一排日常的痕迹：两套课本、两支笔、餐盘、饭盒、椅子
    stage: { photo: 'assets/photo/together.jpg', bg: 'linear-gradient(178deg,#EDE7DA 0%,#DED5C4 100%)', dim: .46, blur: true },
    props: ['books', 'pens', 'tray', 'lunchbox', 'chairs', { name: 'chatter', text: SCENE_TEXT.s2.chat }],
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'laugh' },
    bubbles: [],
  },
  {
    id: 's3',
    eyebrow: T('s3.eyebrow'), title: T('s3.title'), body: T('s3.body'),
    stage: { photo: 'assets/photo/dorm.jpg', bg: 'linear-gradient(175deg,#2A2A32 0%,#1C1B21 100%)', dim: .42 },
    actors: [],
    faces: { ya: 'shock', jing: 'shock' },
    bubbles: [],
    play: 'comic',
    playLabel: T('s3.playLabel'),
  },
  {
    id: 's4',
    eyebrow: T('s4.eyebrow'), title: T('s4.title'), body: T('s4.body'),
    stage: { bg: 'linear-gradient(178deg,#1E1B26 0%,#2C2734 62%,#171520 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: T('s4.bubble.1') }],
  },
  {
    id: 's5',
    eyebrow: T('s5.eyebrow'), title: T('s5.title'), body: T('s5.body'),
    stage: { bg: 'linear-gradient(178deg,#161320 0%,#221D2E 54%,#100D18 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'shy' },
    bubbles: [],
  },
  {
    id: 's6',
    eyebrow: T('s6.eyebrow'), title: T('s6.title'), body: T('s6.body'),
    stage: { bg: 'linear-gradient(175deg,#EFEDE4 0%,#DEDACE 60%,#CFC9BA 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'cry', jing: 'angry' },
    bubbles: [{ who: 'ya', text: T('s6.bubble.1') }, { who: 'jing', text: T('s6.bubble.2') }],
  },
  {
    id: 's7',
    eyebrow: T('s7.eyebrow'), title: T('s7.title'), body: T('s7.body'),
    stage: { photo: 'assets/photo/calendar.jpg', bg: 'linear-gradient(175deg,#E7E2F2 0%,#CFC6E6 100%)', dim: .18 },
    actors: [],
    faces: { ya: 'laugh', jing: 'shy' },
    bubbles: [],
  },
  {
    id: 's8',
    eyebrow: T('s8.eyebrow'), title: T('s8.title'), body: T('s8.body'),
    stage: { bg: 'linear-gradient(178deg,#E4EAF0 0%,#C9D6E2 56%,#A9BCCE 100%)' },
    actors: ['ya', 'jing'],
    gap: 'wide',
    faces: { ya: 'down', jing: 'down' },
    bubbles: [],
  },
];

/* ── 第二章：大学 · 假如 ──────────────────────────────────
   这一段全是虚构的。开篇和收尾都明确写了"这是我编的"，
   中间才是编出来的日常——不然就成了撒谎。 */

const UNI = [
  {
    id: 'u1',
    chapter: 'uni', tone: 'cool', set: 'uni',
    eyebrow: T('u1.eyebrow'), title: T('u1.title'), body: T('u1.body'),
    stage: { bg: 'linear-gradient(178deg,#EDF3F8 0%,#D6E4EF 58%,#BDD2E3 100%)' },
    // 这一幕不用「站着」的立绘：两个城市各自一块，然后合到一起
    fx: 'merge',
    cities: { jing: T('u1.city.jing'), ya: T('u1.city.ya') },
    actors: [],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [{ who: 'ya', text: T('u1.bubble.1') }],
  },
  {
    id: 'u2',
    chapter: 'uni', tone: 'cool', set: 'uni',
    eyebrow: T('u2.eyebrow'), title: T('u2.title'), body: T('u2.body'),
    stage: { bg: 'linear-gradient(178deg,#2E2A32 0%,#25222B 58%,#1A171F 100%)' },
    props: ['desk', 'box1', 'box2', 'cup', 'pc'],
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: T('u2.bubble.1') }, { who: 'ya', text: T('u2.bubble.2') }],
  },
  {
    id: 'u3',
    chapter: 'uni', tone: 'cool', set: 'uni',
    eyebrow: T('u3.eyebrow'), title: T('u3.title'), body: T('u3.body'),
    stage: { bg: 'linear-gradient(178deg,#1D1B26 0%,#2C2738 56%,#15121C 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: T('u3.bubble.1') }],
  },
  {
    id: 'u4',
    chapter: 'uni', tone: 'cool', set: 'uni',
    eyebrow: T('u4.eyebrow'), title: T('u4.title'), body: T('u4.body'),
    stage: { bg: 'linear-gradient(178deg,#1A1626 0%,#2A2238 58%,#100C1A 100%)' },
    props: ['bed', 'pillow', 'quilt', 'screen'],
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: T('u4.bubble.1') }],
  },
  {
    id: 'u5',
    chapter: 'uni', tone: 'cool', set: 'dress',
    eyebrow: T('u5.eyebrow'), title: T('u5.title'), body: T('u5.body'),
    // 不用那张静态插画了：换成穿着裙子的立绘，在野餐垫上动起来
    fx: 'picnic',
    stage: { bg: 'linear-gradient(178deg,#FBE4C6 0%,#F2D3AC 40%,#CFC9A4 62%,#A9BC8E 100%)' },
    // 公园黄昏：树影、长椅、路灯、地上的票和奶茶、拍立得、那本书、一束花
    props: ['dusk', 'tree', 'bench', 'lamp', 'bouquet', 'book', 'tickets', 'tea1', 'tea2', 'polaroid'],
    chat: true,
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'shy' },
    bubbles: [],
  },
  {
    id: 'u6',
    chapter: 'uni', tone: 'cool', set: 'uni',
    eyebrow: T('u6.eyebrow'), title: T('u6.title'), body: T('u6.body'),
    stage: { bg: 'linear-gradient(178deg,#E9EEF3 0%,#CBD8E4 58%,#ADC1D3 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'down', jing: 'down' },
    bubbles: [],
  },
];

/* ── 编不下去之后回到真的。这一件真事跟那两条裙子是同一个模式——
   没商量，却挑了同一个东西。编的六幕日常，反而没有这一件打动人。 */

const REAL = [
  {
    id: 'r1',
    chapter: 'real', set: 'uni',
    eyebrow: T('r1.eyebrow'), title: T('r1.title'), body: T('r1.body'),
    stage: { bg: 'linear-gradient(178deg,#F5F0E6 0%,#E7DFCE 58%,#D5C8B1 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'shy' },
    bubbles: [{ who: 'jing', text: T('r1.bubble.1') }, { who: 'ya', text: T('r1.bubble.2') }],
    end: true,
  },
];

export const SCENES = [...HS, ...UNI, ...REAL];

/* ── 微游戏：泡面危机 ───────────────────────────────────── */

export const NOODLES = {
  intro: T('noodles.intro'),
  guideTitle: T('noodles.guideTitle'),
  guide: [T('noodles.guide1'), T('noodles.guide2'), T('noodles.guide3')],
  clothHint: T('noodles.clothHint'),
  clothDone: T('noodles.clothDone'),
  rumble: T('noodles.rumble'),
  knock: T('noodles.knock'),
  spotCabinet: T('noodles.spotCabinet'),
  spotBed: T('noodles.spotBed'),
  // 四个柜子 + 两张上下铺（一共四张床）
  zones: [
    { id: 'c1', kind: 'cabinet', label: '柜子 1' },
    { id: 'c2', kind: 'cabinet', label: '柜子 2' },
    { id: 'c3', kind: 'cabinet', label: '柜子 3' },
    { id: 'c4', kind: 'cabinet', label: '柜子 4' },
    { id: 'b1u', kind: 'bed', label: '左 · 上铺' },
    { id: 'b1d', kind: 'bed', label: '左 · 下铺' },
    { id: 'b2u', kind: 'bed', label: '右 · 上铺' },
    { id: 'b2d', kind: 'bed', label: '右 · 下铺' },
  ],
  items: [
    { id: 'hotpot', label: T('noodles.item.1'), short: '锅' },
    { id: 'snack', label: T('noodles.item.2'), short: '零' },
    { id: 'chips', label: T('noodles.item.3'), short: '薯' },
    { id: 'camera', label: T('noodles.item.4'), short: '机' },
    { id: 'phone', label: T('noodles.item.5'), short: '手' },
    { id: 'cards', label: T('noodles.item.6'), short: '牌' },
  ],
  // 阿姨逐个开柜子，但结果一定是化险为夷——这是真事
  opens: ['c1', 'b2d'],
  luck: T('noodles.luck'),
  near: T('noodles.near'),
  outcome: [T('noodles.outcome1'), T('noodles.outcome2'), T('noodles.outcome3')],
};

/* ── 终章 ───────────────────────────────────────────────── */

export const CHAT_U5 = [T('u5.chat.1'), T('u5.chat.2'), T('u5.chat.3'), T('u5.chat.4')];

/* ── 会合：高中看完之后，两只挂件才出现 ─────────────────── */

export const MEET = {
  eyebrow: T('meet.eyebrow'),
  title: T('meet.title'),
  body: T('meet.body'),
  action: T('meet.action'),
  lockedHint: T('box.locked'),
  uniLocked: T('uni.locked'),
  charmsCaption: T('box.charms'),
};

/* ── 小剧场：泡面危机（分镜） ─────────────────────────────
   kind 决定这一格画什么、镜头怎么动、什么时候出字幕；
   台词和旁白全在 文案.txt 的 comic.* 里。 */

export const COMIC = {
  from: T('comic.from'),
  hint: T('comic.hint'),
  endPlay: T('comic.endPlay'),
  endReplay: T('comic.endReplay'),
  endBack: T('comic.endBack'),
  beats: [
    { key: 'c1', kind: 'dorm',    cam: 'push',     dur: 5400, sub: T('comic.c1.sub') },
    { key: 'c2', kind: 'cover',   cam: 'push',     dur: 4400, sub: T('comic.c2.sub'),
      actors: ['ya', 'jing'], faces: { ya: 'shock', jing: 'laugh' },
      bubble: 'jing', bubbleText: T('comic.c2.bubble') },
    { key: 'c3', kind: 'window',  cam: 'shake',    dur: 4000, sub: T('comic.c3.sub'),
      bubble: 'none', bubbleText: T('comic.c3.bubble') },
    { key: 'c4', kind: 'panic',   cam: 'push',     dur: 4400, sub: T('comic.c4.sub'),
      actors: ['ya', 'jing'], faces: { ya: 'shock', jing: 'shock' } },
    { key: 'c5', kind: 'cabinet', cam: 'push',     dur: 5200, sub: T('comic.c5.sub'),
      bubble: 'none', bubbleText: T('comic.c5.bubble') },
    { key: 'c6', kind: 'relief',  cam: 'hold',     dur: 3800, sub: T('comic.c6.sub'),
      actors: ['ya', 'jing'], faces: { ya: 'shy', jing: 'shy' } },
    { key: 'c7', kind: 'seed',    cam: 'pushSlow', dur: 4800, sub: T('comic.c7.sub') },
    { key: 'c8', kind: 'relief',  cam: 'hold',     dur: 5400, sub: T('comic.c8.sub'),
      actors: ['ya', 'jing'], faces: { ya: 'laugh', jing: 'laugh' },
      bubble: 'ya', bubbleText: T('comic.c8.bubble') },
  ],
};

/* ── 终章 ───────────────────────────────────────────────── */
export const FINALE = {
  days: 2026,
  letter: T('finale.letter'),
  sign: T('finale.sign'),
  slotTitle: T('finale.slotTitle'),
  slotNote: T('finale.slotNote'),
  foot: T('finale.foot'),
};

/* ── 附录：用形象做的几段小动画 ───────────────────────────
   与其用形容词说她们是什么样的人，不如把几段日常动起来。
   每段的结构（谁出场、什么布景）在这里，文字全在 文案.txt。 */

export const ANIM_PAGE = {
  eyebrow: T('anim.eyebrow'),
  title: T('anim.title'),
  lead: T('anim.lead'),
  items: [
    { kind: 'dance', set: 'uni', actors: ['ya', 'jing'], title: T('anim.1.title'), cap: T('anim.1.cap') },
    { kind: 'ppt',   set: 'uni', actors: ['jing'],      title: T('anim.2.title'), cap: T('anim.2.cap') },
    { kind: 'tv',    set: 'uni', actors: ['ya', 'jing'], title: T('anim.3.title'), cap: T('anim.3.cap') },
    { kind: 'far',   set: 'uni', actors: ['ya', 'jing'], title: T('anim.4.title'), cap: T('anim.4.cap'), msg: T('anim.4.msg') },
  ],
  bridge: T('anim.bridge'),
  quote: T('anim.quote'),
  quoteSign: T('anim.quoteSign'),
};
