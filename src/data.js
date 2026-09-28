// 内容层。文字都可以随她改；改完刷新即可，不需要重新构建。

export const START = { y: 2021, m: 3, d: 14 };   // 第 1 天
export const UNCLE_DAY = { y: 2026, m: 9, d: 29 }; // 第 2026 天

export const ME = { name: '王蕴瑶', nick: '丫丫' };   // 蓝
export const HER = { name: '邹静雯', nick: '小静雯' }; // 绿

/* ── 盒内物件：既是装饰，也是章节入口 ───────────────────── */

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
};

/* 盒内布局：前 8 格是第一章带日期的回忆，中间放挂件，最后两格待写 */
export const BOX_ITEMS = [
  { id: 's1', icon: 'desk',     label: '分班那天',   meta: '2021.03.14' },
  { id: 's2', icon: 'card',     label: '一起去食堂', meta: '高二 · 高三' },
  { id: 's3', icon: 'cards',    label: '泡面危机',   meta: '小游戏' },
  { id: 's4', icon: 'ticket',   label: '恐怖片',     meta: '放假 · 她家' },
  { id: 's5', icon: 'lamp',     label: '床上夜谈',   meta: '熄灯之后' },
  { id: 's6', icon: 'notebook', label: '抽查单词',   meta: 'ABANDON' },
  { id: 's7', icon: 'calendar', label: '那本日历',   meta: '2022 / 2023' },
  { id: 's8', icon: 'train',    label: '高考之后',   meta: '广州 ↔ 湖北' },
];

/* 第二章的入口。它不是"待写"，是真的可以点进去 */
export const UNI_ENTRY = {
  id: 'u1',
  icon: 'bowl',
  label: '大学篇 · 假如我们同校',
  note: '两个城市的距离，用一段我编的日常来量',
};

/* 跟时间线无关，但我想单独说的一页 */
export const EXTRAS = [
  { id: 'profile', icon: 'person', label: '性格卡', note: '你是谁、她是谁、我们为什么会像' },
];

/* ── 第一章八幕 ─────────────────────────────────────────── */

