// 记一下她走到哪儿了。
//
// 只用来做一件事：高中那一章看完了没有。没看完的时候，盒子里中间那格
// 是空的（挂件还没会合），大学篇也进不去。看完之后挂件才出现。
//
// 存在 localStorage 里，所以她关掉再打开还记得。读不到就算了（比如隐私模式），
// 顶多退回"没看完"的状态，不会出错。

const KEY = 'day2026.hs-done';

export function chapter1Done() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markChapter1Done() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* 存不了就算了，不影响看 */
  }
}
