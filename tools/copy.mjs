/**
 * 文案的进出口。
 *
 *   node tools/copy.mjs --export    从 src/data.js 导出 文案.txt（给人改）
 *   node tools/copy.mjs --build     从 文案.txt 生成 src/content.js（给网站读）
 *   node tools/copy.mjs --check     只检查 文案.txt 的键是否齐全，不写文件
 *
 * 这么绕一圈是为了把「文字」和「代码」分开：
 * 站点里所有会显示给人看的字都走这里，data.js 只留结构和布局。
 * 文案.txt 是普通文本，用任何编辑器都能改；改完跑 --build 就生效。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TXT = join(ROOT, '文案.txt');
const OUT = join(ROOT, 'src', 'content.js');

/* ── 收集字段：每一条都知道自己是谁、显示在哪 ───────────── */

async function collect() {
  const D = await import(new URL('../src/data.js', import.meta.url));
  const out = [];
  const gap = (text) => out.push({ gap: text });
  const head = (title, where) => out.push({ head: title, where });
  const f = (key, note, value) => out.push({ key, note, value });

  // ── 开头的说明与导览 ──────────────────────────────────
  gap('第 2026 天 · 全部文案');
  gap('');
  gap('【怎么改】');
  gap('   · 只改「### 键名」底下的内容，### 那一行不要动');
  gap('   · 空行会保留 —— 正文里空一行就是分段');
  gap('   · <em>文字</em> 是粉色高亮，<b>文字</b> 是加粗');
  gap('   · 改完双击 发布.cmd（或跑 node tools/copy.mjs --build）');
  gap('');
  gap('【网站的顺序】照着这个找你要改的地方');
  gap('');
  gap('   序章           盒子开盖，点一下掀开');
  gap('   第一章 高中     8 幕（真事）············ s1 ~ s8');
  gap('        └ 第 3 幕里还有：小剧场「泡面危机」+ 可以自己玩的小游戏');
  gap('   会合           小猫和寿司吸在一起······· meet');
  gap('   第二章 大学     6 页（假如）··········· u1 ~ u6');
  gap('   霸王花         那件真事················ r1');
  gap('   小动画         四段···················· anim');
  gap('   终章           那封信·················· finale');
  gap('');
  gap('   另外：盒子里格子的名字是 box.* / unibox.*，');
  gap('         小游戏台词是 noodles.*，小剧场台词是 comic.*。');
  gap('');

  // ── 正文（顺序跟网站上走一遍的顺序一致） ──────────────
  head('名字', '到处都会用到');
  f('me.name', '我的名字', D.ME.name);
  f('me.nick', '我的外号', D.ME.nick);
  f('her.name', '她的名字', D.HER.name);
  f('her.nick', '我给她起的备注', D.HER.nick);

  head('盒子目录 · 第一章的八格', '打开盒子，第一排八格');
  D.BOX_ITEMS.forEach((it, i) => {
    f(`box.${i + 1}.label`, `第 ${i + 1} 格 · 名字`, it.label);
    f(`box.${i + 1}.meta`, `第 ${i + 1} 格 · 小字`, it.meta);
  });
  f('box.locked', '高中没看完时，盒子中间那格的小字', D.MEET.lockedHint);
  f('uni.locked', '高中没看完时，第二章标题旁边的提示', D.MEET.uniLocked);
  f('box.charms', '挂件下面那句（看完高中才出现）', D.MEET.charmsCaption);

  head('盒子目录 · 第二章的六格', '打开盒子，第二排六格');
  D.UNI_ITEMS.forEach((it, i) => {
    f(`unibox.${i + 1}.label`, `第 ${i + 1} 格 · 名字`, it.label);
    f(`unibox.${i + 1}.meta`, `第 ${i + 1} 格 · 小字`, it.meta);
  });
  f('extra.label', '「小动画」那一格的名字', D.EXTRAS[0].label);
  f('extra.note', '「小动画」那一格的小字', D.EXTRAS[0].note);

  const sceneBlock = (s, roman, where) => {
    gap('');
    head(roman, where);
    f(`${s.id}.eyebrow`, '灰字小标（最上面那行）', s.eyebrow);
    f(`${s.id}.title`, '大标题', s.title);
    f(`${s.id}.body`, '正文（空行分段）', s.body);
    s.bubbles.forEach((b, i) => {
      f(`${s.id}.bubble.${i + 1}`, `对白 ${i + 1} · ${b.who === 'ya' ? '我说的' : '她说的'}`, b.text);
    });
    if (s.playLabel) f(`${s.id}.playLabel`, '进入小剧场的按钮', s.playLabel);
    if (s.cities) {
      f(`${s.id}.city.jing`, '左边飘出来的地名（她那边）', s.cities.jing);
      f(`${s.id}.city.ya`, '右边飘出来的地名（我这边）', s.cities.ya);
    }
  };

  head('第一章 · 高中（八幕，都是真事）', '盒子里第一排的八格，或者从盒子一路「下一段」');
  D.SCENES.filter((s) => !s.chapter).forEach((s, i) => {
    sceneBlock(s, `第 ${i + 1} 幕`, `盒子第一排第 ${i + 1} 格「${D.BOX_ITEMS[i].label}」`);
  });

  head('初遇那一页的画面小字', '第一章第 1 幕，桌角和窗边飘出来的');
  f('s1.day1', '淡淡的「第几天」计数', D.SCENE_TEXT.s1.day1);
  f('s1.wx', '微信加好友小窗上的那句话', D.SCENE_TEXT.s1.wx);

  head('日常那一页的画面小字', '第一章第 2 幕，课桌旁飘出来的气泡');
  f('s2.chat', '课间随口的吐槽（气泡里的那句）', D.SCENE_TEXT.s2.chat);

  head('小剧场 · 泡面危机（分镜）', '第一章第 3 幕点「帮我藏一下」之后先放这个');
  f('comic.from', '左上角的小标', D.COMIC.from);
  f('comic.hint', '底部的操作提示', D.COMIC.hint);
  f('comic.endPlay', '结束页 · 第一个按钮', D.COMIC.endPlay);
  f('comic.endReplay', '结束页 · 第二个按钮', D.COMIC.endReplay);
  f('comic.endBack', '结束页 · 第三个按钮', D.COMIC.endBack);
  D.COMIC.beats.forEach((b, i) => {
    f(`comic.${b.key}.sub`, `第 ${i + 1} 格 · 底部的字幕`, b.sub);
    if (b.bubble) {
      const who = b.bubble === 'ya' ? '我说的' : b.bubble === 'jing' ? '她说的' : '画外音';
      f(`comic.${b.key}.bubble`, `第 ${i + 1} 格 · 对白（${who}）`, b.bubbleText);
    }
  });

  head('小游戏 · 泡面危机（拖拽版）', '第一章第 3 幕点「开始藏」按钮进入');
  f('noodles.intro', '开场那句话', D.NOODLES.intro);
  f('noodles.guideTitle', '攻略面板的标题', D.NOODLES.guideTitle);
  f('noodles.guide1', '攻略第 1 条', D.NOODLES.guide[0]);
  f('noodles.guide2', '攻略第 2 条', D.NOODLES.guide[1]);
  f('noodles.guide3', '攻略第 3 条', D.NOODLES.guide[2]);
  f('noodles.clothHint', '挡窗户那一步的提示', D.NOODLES.clothHint);
  f('noodles.clothDone', '挡好之后的话', D.NOODLES.clothDone);
  f('noodles.rumble', '走廊里的动静', D.NOODLES.rumble);
  f('noodles.knock', '阿姨敲门', D.NOODLES.knock);
  f('noodles.spotCabinet', '柜子的名字', D.NOODLES.spotCabinet);
  f('noodles.spotBed', '床的名字', D.NOODLES.spotBed);
  f('noodles.luck', '阿姨拉开空柜子时的话', D.NOODLES.luck);
  f('noodles.near', '阿姨照了手电时的话', D.NOODLES.near);
  f('noodles.outcome1', '结局第 1 句', D.NOODLES.outcome[0]);
  f('noodles.outcome2', '结局第 2 句', D.NOODLES.outcome[1]);
  f('noodles.outcome3', '结局第 3 句', D.NOODLES.outcome[2]);
  D.NOODLES.items.forEach((it, i) => f(`noodles.item.${i + 1}`, `要藏的第 ${i + 1} 样东西`, it.label));

  head('会合（高中看完之后才出现）', '高中最后一幕之后；或在盒子里点中间那格');
  f('meet.eyebrow', '页眉小字', D.MEET.eyebrow);
  f('meet.title', '大标题', D.MEET.title);
  f('meet.body', '正文', D.MEET.body);
  f('meet.action', '进入第二章的按钮', D.MEET.action);

  head('第二章 · 大学（六页，这一段是假如）', '盒子里第二排的六格');
  D.SCENES.filter((s) => s.chapter === 'uni').forEach((s, i) => {
    sceneBlock(s, `第 ${i + 1} 页`, `盒子第二排第 ${i + 1} 格「${D.UNI_ITEMS[i].label}」`);
  });

  head('穿裙子那一页的微信聊天框', '第二章第 5 页，画面上飘着的那几句');
  [1, 2, 3, 4].forEach((i) => f(`u5.chat.${i}`, `聊天框第 ${i} 句`, D.CHAT_U5[i - 1]));

  head('霸王花 · 那件真事', '第二章最后一页之后紧接着');
  D.SCENES.filter((s) => s.chapter === 'real').forEach((s) => sceneBlock(s, '霸王花', '第二章最后一页之后'));

  head('小动画 · 四段', '盒子里「小动画」那一格');
  f('anim.eyebrow', '页眉小字', D.ANIM_PAGE.eyebrow);
  f('anim.title', '大标题', D.ANIM_PAGE.title);
  f('anim.lead', '副标题', D.ANIM_PAGE.lead);
  D.ANIM_PAGE.items.forEach((v, i) => {
    f(`anim.${i + 1}.title`, `第 ${i + 1} 段 · 标题`, v.title);
    f(`anim.${i + 1}.cap`, `第 ${i + 1} 段 · 下面的说明`, v.cap);
    if (v.msg) f(`anim.${i + 1}.msg`, `第 ${i + 1} 段 · 飘来飘去的那句话`, v.msg);
  });
  f('anim.bridge', '四段之后「我们为什么会像」', D.ANIM_PAGE.bridge);
  f('anim.quote', '整页最末那段引文', D.ANIM_PAGE.quote);
  f('anim.quoteSign', '引文后面的小字', D.ANIM_PAGE.quoteSign);

  head('终章', '两只挂件吸合之后那一屏');
  f('finale.letter', '那封信（最该换成你自己的话）', D.FINALE.letter);
  f('finale.sign', '落款', D.FINALE.sign);
  f('finale.slotTitle', '「留给她的那一格」标题', D.FINALE.slotTitle);
  f('finale.slotNote', '「留给她的那一格」说明', D.FINALE.slotNote);
  f('finale.foot', '最底下的日期', D.FINALE.foot);

  return out;
}

