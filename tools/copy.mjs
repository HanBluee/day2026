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

/* ── 字段表：键 -> 从哪里取值 / 显示在哪个小节 ───────────── */

async function collect() {
  const D = await import(new URL('../src/data.js', import.meta.url));

  const out = [];
  const sec = (name) => out.push({ section: name });
  const f = (key, note, value) => out.push({ key, note, value });

  sec('两个人的名字');
  f('me.name', '我的名字', D.ME.name);
  f('me.nick', '我的外号', D.ME.nick);
  f('her.name', '她的名字', D.HER.name);
  f('her.nick', '我给她起的备注', D.HER.nick);

  sec('盒子里的格子');
  D.BOX_ITEMS.forEach((it, i) => {
    f(`box.${i + 1}.label`, `${it.id} 标题`, it.label);
    f(`box.${i + 1}.meta`, `${it.id} 小字`, it.meta);
  });
  f('uni.label', '大学篇 入口标题', D.UNI_ENTRY.label);
  f('uni.note', '大学篇 入口说明', D.UNI_ENTRY.note);
  f('extra.label', '性格卡 入口标题', D.EXTRAS[0].label);
  f('extra.note', '性格卡 入口说明', D.EXTRAS[0].note);

  sec('第一章 · 高中（真实发生）');
  D.SCENES.filter((s) => s.chapter === undefined).forEach((s) => {
    f(`${s.id}.eyebrow`, '小标题（灰色等宽字）', s.eyebrow);
    f(`${s.id}.title`, '大标题', s.title);
    f(`${s.id}.body`, '正文（空行分段，可用 <em>…</em> 做高亮）', s.body);
    s.bubbles.forEach((b, i) => {
      f(`${s.id}.bubble.${i + 1}`, `对白 ${i + 1}（${b.who === 'ya' ? '我说的' : '她说的'}）`, b.text);
    });
    if (s.playLabel) f(`${s.id}.playLabel`, '进入小游戏的按钮', s.playLabel);
  });

  sec('第二章 · 大学（这一段是编的）');
  D.SCENES.filter((s) => s.chapter === 'uni').forEach((s) => {
    f(`${s.id}.eyebrow`, '小标题', s.eyebrow);
    f(`${s.id}.title`, '大标题', s.title);
    f(`${s.id}.body`, '正文', s.body);
    s.bubbles.forEach((b, i) => {
      f(`${s.id}.bubble.${i + 1}`, `对白 ${i + 1}（${b.who === 'ya' ? '我说的' : '她说的'}）`, b.text);
    });
  });

  sec('回到真实 · 食人花书');
  D.SCENES.filter((s) => s.chapter === 'real').forEach((s) => {
    f(`${s.id}.eyebrow`, '小标题', s.eyebrow);
    f(`${s.id}.title`, '大标题', s.title);
    f(`${s.id}.body`, '正文', s.body);
    s.bubbles.forEach((b, i) => {
      f(`${s.id}.bubble.${i + 1}`, `对白 ${i + 1}`, b.text);
    });
  });

  sec('小游戏 · 泡面危机');
  f('noodles.intro', '开场提示', D.NOODLES.intro);
  D.NOODLES.spots.forEach((s, i) => f(`noodles.spot.${i + 1}`, `藏匿点 ${i + 1}`, s.name));
  D.NOODLES.items.forEach((it, i) => f(`noodles.item.${i + 1}`, `要藏的第 ${i + 1} 件东西`, it.label));
  D.NOODLES.opens.forEach((o, i) => f(`noodles.open.${i + 1}`, `阿姨动作 ${i + 1}`, o.line));
  f('noodles.luck', '阿姨开了空柜子时的话', D.NOODLES.luck);
  f('noodles.near', '阿姨照了手电时的话', D.NOODLES.near);
  D.NOODLES.outcome.forEach((t, i) => f(`noodles.outcome.${i + 1}`, `结局第 ${i + 1} 句`, t));

  sec('终章');
  f('finale.letter', '那封信', D.FINALE.letter);
  f('finale.sign', '署名', D.FINALE.sign);
  f('finale.slotTitle', '留给她的那一格 标题', D.FINALE.slotTitle);
  f('finale.slotNote', '留给她的那一格 说明', D.FINALE.slotNote);
  f('finale.foot', '底部的日期', D.FINALE.foot);

  sec('性格卡');
  f('profile.eyebrow', '页眉小字', D.PROFILE.eyebrow);
  f('profile.title', '大标题', D.PROFILE.title);
  f('profile.lead', '副标题', D.PROFILE.lead);
  f('profile.pair.caption', '两张脸下面那句', D.PROFILE.blocks[0].caption);
  ['jing', 'ya'].forEach((who, bi) => {
    const b = D.PROFILE.blocks[bi + 1];
    f(`profile.${who}.tag`, `${b.name} 后面那串小字`, b.tag);
    b.points.forEach((p, i) => {
      f(`profile.${who}.p${i + 1}.t`, `${b.name} 第 ${i + 1} 条 小标题`, p.t);
      f(`profile.${who}.p${i + 1}.d`, `${b.name} 第 ${i + 1} 条 正文`, p.d);
    });
  });
  const br = D.PROFILE.blocks[3];
  f('profile.bridge.title', '「我们为什么会像」标题', br.title);
  f('profile.bridge.lead', '「我们为什么会像」副标题', br.lead);
  f('profile.bridge.leftLabel', '左边那栏的标签', br.left.label);
  f('profile.bridge.leftText', '左边那栏的正文', br.left.text);
  f('profile.bridge.rightLabel', '右边那栏的标签', br.right.label);
  f('profile.bridge.rightText', '右边那栏的正文', br.right.text);
  f('profile.bridge.tail', '「我们为什么会像」收尾', br.tail);
  const q = D.PROFILE.blocks[4];
  f('profile.quote.text', '最末那段引文', q.text);
  f('profile.quote.sign', '引文后面的小字', q.sign);

  return out.filter((e) => e.section || e.key);
}

