"""把 assets/raw/ 里的原始素材整理成网页用的 assets/photo/。

两类处理：
1. 挂件是从抖音视频截图里裁的（截图时视频处于暂停，画面中央有播放按钮）——
   寿司那张把裁切框整体下移直接避开播放器控件；小猫那张的按钮是半透明白色、
   压在白色绒毛上几乎看不出，不做处理。界面文字也都在裁切框之外。
2. 合照/宿舍/日历/裙子插画只做缩放压缩，它们会当作布景铺满整块区域。

用法: python tools/photos.py
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "assets", "raw")
OUT = os.path.join(ROOT, "assets", "photo")

# 原图坐标 (left, top, right, bottom)
CROPS = {
    "charm-cat": (240, 900, 790, 1990),
    "charm-sushi": (10, 1320, 585, 2160),
}

# 只缩放不裁切：输出名 -> (raw 里的源文件名, 长边上限)
RESIZE = {
    "together": ("photo-together", 1100),
    "dorm": ("photo-dorm", 1100),
    "calendar": ("photo-calendar", 1100),
    "dresses": ("art-dresses", 1400),
}


def save(im, name, max_edge, quality=84):
    scale = max_edge / max(im.size)
    if scale < 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    path = os.path.join(OUT, name + ".jpg")
    im.save(path, quality=quality, optimize=True, progressive=True)
    print(f"{name:16s} {im.size!s:>12}  {os.path.getsize(path) // 1024:>4} KB")


def main():
    os.makedirs(OUT, exist_ok=True)

    for name, box in CROPS.items():
        im = Image.open(os.path.join(RAW, name + ".jpg")).convert("RGB").crop(box)
        save(im, name, 900)

    for name, (source, edge) in RESIZE.items():
        src = os.path.join(RAW, source + ".jpg")
        if not os.path.exists(src):
            print(f"{name:16s} 跳过：raw 里没有 {source}.jpg")
            continue
        save(Image.open(src).convert("RGB"), name, edge)


if __name__ == "__main__":
    main()
