"""把豆包生成的立绘切成单张、去白底、裁到内容边界。

支持两种排版的输入：
- 三视图（正面 / 侧面 / 背面），横排三个人物；
- 两个人物的合影（比如高中校服那张，左右各一个）。

用法: python tools/cutout.py <sheet.png> <outdir> <prefix> <图里有几个人> [名字1,名字2,...] [--flat]
  --flat 用于「纯白背景上的单件物品」（毛绒挂件那种）：改用紧阈值 + 补洞 +
  只留最大一块。默认的「从边缘灌浅色」会把毛绒的白毛一起吃掉。
  「图里有几个人」用来在阴影把人物连成一片时正确地等分。
  名字给几个就只产出前几个（背面图带水印又用不到，直接不产出）。
  例: 三视图只要正面   -> cutout.py ya-uni.jpg assets/char ya 3 front
      两人合影         -> cutout.py hs-pair.jpg assets/char hs 2 jing,ya
  输出文件名: <prefix>-<名字>.png

换高清素材或对方重新生成立绘后，改好路径重跑即可，其它代码不用动。
"""
import os
import sys
from collections import deque

from PIL import Image, ImageFilter

BG_THRESHOLD = 226    # 亮度下限，低于此值不算背景（放宽以吃掉脚下的投影）
BG_SATURATION = 22    # 通道极差上限，超过则算有色内容
# 脚下的投影比底色暗，但没到"实体"那么暗。再用一档更松的阈值从边缘灌一次，
# 把投影圈也吃掉；人物轮廓线比这暗，所以灌不进衣服里面。
SHADOW_THRESHOLD = 202
SHADOW_SATURATION = 24
FEATHER = 0.7         # alpha 羽化半径
WATERMARK_BAND = 0.94             # 只在画面最底部这一比例内找水印
WATERMARK_BRIGHTNESS = (148, 218)  # 水印是浅灰字：比底色暗、比鞋亮
WATERMARK_SATURATION = 22
FIGURE_MIN_HEIGHT = 0.5           # 竖向占不到全图一半的连通块不是人物（是水印字块）

# 「纯白背景上的单件物品」模式（tools/cutout.py ... --flat）用这一组
FLAT_THRESHOLD = 250    # 背景是 253~255，白毛中位只有 229，用紧阈值就不会灌进毛里
FLAT_SATURATION = 8
FLAT_FEATHER = 1.0
# 轮廓外那圈光晕：亮度 248~255（珠链中位只有 166，差得很开）。
# 只清「贴着轮廓外沿、又很亮」的像素 —— 毛内部的亮块不在边上，珠链整体够暗。
FLAT_BG_MARGIN = 30      # 背景暗端往下留这么多，算作阈值
FLAT_HALO_BRIGHT = 246   # 亮到这个值以上、又贴着轮廓 = 挂件自带的柔投影/背景
FLAT_HALO_SAT = 16
FLAT_BAND = 8            # 「贴着轮廓」的判定半径：要盖住那层柔投影
FLAT_CLOSE = 16          # 闭运算半径：用来封住背景钻进来的细缝

DEFAULT_NAMES = ["front", "side", "back"]


def background_mask(im, threshold=BG_THRESHOLD, saturation=BG_SATURATION):
    """从四条边向内洪水填充，把与边缘连通的浅色区域判为背景。"""
    w, h = im.size
    px = im.load()
    mask = bytearray(w * h)
    queue = deque()

    def is_bg(pixel):
        return min(pixel) >= threshold and (max(pixel) - min(pixel)) <= saturation

    def seed(x, y):
        if not mask[y * w + x] and is_bg(px[x, y]):
            mask[y * w + x] = 1
            queue.append((x, y))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not mask[ny * w + nx] and is_bg(px[nx, ny]):
                mask[ny * w + nx] = 1
                queue.append((nx, ny))
    return mask


