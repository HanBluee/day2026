// 场景路由。没有框架，四个场景互相跳，切换时旧的淡出、新的淡入。

import { SCENES } from './data.js';
import { buildBox, buildInside, buildStory, buildAnim, buildFinale } from './scenes.js';
import { buildNoodles } from './noodles.js';
import { buildComic } from './comic.js';

const view = document.getElementById('view');
let current = null;

function show(node) {
  if (current) {
    const old = current;
    old.classList.add('is-leaving');
    setTimeout(() => old.remove(), 540);
  }
  view.append(node);
  current = node;
  requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-live')));
}

function toBox() {
  show(buildBox({ onOpen: toInside }));
}

function toInside() {
  show(buildInside({ onPick, onCharm: toFinale }));
}

function onPick(id) {
  if (id === 'anim') return toAnim();
  const idx = SCENES.findIndex((s) => s.id === id);
  return toStory(idx < 0 ? 0 : idx);
}

function toStory(index) {
  const idx = Math.max(0, Math.min(SCENES.length - 1, index));
  show(buildStory(SCENES[idx], {
    index: idx,
    onPrev: () => toStory(idx - 1),
    onNext: () => (idx === SCENES.length - 1 ? toAnim() : toStory(idx + 1)),
    onExit: toInside,
    onPlay: () => toComic(idx),
  }));
}

function toAnim() {
  show(buildAnim({ onNext: toFinale, onExit: toInside }));
}

// 先看一遍分镜，再自己上手玩
function toComic(returnIndex) {
  show(buildComic({
    onPlay: () => toGame(returnIndex),
    onExit: () => toStory(returnIndex),
  }));
}

function toGame(returnIndex) {
  show(buildNoodles({ onDone: () => toStory(returnIndex) }));
}

function toFinale() {
  show(buildFinale({ onExit: toInside }));
}

// 直接跳转：index.html#s4 / #u1 / #inside / #game / #anim / #finale
// 调试和分享都用得上，正常点着走不会改地址栏。
function route() {
  const id = location.hash.replace(/^#/, '');
  if (id === 'inside') return toInside();
  if (id === 'finale') return toFinale();
  if (id === 'anim') return toAnim();
  if (id === 'game') return toGame(2);
  if (id === 'comic') return toComic(2);
  const i = SCENES.findIndex((s) => s.id === id);
  return i >= 0 ? toStory(i) : toBox();
}

window.addEventListener('hashchange', route);
route();