/* ── 导出成文本 ─────────────────────────────────────────── */

const BAR = '─'.repeat(38);
const HEAVY = '═'.repeat(38);

function toText(fields) {
  const lines = [];
  const bar = '═'.repeat(46);
  for (const e of fields) {
    if (e.gap !== undefined) { lines.push(e.gap); continue; }
    if (e.head) {
      lines.push('', bar, '  ' + e.head);
      if (e.where) lines.push('  位置：' + e.where);
      lines.push(bar, '');
      continue;
    }
    if (e.note) lines.push('# ' + e.note);
    lines.push('### ' + e.key, String(e.value), '');
  }
  return lines.join('\n').replace(/\n{4,}/g, '\n\n\n') + '\n';
}

/* ── 从文本读回来 ───────────────────────────────────────── */

function parse(text) {
  const map = new Map();
  let key = null;
  let buf = [];
  const flush = () => {
    if (key) map.set(key, buf.join('\n').replace(/^\n+|\n+$/g, ''));
    key = null;
    buf = [];
  };
  for (const line of text.split(/\r?\n/)) {
    const m = /^###\s+(\S+)\s*$/.exec(line);
    if (m) { flush(); key = m[1]; continue; }
    if (/^[═─]+/.test(line)) { flush(); continue; }
    if (/^#\s/.test(line)) { flush(); continue; }
    if (key) buf.push(line);
  }
  flush();
  return map;
}

/* ── 兜底：文件里的 ### 标记被删掉时 ─────────────────────
   作者编辑的时候可能把 `#` / `###` 当杂音删掉。键名还在、顺序没变，
   所以可以按顺序对：值 = 键名之后，到下一条注释（注释行要去掉）或分隔线之前。 */

function parseUnmarked(text, expected, notes) {
  const norm = (t) => t.replace(/\s+/g, '').replace(/・/g, '·').replace(/·/g, '·');
  const noteSet = new Set(notes.map(norm));
  const map = new Map();
  let i = 0;
  let cur = null;
  let buf = [];
  const close = () => {
    if (cur === null) return;
    while (buf.length && noteSet.has(norm(buf[buf.length - 1]))) buf.pop();
    while (buf.length && !buf[buf.length - 1].trim()) buf.pop();
    map.set(cur, buf.join('\n'));
    cur = null;
    buf = [];
  };
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith('═')) { close(); continue; }
    if (i < expected.length && t === expected[i]) { close(); cur = expected[i]; i += 1; buf = []; continue; }
    if (cur !== null) buf.push(line);
  }
  close();
  return map;
}

