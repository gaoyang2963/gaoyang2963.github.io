@echo off
REM GitHub Push Helper Script
REM 请手动提供 GitHub token

echo ===================================
echo   GitHub Push Helper
echo ===================================
echo.
echo 当前目录: J:\WorkBuddy\20260330194813\hugo-site
echo 远程仓库: https://github.com/gaoyang2963/gaoyang2963.github.io.git
echo.
echo 最近提交:
git -C "J:\WorkBuddy\20260330194813\hugo-site" log --oneline -1
echo.
echo ===================================
echo.

REM 设置代理
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897

REM 推送到 GitHub
echo 正在推送到 GitHub...
git -C "J:\WorkBuddy\20260330194813\hugo-site" push origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================
    echo   ✓ 推送成功！
    echo ===================================
) else (
    echo.
    echo ===================================
    echo   ✗ 推送失败
    echo ===================================
    echo.
    echo 可能原因：
    echo   1. Token 已过期或无效
    echo   2. 网络连接问题
    echo   3. 代理配置问题
    echo.
    echo 请检查后重试。
)

pause