/* ── 导出成文本 ─────────────────────────────────────────── */

function toText(fields) {
  const lines = [
    '第 2026 天 · 全部文案',
    '',
    '改法：直接改下面「### 键名」底下的内容，键名那一行不要动。',
    '空行会保留（正文里空一行就是分段）。',
    '正文里可以用 <em>…</em> 把几个字做成粉色高亮，<b>…</b> 加粗。',
    '改完在这个目录下跑：  node tools/copy.mjs --build',
    '',
  ];
  for (const e of fields) {
    if (e.section) {
      lines.push('', '══════════════════════════════════════', e.section,
        '══════════════════════════════════════', '');
    } else {
      if (e.note) lines.push(`# ${e.note}`);
      lines.push(`### ${e.key}`, String(e.value), '');
    }
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
    if (/^═+/.test(line)) { flush(); continue; }
    if (/^#{1,2}\s/.test(line) && !m) { continue; }
    if (key) buf.push(line);
    else if (/^[^#\s]/.test(line) && line.trim()) { /* 说明区，忽略 */ }
  }
  flush();
  return map;
}

/* ── 主流程 ─────────────────────────────────────────────── */

const mode = process.argv[2] || '--build';
const fields = await collect();
const expected = fields.filter((e) => e.key).map((e) => e.key);

if (mode === '--export') {
  const text = toText(fields);
  if (!process.env.DRY) writeFileSync(TXT, text, 'utf8');
  console.log(`导出 ${expected.length} 条文案 -> 文案.txt`);
} else {
  let text;
  try { text = readFileSync(TXT, 'utf8'); }
  catch { console.error('找不到 文案.txt，先跑：node tools/copy.mjs --export'); process.exit(1); }

  const map = parse(text);
  const missing = expected.filter((k) => !map.has(k));
  const extra = [...map.keys()].filter((k) => !expected.includes(k));
  if (missing.length) {
    console.error(`文案.txt 缺了 ${missing.length} 条：\n  ${missing.join('\n  ')}`);
    console.error('（键名那一行被删掉或改动了？从 --export 的备份里补回来，或让我处理。）');
    process.exit(1);
  }
  if (extra.length) console.warn(`注意：文案.txt 里有 ${extra.length} 条多余的键，会被忽略：\n  ${extra.join('\n  ')}`);

  const obj = {};
  for (const k of expected) obj[k] = map.get(k);
  writeFileSync(OUT,
    '// 由 tools/copy.mjs 从 文案.txt 生成，不要手改这个文件。\n' +
    '// 要改文字请改 文案.txt，然后跑：node tools/copy.mjs --build\n' +
    'export default ' + JSON.stringify(obj, null, 2) + ';\n', 'utf8');

  if (mode === '--check') console.log(`检查通过：${expected.length} 条文案都在`);
  else console.log(`生成 src/content.js：${expected.length} 条文案`);
}
