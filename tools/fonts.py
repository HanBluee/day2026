"""把「霞鹜文楷」按站点实际用到的字做成子集，自托管。

为什么现在用子集而不是分片：分片方案里，页面出现一个生僻字就要下载整片
（约 130 个字形、50KB），本站在统计上会拉下近 1MB；按文案精确子集只有
一份两百多 KB 的文件，小四倍。

子集的代价是"改了文案以后新增的字不在里面"。这个代价是可接受的，因为
tokens.css 里的字体栈保留了系统楷体/宋体兜底，缺字只是那个字换一种字体，
不会变豆腐块。大改文案之后重跑一次本脚本即可。

字体授权 OFL，允许自托管与再分发。

用法：
    cd /tmp && npm pack @fontsource/lxgw-wenkai && tar -xzf fontsource-lxgw-wenkai-*.tgz
    cd - && python tools/fonts.py /tmp/package
"""
import os
import sys

from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_FONT = os.path.join(ROOT, "assets", "fonts", "lxgw-wenkai.woff2")
OUT_CSS = os.path.join(ROOT, "src", "styles", "fonts.css")
# 完整字体藏在这个包的 "latin" 文件里（名字是 Fontsource 的打包习惯，内容是全量）
DEFAULT_SRC = "/tmp/package/files/lxgw-wenkai-latin-500-normal.woff2"

# 文案里出现不到、但渲染时一定会用到的字符
ALWAYS = (
    "".join(chr(c) for c in range(0x20, 0x7F))                      # ASCII 可打印
    + "　、。〈〉《》「」『』【】〔〕！＃％（），：；？…—‘’“”·～"
    + "０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ"
)

SCAN = ["index.html", "src/data.js", "src/scenes.js", "src/main.js",
        "src/noodles.js", "src/dom.js"]


def collect_chars():
    chars = set(ALWAYS)
    for rel in SCAN:
        path = os.path.join(ROOT, rel)
        if os.path.exists(path):
            chars |= set(open(path, encoding="utf-8").read())
    chars = {c for c in chars if ord(c) >= 0x20}   # 去掉换行、制表符
    return "".join(sorted(chars))


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    if not os.path.exists(src):
        sys.exit(f"找不到完整字体 {src}\n先按文件头部的用法把 npm 包下载解包")

    text = collect_chars()
    os.makedirs(os.path.dirname(OUT_FONT), exist_ok=True)

    options = subset.Options()
    options.flavor = "woff2"
    options.hinting = False
    options.desubroutinize = True
    options.notdef_outline = True
    options.drop_tables += ["DSIG"]

    font = subset.load_font(src, options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    subset.save_font(font, OUT_FONT, options)

    with open(OUT_CSS, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(
            "/* 霞鹜文楷 LXGW WenKai，OFL 授权，按站点文案做的子集。\n"
            "   由 tools/fonts.py 生成，不要手改；大改文案后重跑该脚本。 */\n"
            "@font-face{font-family:'LXGW WenKai';font-style:normal;font-weight:400;"
            "font-display:swap;"
            "src:url('../../assets/fonts/lxgw-wenkai.woff2') format('woff2');}\n"
        )

    kb = os.path.getsize(OUT_FONT) // 1024
    print(f"子集字符 {len(text)} 个 -> assets/fonts/lxgw-wenkai.woff2（{kb} KB）")
    print(f"@font-face -> src/styles/fonts.css（{os.path.getsize(OUT_CSS)} B）")


if __name__ == "__main__":
    main()
