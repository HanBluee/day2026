// 够用就好的建元素辅助，省掉一堆 createElement。

export function h(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val == null || val === false) continue;
    if (key === 'class') node.className = val;
    else if (key === 'html') node.innerHTML = val;
    else if (key === 'text') node.textContent = val;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), val);
    else node.setAttribute(key, val === true ? '' : val);
  }
  append(node, kids);
  return node;
}

export function append(parent, kids) {
  for (const kid of kids.flat(4)) {
    if (kid == null || kid === false) continue;
    parent.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return parent;
}

export function clear(parent) {
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  return parent;
}