export const SCENES = [
  {
    id: 's1',
    eyebrow: '2021.03.14 · 高二下学期',
    title: '从今天开始数',
    body: '高二分班，我们在同一间教室碰上了。\n\n那时候谁也不知道，这一天是要拿来数很多年的。\n今天是第 <em>2026</em> 天。',
    stage: { bg: 'linear-gradient(175deg,#E8EEF4 0%,#D7E2EC 58%,#C3D2DF 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [
      { who: 'jing', text: '你好呀' },
      { who: 'ya', text: '……你好' },
    ],
  },
  {
    id: 's2',
    eyebrow: '高二 · 高三 · 日常',
    title: '没什么大事的那种日常',
    body: '一起上课，一起去食堂。\n\n我们的日常里没发生过什么大事。\n后来才明白，最难被替代的偏偏就是这种没什么大事的日常。',
    stage: { photo: 'assets/photo/together.jpg', bg: 'linear-gradient(175deg,#DCE6F0 0%,#C8D6E6 100%)', dim: .22 },
    actors: [],
    faces: { ya: 'laugh', jing: 'laugh' },
    bubbles: [],
  },
  {
    id: 's3',
    eyebrow: '高三 · 宿舍',
    title: '把东西藏起来',
    body: '整个宿舍堆满了好东西：自热火锅、零食、薯片、相机、手机，还有一副扑克牌。\n\n我们拿衣服把窗玻璃挡住——\n然后宿管阿姨一把拉开窗户，掀开了那件衣服。',
    stage: { photo: 'assets/photo/dorm.jpg', bg: 'linear-gradient(175deg,#2A2A32 0%,#1C1B21 100%)', dim: .42 },
    actors: [],
    faces: { ya: 'shock', jing: 'shock' },
    bubbles: [],
    play: 'noodles',
    playLabel: '帮我藏一下',
  },
  {
    id: 's4',
    eyebrow: '放假 · 她家',
    title: '她放恐怖片',
    body: '放假我去她家，她放恐怖片。\n\n她爱看。我不敢看，又想看。\n她就坐在旁边逗我。\n\n看完我们出去散步，走了很久。',
    stage: { bg: 'linear-gradient(178deg,#1E1B26 0%,#2C2734 62%,#171520 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: '这段最吓人，你看着' }],
  },
  {
    id: 's5',
    eyebrow: '宿舍 · 熄灯之后',
    title: '溜到她床上',
    body: '宿管阿姨巡逻结束之后，我从自己的床上溜过去。\n\n两个人挤在一张床上说话，说到很晚。\n说了什么我记不太清了，但我记得那种感觉。',
    stage: { bg: 'linear-gradient(178deg,#161320 0%,#221D2E 54%,#100D18 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'shy' },
    bubbles: [],
  },
  {
    id: 's6',
    eyebrow: '高三 · 教室',
    title: '我说我背好了',
    body: '我跟她说，单词我背好了。\n\n她真的开始抽我。\n\n……结果还是不会。',
    stage: { bg: 'linear-gradient(175deg,#EFEDE4 0%,#DEDACE 60%,#CFC9BA 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'cry', jing: 'angry' },
    bubbles: [
      { who: 'ya', text: '这次真的背了' },
      { who: 'jing', text: 'abandon 后面的那个' },
    ],
  },
  {
    id: 's7',
    eyebrow: '高三 · 跨年',
    title: '一云雾幻想一',
    body: '高三那年一起冲刺高考。\n\n跨年的时候她送了我一本日历，2022 / 2023。\n紫色的，包装很好看。\n\n我很喜欢。',
    stage: { photo: 'assets/photo/calendar.jpg', bg: 'linear-gradient(175deg,#E7E2F2 0%,#CFC6E6 100%)', dim: .18 },
    actors: [],
    faces: { ya: 'laugh', jing: 'shy' },
    bubbles: [],
  },
  {
    id: 's8',
    eyebrow: '2024 · 高考之后',
    title: '两条裙子还没有一起穿过',
    body: '高考结束，她去了湖北，我去了广州。\n\n生日的时候我们互相送了裙子：\n她送我的是蓝色长裙吊带，我送她的是绿色中裙吊带。\n\n到现在，我们还没有一起穿过。',
    stage: { bg: 'linear-gradient(178deg,#E4EAF0 0%,#C9D6E2 56%,#A9BCCE 100%)' },
    actors: ['ya', 'jing'],
    gap: 'wide',
    faces: { ya: 'down', jing: 'down' },
    bubbles: [],
  },

  /* ── 第二章：大学 · 假如 ──────────────────────────────
     这一段全是虚构的。开篇和收尾都明确说了"这是我编的"，
     中间才是编出来的日常——不然就成了撒谎。 */

  {
    id: 'u1',
    chapter: 'uni',
    tone: 'cool',
    set: 'uni',
    eyebrow: '第二章 · 假如我们同校，还是舍友',
    title: '先说清楚：这一段是我编的',
    body: '我们没在同一所大学。她在湖北，我在广州。\n\n所以下面这些场景，都是我写出来的——假如我们不但是同一所大学，还是同一个宿舍。\n\n我还是想写，是因为异地里最想要的从来不是"一起去旅行"，是"<em>一起去食堂</em>"。',
    stage: { bg: 'linear-gradient(178deg,#EDF3F8 0%,#D6E4EF 58%,#BDD2E3 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [{ who: 'ya', text: '那，从头来一次' }],
  },
  {
    id: 'u2',
    chapter: 'uni',
    tone: 'cool',
    set: 'uni',
    eyebrow: '假如 · 中午和下午',
    title: '一起去食堂，一起写作业',
    body: '她先到，占两个位置。我端着餐盘过去。\n\n下午在图书馆，她做题，我写我自己的。\n她中途转过来问我一个单词，我说不知道。',
    stage: { bg: 'linear-gradient(178deg,#F3F1E9 0%,#E3E0D3 58%,#D0CDBF 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'angry' },
    bubbles: [
      { who: 'jing', text: '你连这个都不知道' },
      { who: 'ya', text: '……那你教我' },
    ],
  },
  {
    id: 'u3',
    chapter: 'uni',
    tone: 'cool',
    set: 'uni',
    eyebrow: '假如 · 随舞路演',
    title: '她站在台下',
    body: '我上台随舞的时候，她站在最前排。\n\n她其实不太跳舞，也不太听 kpop。\n但那一整场她都拍了，回去还剪了一段发给我。',
    stage: { bg: 'linear-gradient(178deg,#1D1B26 0%,#2C2738 56%,#15121C 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: '拍好了，回去给你看' }],
  },
  {
    id: 'u4',
    chapter: 'uni',
    tone: 'cool',
    set: 'uni',
    eyebrow: '假如 · 宿舍，关灯以后',
    title: '这次换我陪她看',
    body: '《怪奇物语》她全部看完了，我陪她重看。\n\n高中是她放恐怖片逗我，现在灯关着，我照样捂着眼睛，她也照样在旁边笑我。\n\n有些东西异地也没变。',
    stage: { bg: 'linear-gradient(178deg,#161322 0%,#241D33 58%,#0E0B17 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'shy', jing: 'laugh' },
    bubbles: [{ who: 'jing', text: '这段最吓人，你看着' }],
  },
  {
    id: 'u5',
    chapter: 'uni',
    tone: 'cool',
    set: 'uni',
    eyebrow: '假如 · 生日',
    title: '那两条裙子，终于一起穿上了',
    body: '她送我的是蓝色长裙吊带，我送她的是绿色中裙吊带。\n\n买的时候我们没说好，但都挑了对方喜欢的颜色。\n\n在这个版本里，我们终于一起穿上了。',
    stage: { photo: 'assets/photo/dresses.jpg', bg: 'linear-gradient(175deg,#DCEBD8 0%,#C6DCC4 100%)', dim: .08 },
    actors: [],
    faces: { ya: 'laugh', jing: 'shy' },
    bubbles: [],
  },
  {
    id: 'u6',
    chapter: 'uni',
    tone: 'cool',
    set: 'uni',
    eyebrow: '第二章 · 到此为止',
    title: '编不下去了',
    body: '再往下就不能编了。\n\n真实的我们，是两个城市、每天微信、每年生日各自寄一箱东西。\n\n也没有不好。只是我现在很想你。',
    stage: { bg: 'linear-gradient(178deg,#E9EEF3 0%,#CBD8E4 58%,#ADC1D3 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'down', jing: 'down' },
    bubbles: [],
  },

  /* 编不下去之后回到真的。这一件真事跟那两条裙子是同一个模式——
     没商量，却挑了同一个东西。编的六幕日常，反而没有这一件打动人。 */

  {
    id: 'r1',
    chapter: 'real',
    set: 'uni',
    eyebrow: '这一段不是编的',
    title: '同一件东西，我们各买了一个',
    body: '《怪奇物语》她全部看完了。\n\n我想送她一只食人花书，都已经下单了。\n然后她突然跟我说：她有了。\n\n我就跟她坦白了——我刚好也给你买了一个。\n\n最后退掉了。可是这件事我记到现在。\n跟那两条裙子一样：<em>我们没商量，却挑了同一个东西</em>。',
    stage: { bg: 'linear-gradient(178deg,#F5F0E6 0%,#E7DFCE 58%,#D5C8B1 100%)' },
    actors: ['ya', 'jing'],
    faces: { ya: 'laugh', jing: 'shy' },
    bubbles: [
      { who: 'jing', text: '我有了诶' },
      { who: 'ya', text: '……我刚好也给你买了一个' },
    ],
    end: true,
  },
];

/* ── 微游戏：泡面危机 ───────────────────────────────────── */

export const NOODLES = {
  intro: '阿姨在敲门了。先把东西藏起来——<b>点一件东西，再点一个地方</b>。',
  spots: [
    { id: 'cabinet', name: '柜子' },
    { id: 'under', name: '床底' },
    { id: 'quilt', name: '被窝' },
  ],
  items: [
    { id: 'hotpot', label: '自热火锅', risk: true },
    { id: 'snack', label: '零食' },
    { id: 'chips', label: '薯片' },
    { id: 'camera', label: '相机' },
    { id: 'phone', label: '手机' },
    { id: 'cards', label: '扑克牌' },
  ],
  // 阿姨逐个开柜子，但结果一定是化险为夷——这是真事
  opens: [
    { spot: 'cabinet', line: '阿姨进来，先拉开了柜子。' },
    { spot: 'quilt', line: '她顺手掀了一下被窝。' },
  ],
  luck: '她拉开的是 —— 那个<b>什么都没藏</b>的柜子。',
  near: '她把手电筒往里照了照，你压在最底下的那件东西没露出来。',
  outcome: [
    '阿姨在宿舍里转了一圈，把我们训了两句。',
    '最后她翻出来的，只有<b>一颗瓜子</b>。',
    '我们谁都没敢出声。她一关门，整个宿舍同时松了一口气。',
  ],
};

/* ── 终章 ───────────────────────────────────────────────── */

export const FINALE = {
  days: 2026,
  letter:
    '我们隔着两座城市，但还是每天都说话。\n' +
    '我们两个都是 INFJ——她原来不是，是后来变成的。\n' +
    '我知道她因为我改了一些东西，我也因为她庆幸了很多。\n' +
    '我们从同一间教室开始，现在在两个地方各自长大。\n\n' +
    '今天是我们认识的第 2026 天。\n' +
    '我把这些话全放进这个盒子里，等你打开。',
  sign: '王蕴瑶 · 丫丫',
  slotTitle: '这一格留给你',
  slotNote: '我们约好要过纪念日，但我不知道你在做什么，你也不知道我在做什么。\n所以这里先空着。',
  foot: '2021.03.14 — 2026.09.29',
};

/* ── 附录：性格卡 ───────────────────────────────────────── */

export const PROFILE = {
  eyebrow: 'APPENDIX · 性格卡',
  title: '我们是什么样的人',
  lead: '两个心思都细的人凑在一起，会变成什么样。',
  blocks: [
    {
      type: 'pair',
      caption: '我们两个都是 INFJ。她原来不是。',
    },
    {
      type: 'who',
      who: 'jing',
      name: HER.name,
      nick: HER.nick,
      tag: '湖北 · JK · 怪奇物语',
      points: [
        {
          t: '她不只是喜欢，她要把它做到最好',
          d: '班上要讲 PPT，她讲自己喜欢的《怪奇物语》，做到极好，后来还接了单、拿了奖。喜欢对她来说不是消遣，是拿得出手的东西。',
        },
        {
          t: '个子最小，做事最认真',
          d: '她比你矮半个头。但她想做的事，就会真的去做。',
        },
        {
          t: '她的 MBTI 本来不是 INFJ',
          d: '原来是 ISTJ-A。我没有把她变成另一个人——我只是让她本来就有的那部分，从"认真"，长出了"感受"。',
        },
      ],
    },
    {
      type: 'who',
      who: 'ya',
      name: ME.name,
      nick: ME.nick,
      tag: '广州 · 跳舞 · 韩知城',
      points: [
        {
          t: '你把情绪交给身体',
          d: '你追的韩知城自己写歌、公开谈焦虑、把情绪做成作品；你每个周末都去随舞路演。对一个 INFJ 来说，在人前这样暴露自己是勇气，不是外向。',
        },
        {
          t: '你负责把在意变成行动',
          d: '约好要过纪念日、每年的生日祝福、还有这个盒子——你不会让在意停在心里。',
        },
      ],
    },
    {
      type: 'bridge',
      title: '我们为什么会像',
      lead: '不是因为性格一样，是互相补上了对方缺的那一块。',
      left: {
        label: '我给她的',
        text: '可以不那么认真。泡面、自热火锅、恐怖片、随舞——我让她知道有些事允许胡闹、允许不完美。',
      },
      right: {
        label: '她给我的',
        text: '把热爱做成东西。喜欢一样东西，可以认真到把它变成作品。',
      },
      tail: '所以她更敢玩、更松弛了；你更会把热爱变成东西了。',
    },
    {
      type: 'quote',
      text: '你有没有发现——这个盒子，就是我用她的方式在做的事。\n把一个"喜欢"，认真做成一件拿得出手的东西。',
      sign: '（她大概会在这里笑我。）',
    },
  ],
};