def to_transparent(im, band=WATERMARK_BAND):
    w, h = im.size
    mask = background_mask(im)
    shadow = background_mask(im, SHADOW_THRESHOLD, SHADOW_SATURATION)
    for i in range(w * h):
        if shadow[i]:
            mask[i] = 1
    alpha = Image.new("L", (w, h), 255)
    ap = alpha.load()
    px = im.load()
    band_top = int(h * band)
    lo, hi = WATERMARK_BRIGHTNESS
    for i in range(w * h):
        x, y = i % w, i // w
        if mask[i]:
            ap[x, y] = 0
        elif y >= band_top:
            bright = max(px[x, y])
            sat = bright - min(px[x, y])
            if lo <= bright <= hi and sat <= WATERMARK_SATURATION:
                ap[x, y] = 0
    alpha = alpha.filter(ImageFilter.GaussianBlur(FEATHER))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def column_clusters(im, expect, gap_tolerance=3, min_width=12):
    """按前景像素的列分布找每个人物的水平范围。"""
    w, h = im.size
    mask = background_mask(im)
    occupied = []
    for x in range(w):
        occupied.append(any(not mask[y * w + x] for y in range(h)))

    spans = []
    start = None
    gap = 0
    for x, filled in enumerate(occupied):
        if filled:
            if start is None:
                start = x
            gap = 0
        elif start is not None:
            gap += 1
            if gap > gap_tolerance:
                spans.append((start, x - gap))
                start = None
                gap = 0
    if start is not None:
        spans.append((start, w - 1))
    spans = [(a, b) for a, b in spans if b - a >= min_width]

    # 右下角的"豆包AI生成"字块是独立的窄条，纵向很矮，按高度剔掉
    fg = Image.frombytes("L", (w, h), bytes(mask)).point([255] + [0] * 255)
    min_height = h * FIGURE_MIN_HEIGHT
    tall = []
    for span in spans:
        box = fg.crop((span[0], 0, span[1] + 1, h)).getbbox()
        if box and box[3] - box[1] >= min_height:
            tall.append(span)
    spans = tall

    # 人物之间常被地面阴影连成一片，退回按总宽度等分
    if len(spans) != expect and spans:
        a, b = min(s[0] for s in spans), max(s[1] for s in spans)
        step = (b - a + 1) / float(expect)
        spans = [(int(a + i * step), int(a + (i + 1) * step) - 1) for i in range(expect)]
    return spans


def trim(im):
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def drop_shadow(im):
    """立绘脚下有一圈浅灰投影，右下角还有水印。
    深色内容（鞋、裤脚）之下基本都是投影，按比例往里裁掉一点。"""
    w, h = im.size
    px = im.load()
    inset = max(2, round(h * 0.011))
    bottom = h - 1
    for y in range(h - 1, -1, -1):
        if any(px[x, y][3] > 200 and max(px[x, y][:3]) < 170 for x in range(w)):
            bottom = y
            break
    return im.crop((0, 0, w, max(1, bottom - inset)))


def _reachable(passable, w, h):
    """从画面四边出发，在 passable(1/0) 上做四连通，返回能走到的格子。"""
    seen = bytearray(w * h)
    queue = deque()

    def push(x, y):
        if passable[y * w + x] and not seen[y * w + x]:
            seen[y * w + x] = 1
            queue.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and passable[ny * w + nx] and not seen[ny * w + nx]:
                seen[ny * w + nx] = 1
                queue.append((nx, ny))
    return seen


