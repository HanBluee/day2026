// 够用就好的建元素辅助，省掉一堆 createElement。

// SVG 必须用 createElementNS 建，用 createElement 建出来的不会渲染
// （它落在 HTML 命名空间里，浏览器当普通未知元素，什么都不画）。
const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
  'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'use',
  'text', 'tspan', 'filter', 'feGaussianBlur', 'animateMotion', 'mpath',
]);

export function h(tag, attrs = {}, ...kids) {
  const node = SVG_TAGS.has(tag)
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (val == null || val === false) continue;
    // SVG 元素的 className 是只读的 SVGAnimatedString，直接赋值会在严格模式下抛错
    if (key === 'class') {
      if (node.namespaceURI === SVG_NS) node.setAttribute('class', val);
      else node.className = val;
    }
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
