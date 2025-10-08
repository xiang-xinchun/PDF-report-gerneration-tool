@echo off
REM ===================================================
REM 无图标打包脚本 - 课程目标达成情况评价报告生成工具
REM ===================================================

cd /d "%~dp0"

echo 正在执行无图标打包...
echo ==============================

call npm run clean

REM 使用自定义配置执行打包
call npx electron-builder --win --x64 --config electron-builder.json

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 打包成功完成！
    echo.
    echo 应用程序安装文件已生成在 dist 目录中
    start "" "dist"
) else (
    echo.
    echo 打包过程中发生错误，请检查上面的错误信息
)

pause