def _largest_blob(fg, w, h):
    """只保留最大的一块连通区域（丢掉水印字、碎点）。"""
    seen = bytearray(w * h)
    best = None
    for start in range(w * h):
        if not fg[start] or seen[start]:
            continue
        blob = []
        queue = deque([(start % w, start // w)])
        seen[start] = 1
        while queue:
            x, y = queue.popleft()
            blob.append(y * w + x)
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    i = ny * w + nx
                    if fg[i] and not seen[i]:
                        seen[i] = 1
                        queue.append((nx, ny))
        if best is None or len(blob) > len(best):
            best = blob
    keep = bytearray(w * h)
    for i in best or []:
        keep[i] = 1
    return keep


def _box_mean(a, k):
    """k x k 盒式均值，用积分图算，O(N)。"""
    import numpy as np
    r = k // 2
    p = np.pad(a, r, mode="edge")
    cs = np.pad(p.cumsum(0).cumsum(1), ((1, 0), (1, 0)), mode="constant")
    h, w = a.shape
    return (cs[k:k + h, k:k + w] - cs[0:h, k:k + w] - cs[k:k + h, 0:w] + cs[0:h, 0:w]) / (k * k)


def _refine_flat(fg, im, w, h):
    """去掉轮廓外那圈光晕。

    毛绒挂件的边缘是软的：抗锯齿的过渡带、以及它自己的那圈浅投影，亮度
    都在 240~250，和白毛差不多，靠亮度分不开。区别在于——毛有纹理，
    光晕是平滑的。所以用局部方差把它们挑出来，再把轮廓收细一点。
    """
    import numpy as np
    a = np.asarray(im, dtype=np.float32)
    bright = a.max(2)
    sat = a.max(2) - a.min(2)

    keep = np.frombuffer(bytes(fg), dtype=np.uint8).reshape(h, w).astype(bool)
    bg = ~keep

    # 「贴近轮廓」的那一圈：背景向外扩 r 像素（方形核，横竖各做一遍即可）
    r = FLAT_BAND
    band = bg.copy()
    for d in range(-r, r + 1):
        band |= np.roll(bg, d, axis=1)
    near = band.copy()
    for d in range(-r, r + 1):
        near |= np.roll(band, d, axis=0)

    # 贴着轮廓、又亮过阈值的，一律判为背景/投影（珠链中位只有 166，不受影响）
    keep &= ~(near & (bright >= FLAT_HALO_BRIGHT) & (sat <= FLAT_HALO_SAT))
    # 收细 1 像素，刮掉抗锯齿的过渡带
    solid = keep.copy()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        solid &= np.roll(np.roll(keep, dy, 0), dx, 1)
    return bytearray((solid.astype(np.uint8) * 255).tobytes())


def _close_and_fill(fg, w, h, r):
    """形态学闭运算 + 补洞。

    毛绒的边缘是软过渡：只要有一段足够亮，洪水就会顺着钻进来，在身体上
    啃掉一角（看起来像"缺了一块"）。闭运算（先膨胀再腐蚀）能把这种细缝
    封住，封住以后那块就成了洞，补洞就能把颜色还回来。
    """
    import numpy as np
    keep = np.frombuffer(bytes(fg), dtype=np.uint8).reshape(h, w).astype(bool)

    d = keep.copy()
    for k in range(-r, r + 1):
        d |= np.roll(keep, k, axis=1)
    t = d.copy()
    for k in range(-r, r + 1):
        t |= np.roll(d, k, axis=0)

    e = t.copy()
    for k in range(-r, r + 1):
        e &= np.roll(t, k, axis=1)
    u = e.copy()
    for k in range(-r, r + 1):
        u &= np.roll(e, k, axis=0)

    bgc = (~u).astype(np.uint8).tobytes()
    outer = _reachable(bytearray(bgc), w, h)
    o = np.frombuffer(bytes(outer), dtype=np.uint8).reshape(h, w).astype(bool)
    u |= (~u & ~o)          # 走不到画外的背景 = 洞 -> 归入前景
    return bytearray(u.astype(np.uint8).tobytes())


def to_transparent_flat(im):
    """纯白背景上的单件物品（比如毛绒挂件）。

    立绘那套「从边缘灌浅色」在这里不能用：毛绒的白毛和背景一样亮，
    洪水会顺着绒毛灌进去，把白的部分整块吃掉。这里改成：
    紧阈值判背景 -> 补洞 -> 只留最大的一块。
    """
    w, h = im.size
    px = im.load()

    # 背景色不一定是纯白（有的是 246 的灰白），所以先从四边量一遍再定阈值
    ring = []
    for x in range(0, w, 7):
        ring += [max(px[x, 5]), max(px[x, h - 6])]
    for y in range(0, h, 7):
        ring += [max(px[5, y]), max(px[w - 6, y])]
    ring.sort()
    # 用背景的暗端（5% 分位）来定阈值，这样背景上的噪点也算背景，
    # 否则噪点会变成一堆前景碎点、再把它们连起来。
    bg_dark = ring[int(len(ring) * 0.05)]
    thresh = max(200, bg_dark - FLAT_BG_MARGIN)
    print(f"   背景暗端 {bg_dark} -> 阈值 {thresh}")

    passable = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if min(c) >= thresh and (max(c) - min(c)) <= FLAT_SATURATION:
                passable[y * w + x] = 1

    bg = _reachable(passable, w, h)
    fg = bytearray(1 - v for v in bg)
    # 补洞：前景的补集里，走不到画面外的那些格子（眼镜片、脸中间的白块）其实是前景
    bgc = bytearray(1 - v for v in fg)
    outer = _reachable(bgc, w, h)
    for i in range(w * h):
        if bgc[i] and not outer[i]:
            fg[i] = 1
    fg = _close_and_fill(fg, w, h, FLAT_CLOSE)
    fg = _largest_blob(fg, w, h)
    soft = _refine_flat(fg, im, w, h)

    alpha = Image.frombytes("L", (w, h), bytes(soft)).filter(ImageFilter.GaussianBlur(FLAT_FEATHER))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def main():
    sheet_path, outdir, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
    views = int(sys.argv[4]) if len(sys.argv) > 4 else 3
    names = sys.argv[5].split(",") if len(sys.argv) > 5 else DEFAULT_NAMES
    os.makedirs(outdir, exist_ok=True)

    flat = "--flat" in sys.argv

    sheet = Image.open(sheet_path).convert("RGB")
    transparent = to_transparent_flat(sheet) if flat else to_transparent(sheet)
    if flat:
        crop = trim(transparent)
        path = os.path.join(outdir, f"{prefix}-{names[0]}.png")
        crop.save(path)
        print(f"{prefix}: {sheet.size[0]}x{sheet.size[1]} -> {crop.size[0]}x{crop.size[1]} (--flat)")
        return
    spans = column_clusters(sheet, expect=views)
    print(f"{prefix}: {sheet.size[0]}x{sheet.size[1]} -> 检出 {len(spans)} 个人物，产出 {len(names)} 张")

    for (x0, x1), name in zip(spans, names):
        crop = drop_shadow(trim(transparent.crop((x0, 0, x1 + 1, sheet.size[1]))))
        path = os.path.join(outdir, f"{prefix}-{name}.png")
        crop.save(path)
        print(f"  {name:6s} {crop.size[0]}x{crop.size[1]} -> {os.path.basename(path)}")


if __name__ == "__main__":
    main()
