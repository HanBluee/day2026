"""把 assets/raw/ 里的布景照片压成网页用的尺寸，输出到 assets/photo/。

这里只处理"整张铺满"的照片（合照、宿舍、日历、裙子插画）——它们当作布景
平铺，所以只需要缩放压缩，不裁切。

两只挂件走的是另一条路：作者后来重新生成过干净的纯白底挂件图，现在是
tools/cutout.py 把它们抠成透明 PNG（charm-cat.png / charm-sushi.png），
不再需要从抖音视频截图里裁。

用法: python tools/photos.py
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "assets", "raw")
OUT = os.path.join(ROOT, "assets", "photo")

# 输出名 -> (raw 里的源文件名, 长边上限)
RESIZE = {
    "together": ("photo-together", 1100),
    "dorm": ("photo-dorm", 1100),
    "calendar": ("photo-calendar", 1100),
    "dresses": ("art-dresses", 1400),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, (source, max_edge) in RESIZE.items():
        src = os.path.join(RAW, source + ".jpg")
        if not os.path.exists(src):
            print(f"{name:10s} 跳过：raw 里没有 {source}.jpg")
            continue
        im = Image.open(src).convert("RGB")
        scale = max_edge / max(im.size)
        if scale < 1:
            im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        path = os.path.join(OUT, name + ".jpg")
        im.save(path, quality=84, optimize=True, progressive=True)
        print(f"{name:10s} {im.size!s:>12}  {os.path.getsize(path) // 1024:>4} KB")


if __name__ == "__main__":
    main()
