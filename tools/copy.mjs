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

  gap('这份文件就是网站里所有的字。');
  gap('改法：只改「### 键名」底下的内容，### 那一行不要动。空行会被保留（正文里空一行就是分段）。');
  gap('正文里可以用 <em>…</em> 做高亮、<b>…</b> 加粗。');
  gap('改完在本目录下跑：  node tools/copy.mjs --build');

  head('名字', '到处都会用到，主要是终章落款和性格卡');
  f('me.name', '我的名字', D.ME.name);
  f('me.nick', '我的外号', D.ME.nick);
  f('her.name', '她的名字', D.HER.name);
  f('her.nick', '我给她起的备注', D.HER.nick);

  head('盒内目录的格子', '打开盒子以后，绒布上的那几格');
  D.BOX_ITEMS.forEach((it, i) => {
    f(`box.${i + 1}.label`, `第 ${i + 1} 格 · 大标题（${it.id}）`, it.label);
    f(`box.${i + 1}.meta`, `第 ${i + 1} 格 · 下面的小字`, it.meta);
  });
  f('uni.label', '「大学篇」那一格的标题', D.UNI_ENTRY.label);
  f('uni.note', '「大学篇」那一格的小字', D.UNI_ENTRY.note);
  f('extra.label', '「小动画」那一格的标题', D.EXTRAS[0].label);
  f('extra.note', '「小动画」那一格的小字', D.EXTRAS[0].note);

  const sceneBlock = (s, roman, where) => {
    gap('');
    head(roman, where);
    f(`${s.id}.eyebrow`, '灰字小标（在最上面）', s.eyebrow);
    f(`${s.id}.title`, '大标题', s.title);
    f(`${s.id}.body`, '正文（空行分段）', s.body);
    s.bubbles.forEach((b, i) => {
      f(`${s.id}.bubble.${i + 1}`, `对白 ${i + 1} · ${b.who === 'ya' ? '我说的' : '她说的'}`, b.text);
    });
    if (s.playLabel) f(`${s.id}.playLabel`, '进入小游戏的按钮', s.playLabel);
    if (s.cities) {
      f(`${s.id}.city.jing`, '左边飘出来的地名（她那边）', s.cities.jing);
      f(`${s.id}.city.ya`, '右边飘出来的地名（我这边）', s.cities.ya);
    }
  };

  head('第一章 · 高中（这些是真事）', '盒内目录点第 1～8 格；或者从盒子一路点「下一段」');
  D.SCENES.filter((s) => !s.chapter).forEach((s, i) => {
    const box = D.BOX_ITEMS[i];
    sceneBlock(s, `第 ${i + 1} 幕`, `对应盒内第 ${i + 1} 格「${box.label}」`);
  });

  head('第二章 · 大学（这一段是编的）', '盒内目录点蓝色那一格「大学篇」');
  D.SCENES.filter((s) => s.chapter === 'uni').forEach((s, i) => {
    sceneBlock(s, `大学第 ${i + 1} 页`, `第一章最后一幕之后，或从盒内「大学篇」进入`);
  });

  head('回到真实（真事）', '大学篇六页之后紧接着');
  D.SCENES.filter((s) => s.chapter === 'real').forEach((s) => {
    sceneBlock(s, '食人花书', '大学篇最后一页之后紧接着');
  });

  head('小游戏 · 泡面危机', '第一章第 3 幕里点「帮我藏一下」按钮进入');
  f('noodles.intro', '开场提示', D.NOODLES.intro);
  D.NOODLES.spots.forEach((s, i) => f(`noodles.spot.${i + 1}`, `第 ${i + 1} 个藏匿点的名字`, s.name));
  D.NOODLES.items.forEach((it, i) => f(`noodles.item.${i + 1}`, `要藏的第 ${i + 1} 件东西`, it.label));
  D.NOODLES.opens.forEach((o, i) => f(`noodles.open.${i + 1}`, `阿姨的第 ${i + 1} 个动作`, o.line));
  f('noodles.luck', '阿姨拉开空柜子时的话', D.NOODLES.luck);
  f('noodles.near', '阿姨照了手电时的话', D.NOODLES.near);
  D.NOODLES.outcome.forEach((t, i) => f(`noodles.outcome.${i + 1}`, `结局第 ${i + 1} 句`, t));

  head('终章', '两只挂件吸合之后的那一屏');
  f('finale.letter', '那封信（最该换成你自己的话）', D.FINALE.letter);
  f('finale.sign', '落款', D.FINALE.sign);
  f('finale.slotTitle', '「留给她的那一格」标题', D.FINALE.slotTitle);
  f('finale.slotNote', '「留给她的那一格」说明', D.FINALE.slotNote);
  f('finale.foot', '最底下的日期', D.FINALE.foot);

  head('小剧场 · 泡面危机（分镜）', '第一章第 3 幕点「帮我藏一下」之后先放这个');
  f('comic.from', '左上角的小标', D.COMIC.from);
  f('comic.hint', '底部的操作提示', D.COMIC.hint);
  f('comic.endPlay', '结束页 · 第一个按钮', D.COMIC.endPlay);
  f('comic.endReplay', '结束页 · 第二个按钮', D.COMIC.endReplay);
  f('comic.endBack', '结束页 · 第三个按钮', D.COMIC.endBack);
  D.COMIC.beats.forEach((b, i) => {
    f(`comic.${b.key}.sub`, `第 ${i + 1} 格 · 底部的字幕`, b.sub);
    if (b.bubble) f(`comic.${b.key}.bubble`, `第 ${i + 1} 格 · 对白气泡（${b.bubble === 'ya' ? '我说的' : b.bubble === 'jing' ? '她说的' : '画外音'}）`, b.bubbleText);
  });

  head('小动画', '盒内目录点「小动画」；或第一章之后一路「下一段」');
  f('anim.eyebrow', '页眉小字', D.ANIM_PAGE.eyebrow);
  f('anim.title', '大标题', D.ANIM_PAGE.title);
  f('anim.lead', '副标题', D.ANIM_PAGE.lead);
  D.ANIM_PAGE.items.forEach((v, i) => {
    f(`anim.${i + 1}.title`, `第 ${i + 1} 段动画的标题（${v.kind}）`, v.title);
    f(`anim.${i + 1}.cap`, `第 ${i + 1} 段动画下面的说明`, v.cap);
    if (v.msg) f(`anim.${i + 1}.msg`, `第 ${i + 1} 段里飞来飞去的那句话`, v.msg);
  });
  f('anim.bridge', '四段动画之后那段「我们为什么会像」', D.ANIM_PAGE.bridge);
  f('anim.quote', '整页最末那段引文', D.ANIM_PAGE.quote);
  f('anim.quoteSign', '引文后面的小字', D.ANIM_PAGE.quoteSign);

  return out;
}

