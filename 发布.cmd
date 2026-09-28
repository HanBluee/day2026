@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 发布 · 第 2026 天

echo.
echo  ============================================
echo   发布：把 文案.txt 里的文字构建进网站并推到线上
echo  ============================================
echo.

echo  [1/3] 构建...
call node tools/copy.mjs --build
if errorlevel 1 (
  echo.
  echo  --------------------------------------------
  echo   构建没通过。
  echo   多半是某个「### 键名」那一行被删掉或改动了。
  echo   上面的提示里写了缺哪几条，补回来再跑一次。
  echo  --------------------------------------------
  echo.
  pause
  exit /b 1
)

echo.
echo  [2/3] 提交...
git add -A
git commit -m "更新文案" 2>nul
if errorlevel 1 echo       （没有需要提交的改动）

echo.
echo  [3/3] 推送...
git push
if errorlevel 1 (
  echo.
  echo  --------------------------------------------
  echo   推送失败。报错在上面的最后几行。
  echo   --------------------------------------------
  echo.
  pause
  exit /b 1
)

echo.
echo  ============================================
echo   完成。等半分钟左右，线上就是最新的了：
echo     https://hanbluee.github.io/day2026/
echo  ============================================
echo.
pause
