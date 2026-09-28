#!/usr/bin/env bash
# 无头 Edge 截图，用来在改样式之后快速看一眼。需要先跑 python -m http.server 8123
# 用法: tools/shot.sh <hash> <输出名>   例: tools/shot.sh "#s4" s4
# 每次用独立的临时配置目录 —— 否则 Edge 会拿缓存里的旧 CSS，看到的不是最新效果。
set -eu
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
DIR="C:\\Users\\Administrator\\Desktop\\day2026\\tools\\_debug\\shots"
NAME="${2:-shot}"
PROFILE="$(mktemp -d)"
mkdir -p tools/_debug/shots
"$EDGE" --headless=new --disable-gpu --no-first-run --hide-scrollbars --force-device-scale-factor=1 \
  --user-data-dir="$PROFILE" --disk-cache-dir="$PROFILE/cache" \
  --window-size=430,932 --virtual-time-budget=3500 \
  --screenshot="$DIR\\$NAME.png" "http://127.0.0.1:8123/${1:-}" >/dev/null 2>&1
rm -rf "$PROFILE"
echo "shots/$NAME.png"
