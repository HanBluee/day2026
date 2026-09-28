@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 本地预览 · 第 2026 天

echo.
echo  启动本地预览，浏览器会自动打开 http://127.0.0.1:8123
echo  改完 文案.txt 跑一次「发布.cmd」，然后回浏览器按 F5 就能看到。
echo.
echo  这个窗口关掉，预览就停了。
echo.

start "" http://127.0.0.1:8123
python -m http.server 8123