/* ── 主流程 ─────────────────────────────────────────────── */

const mode = process.argv[2] || '--build';
const fields = await collect();
const expected = fields.filter((e) => e.key).map((e) => e.key);

if (mode === '--export') {
  // 危险动作：导出会用代码里的值重写 文案.txt。如果 文案.txt 里有还没构建过的改动，
  // 那说明有人正在改文案——这时候覆盖就等于把他的改动删掉。
  // 所以先比对，发现未构建的改动就备份 + 拒绝，除非显式给 --force。
  const before = (() => { try { return parse(readFileSync(TXT, 'utf8')); } catch { return new Map(); } })();
  const unbuilt = fields.filter((e) => e.key && before.has(e.key) && before.get(e.key) !== String(e.value));

  if (unbuilt.length && !process.argv.includes('--force')) {
    const backup = TXT.replace(/\.txt$/, '') + '_未构建的备份.txt';
    writeFileSync(backup, readFileSync(TXT, 'utf8'), 'utf8');
    console.error(`文案.txt 里有 ${unbuilt.length} 条改动还没有构建进网站：`);
    for (const e of unbuilt.slice(0, 8)) {
      console.error(`  ${e.key}
    文件里：${JSON.stringify(before.get(e.key)).slice(0, 60)}
    代码里：${JSON.stringify(String(e.value)).slice(0, 60)}`);
    }
    console.error(`
拒绝导出（导出去会用代码里的旧值覆盖这些改动）。`);
    console.error(`你的改动已备份到：${backup}`);
    console.error(`先跑  node tools/copy.mjs --build  把这些改动构建进去；`);
    console.error(`确实想丢弃它们，再跑  node tools/copy.mjs --export --force`);
    process.exit(1);
  }

  writeFileSync(TXT, toText(fields), 'utf8');
  console.log(`导出 ${expected.length} 条文案 -> 文案.txt`);
} else {
  let text;
  try { text = readFileSync(TXT, 'utf8'); }
  catch { console.error('找不到 文案.txt，先跑：node tools/copy.mjs --export'); process.exit(1); }

  let map = parse(text);
  if (map.size < expected.length) {
    // 没找到（或只找到一部分）标记 —— 多半是编辑时把 ### 删了。按顺序兜底对一遍。
    const notes = fields.filter((e) => e.key && e.note).map((e) => e.note);
    const fallback = parseUnmarked(text, expected, notes);
    if (fallback.size > map.size) {
      console.log(`（文案.txt 里没有 ### 标记，已按顺序识别出 ${fallback.size} 条 —— 建议下次保留 ### 那一行）`);
      map = fallback;
    }
  }
  const missing = expected.filter((k) => !map.has(k));
  const extra = [...map.keys()].filter((k) => !expected.includes(k));
  if (missing.length) {
    console.error(`文案.txt 缺了 ${missing.length} 条：\n  ${missing.join('\n  ')}`);
    console.error('（是不是把「### 键名」那一行删掉或改动了？从 --export 的备份里补回来，或者告诉我。）');
    process.exit(1);
  }
  if (extra.length) console.warn(`注意：文案.txt 里有 ${extra.length} 条多余的键，会被忽略：\n  ${extra.join('\n  ')}`);

  const obj = {};
  for (const k of expected) obj[k] = map.get(k);
  writeFileSync(OUT,
    '// 由 tools/copy.mjs 从 文案.txt 生成，不要手改这个文件。\n' +
    '// 要改文字请改 文案.txt，然后跑：node tools/copy.mjs --build\n' +
    'export default ' + JSON.stringify(obj, null, 2) + ';\n', 'utf8');

  console.log(mode === '--check' ? `检查通过：${expected.length} 条文案都在` : `生成 src/content.js：${expected.length} 条文案`);
}
