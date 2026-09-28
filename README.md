# 第 2026 天

给邹静雯的纪念网站。打开是一个木盒，掀开盖子，里面一格一格是高中那几年的日子。

纯静态、没有构建步骤、没有依赖。`index.html` 直接引用 `src/` 下的模块，改完刷新即可。

---

## 本地预览

```bash
cd day2026
python -m http.server 8123
```

然后浏览器打开 <http://127.0.0.1:8123>。

> 用 `file://` 直接打开不行——ES module 会被 CORS 挡住，必须走 http。

手机上验证：按 `F12` → `Ctrl+Shift+M` 切到设备模拟，选一个 iPhone 尺寸再点一遍。

### 直接跳转

想单看某一部分，在地址后面加 hash：

| 链接 | 内容 |
| --- | --- |
| `#inside` | 盒内目录 |
| `#s1` … `#s8` | 第一章各幕 |
| `#game` | 泡面危机小游戏 |
| `#finale` | 终章 |
| `#opened` | 直接看盒盖掀开的样子 |

---

## 改文字

**全部文案在根目录的 `文案.txt` 里**，不用碰代码：

```bash
node tools/copy.mjs --build    # 改完跑这条，然后刷新浏览器
```

- `文案.txt` 是普通文本，用任何编辑器都能改
- `### 键名` 那一行不要动，改它底下的内容就行
- 空行会保留（正文里空一行就是分段）
- 正文里可以用 `<em>…</em>` 做高亮、`<b>…</b>` 加粗
- 漏删了某个键，`--build` 会报错并列出缺哪几条，不会悄悄丢字
- 想重新导出一份（比如以后加了新场景）：`node tools/copy.mjs --export`

分工是这样的：

| 文件 | 内容 | 能不能手改 |
| --- | --- | --- |
| `文案.txt` | **所有给人看的文字** | ✅ 改这个 |
| `src/content.js` | 由上面的命令生成的数据 | ❌ 别动 |
| `src/data.js` | 只留结构：谁在哪一幕、用什么布景、图标 | 加场景时才动 |

起算日和纪念日在 `src/data.js` 顶部的 `START` / `UNCLE_DAY`。

---

## 换素材

原始图片放 `assets/raw/`，然后重跑对应脚本（需要 `pillow`）：

```bash
python tools/cutout.py   assets/raw/hs-pair.jpg assets/char hs 2 jing,ya  # 两人合影
python tools/cutout.py   assets/raw/ya-uni.jpg  assets/char ya 3 front    # 三视图只取正面
python tools/cutout.py   assets/raw/charm-cat-clean.jpg assets/photo charm 1 cat  # 单只挂件
python tools/emotions.py assets/raw/ya-uni-emo.jpg assets/face ya         # 3x2 表情组
python tools/photos.py                                                    # 布景照片压缩
```

三个脚本都会自动去掉白底、脚下投影和右下角的「豆包AI生成」水印。
换了新素材只要改路径重跑，页面代码不用动。

产出目录：

- `assets/char/` — 立绘。`hs-` 是高中校服版，`uni-` 是大学版
- `assets/face/` — 对白气泡里的小头像，六种表情
- `assets/photo/` — 挂件的透明抠图 + 布景照片

---

## 字体

标题、按钮、终章那封信用的是**霞鹜文楷**（LXGW WenKai，OFL 开源），已经按当前文案
做成子集放进 `assets/fonts/lxgw-wenkai.woff2`，自托管，不依赖任何外部 CDN
（这点很关键：Google Fonts 在微信里加载不出来）。

**大幅改动文案之后**（比如新增了很多原本没出现过的字），重跑一次：

```bash
cd /tmp && npm pack @fontsource/lxgw-wenkai && tar -xzf fontsource-lxgw-wenkai-*.tgz
cd - && python tools/fonts.py /tmp/package
```

不跑也不会坏：字体栈里保留了系统楷体、宋体的兜底，子集里没有的字
只会换一种字体显示，不会变成豆腐块。

正文用的是系统黑体（iOS 上是苹方、安卓上是思源黑体），不额外下载。

---

## 发布

推到 GitHub 后，仓库 `Settings → Pages → Deploy from a branch → main / (root)`。

站点是纯静态无构建，直接发布仓库根目录即可，不需要 Actions。

---

## 目录

```
index.html            入口
src/
  main.js             场景路由
  scenes.js           四个场景：序章盒子 / 盒内目录 / 回忆一幕 / 终章
  noodles.js          泡面危机小游戏
  data.js             全部文案与内容配置 ← 改这里
  audio.js            音效（WebAudio 现场合成，无音频文件）
  dom.js              建元素的小辅助
  styles/
    tokens.css        配色与字体 token
    app.css           基础 + 序章 + 盒内
    scene.css         回忆幕 + 小游戏 + 终章
tools/                素材处理脚本（不参与运行）
```
