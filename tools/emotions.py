"""把豆包生成的 3x2 表情组切成对齐的头像。

每格左上角有一个汉字标签，最右下角可能有水印 —— 两者都要去掉。
切完统一贴到同尺寸画布上、头顶对齐，这样在对白里来回换表情时头不会跳。

用法: python tools/emotions.py <sheet.png> <outdir> <prefix>
"""
import os
import sys

from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cutout import to_transparent, trim  # noqa: E402

LABEL_RATIO = 0.185  # 每格顶部这一条是表情标签，按格高取比例
CANVAS = 176         # 输出头像尺寸
HEAD_TOP = 10        # 头顶距画布顶部
COLS, ROWS = 3, 2
# 水印落在整张图右下角，也就是最后一格；那格要往上多扫一截才能清干净
WATERMARK_BAND = 0.70


def normalize(cut):
    """水平居中、头顶对齐地贴到固定画布上。"""
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    scale = min(1.0, (CANVAS - HEAD_TOP * 2) / cut.height, (CANVAS - 8) / cut.width)
    if scale < 1.0:
        cut = cut.resize((max(1, int(cut.width * scale)), max(1, int(cut.height * scale))), Image.LANCZOS)
    canvas.paste(cut, ((CANVAS - cut.width) // 2, HEAD_TOP), cut)
    return canvas


def main():
    sheet_path, outdir, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(outdir, exist_ok=True)
    sheet = Image.open(sheet_path).convert("RGB")
    w, h = sheet.size
    cw, ch = w // COLS, h // ROWS
    label_band = round(ch * LABEL_RATIO)
    names = [["laugh", "cry", "angry"], ["shock", "shy", "down"]]

    print(f"{prefix}: {w}x{h} 每格 {cw}x{ch} 标签带 {label_band}px")
    for r in range(ROWS):
        for c in range(COLS):
            cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
            cell = cell.crop((0, label_band, cw, ch))   # 切掉顶部的汉字标签
            cut = trim(to_transparent(cell, band=WATERMARK_BAND))
            out = normalize(cut)
            path = os.path.join(outdir, f"{prefix}-{names[r][c]}.png")
            out.save(path)
            print(f"  {names[r][c]:6s} {cut.size!s:>10} -> {os.path.basename(path)}")


if __name__ == "__main__":
    main()