/* ── 导出成文本 ─────────────────────────────────────────── */

const BAR = '─'.repeat(38);
const HEAVY = '═'.repeat(38);

function toText(fields) {
  const lines = [];
  for (const e of fields) {
    if (e.gap !== undefined) { lines.push(e.gap, ''); continue; }
    if (e.head) {
      lines.push('', HEAVY, e.head, `出现在：${e.where}`, HEAVY, '');
      continue;
    }
    if (e.note) lines.push(`# ${e.note}`);
    lines.push(`### ${e.key}`, String(e.value), '');
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

/* ── 主流程 ─────────────────────────────────────────────── */

const mode = process.argv[2] || '--build';
const fields = await collect();
const expected = fields.filter((e) => e.key).map((e) => e.key);

if (mode === '--export') {
  const before = (() => { try { return parse(readFileSync(TXT, 'utf8')); } catch { return new Map(); } })();
  // 导出不改内容，只重排；顺手确认一下没有值发生变化
  const stale = fields.filter((e) => e.key && before.has(e.key) && before.get(e.key) !== String(e.value));
  writeFileSync(TXT, toText(fields), 'utf8');
  console.log(`导出 ${expected.length} 条文案 -> 文案.txt`);
  if (stale.length) console.log(`注意：有 ${stale.length} 条的值与上一版不同，已用当前代码里的值覆盖`);
} else {
  let text;
  try { text = readFileSync(TXT, 'utf8'); }
  catch { console.error('找不到 文案.txt，先跑：node tools/copy.mjs --export'); process.exit(1); }

  const map = parse(text);
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
