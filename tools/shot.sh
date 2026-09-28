#!/usr/bin/env bash
# 无头 Edge 截图，用来在改样式之后快速看一眼。需要先跑 python -m http.server 8123
# 用法: tools/shot.sh <hash> <输出名> [宽] [高]    例: tools/shot.sh "#s4" s4
#
# 两个坑：
# 1. 每次用独立的临时配置目录，否则 Edge 拿缓存里的旧 CSS，看到的不是最新效果。
# 2. 这版 Edge 有最小窗口宽度（约 492px），--window-size 压不到手机宽度。
#    所以把页面套在一个 iframe 里，iframe 内部才是真正的手机视口。
set -eu
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
DIR="C:\\Users\\Administrator\\Desktop\\day2026\\tools\\_debug\\shots"
NAME="${2:-shot}"
W="${3:-390}"
H="${4:-844}"
ENC="${1:-}"; ENC="${ENC//#/%23}"
PROFILE="$(mktemp -d)"
mkdir -p tools/_debug/shots

"$EDGE" --headless=new --disable-gpu --no-first-run --hide-scrollbars --force-device-scale-factor=1 \
  --user-data-dir="$PROFILE" --disk-cache-dir="$PROFILE/cache" \
  --window-size=$((W + 10)),$((H + 10)) --virtual-time-budget=3800 \
  --screenshot="$DIR\\$NAME.png" \
  "http://127.0.0.1:8123/tools/_debug/_frame.html?w=$W&h=$H&hash=$ENC" >/dev/null 2>&1
rm -rf "$PROFILE"
echo "shots/$NAME.png  (视口 ${W}x${H})"
