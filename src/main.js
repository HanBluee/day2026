// 场景路由。没有框架，四个场景互相跳，切换时旧的淡出、新的淡入。

import { SCENES } from './data.js';
import { buildBox, buildInside, buildStory, buildMeet, buildAnim, buildFinale } from './scenes.js';
import { markChapter1Done } from './progress.js';
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
  show(buildInside({ onPick, onCharm: toMeet }));
}

function onPick(id) {
  if (id === 'anim') return toAnim();
  if (id === 'meet') return toMeet();
  const idx = SCENES.findIndex((s) => s.id === id);
  return toStory(idx < 0 ? 0 : idx);
}

function toStory(index) {
  const idx = Math.max(0, Math.min(SCENES.length - 1, index));
  show(buildStory(SCENES[idx], {
    index: idx,
    onPrev: () => toStory(idx - 1),
    // 高中最后一幕的「下一段」不是直接进大学，而是先看两只挂件会合
    onNext: () => {
      if (idx === SCENES.length - 1) return toAnim();
      return SCENES[idx].id === 's8' ? toMeet() : toStory(idx + 1);
    },
    onExit: toInside,
    onPlay: () => toComic(idx),
  }));
}

// 挂件会合这一幕，同时是大学篇的钥匙：走到这里才把大学解锁
function toMeet() {
  markChapter1Done();
  const u1 = Math.max(0, SCENES.findIndex((s) => s.id === 'u1'));
  show(buildMeet({ onNext: () => toStory(u1), onExit: toInside }));
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
  if (id === 'meet') return toMeet();
  if (id === 'game') return toGame(2);
  if (id === 'comic') return toComic(2);
  const i = SCENES.findIndex((s) => s.id === id);
  return i >= 0 ? toStory(i) : toBox();
}

window.addEventListener('hashchange', route);
route();
