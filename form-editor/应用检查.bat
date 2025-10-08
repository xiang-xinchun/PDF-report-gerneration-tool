@echo off
REM ===================================================
REM 打包后检查脚本 - 课程目标达成情况评价报告生成工具
REM ===================================================

title 课程目标达成情况评价报告生成工具 - 应用检查
color 0B

echo ┌─────────────────────────────────────────────────┐
echo │      课程目标达成情况评价报告生成工具           │
echo │              打包后检查工具                     │
echo └─────────────────────────────────────────────────┘
echo.

cd /d "%~dp0"

echo 正在检查安装的应用程序...
echo ──────────────────────────────────────

REM 检查安装目录
set INSTALL_DIR=%LOCALAPPDATA%\Programs\课程目标达成情况评价报告生成工具
if not exist "%INSTALL_DIR%" (
    set INSTALL_DIR=%PROGRAMFILES%\课程目标达成情况评价报告生成工具
    if not exist "%INSTALL_DIR%" (
        set INSTALL_DIR=%PROGRAMFILES(X86)%\课程目标达成情况评价报告生成工具
        if not exist "%INSTALL_DIR%" (
            color 0C
            echo [错误] 未找到安装的应用程序
            echo 请确保已安装应用程序
            goto END
        )
    )
)

echo [√] 已找到安装目录: %INSTALL_DIR%

REM 检查可执行文件
if not exist "%INSTALL_DIR%\课程目标达成情况评价报告生成工具.exe" (
    color 0C
    echo [错误] 未找到应用程序可执行文件
    goto END
)

echo [√] 已找到应用程序可执行文件

REM 检查资源文件
if not exist "%INSTALL_DIR%\resources\app.asar" (
    color 0E
    echo [警告] 未找到应用程序资源文件，应用可能无法正常运行
) else (
    echo [√] 应用程序资源文件已找到
)

REM 检查ICU数据文件
set ICU_FOUND=0
if exist "%INSTALL_DIR%\icudtl.dat" set ICU_FOUND=1
if exist "%INSTALL_DIR%\resources\icudtl.dat" set ICU_FOUND=1

if %ICU_FOUND% EQU 0 (
    color 0E
    echo [警告] 未找到ICU数据文件，应用可能无法正常处理国际化内容
) else (
    echo [√] ICU数据文件已找到
)

echo.
echo 检查结果:
echo ──────────────────────────────────────
echo [√] 应用程序安装检查完成

echo.
echo 要测试启动应用程序吗?
echo [Y] 是，启动应用程序
echo [N] 否，退出检查
echo.
set /p CHOICE="请选择 (Y/N): "

if /i "%CHOICE%"=="Y" (
    echo 正在启动应用程序，请稍候...
    start "" "%INSTALL_DIR%\课程目标达成情况评价报告生成工具.exe"
    echo 应用程序已启动!
) else (
    echo 检查完成，未启动应用程序。
)

:END
echo.
echo ──────────────────────────────────────
echo.
echo 按任意键退出...
pause>nul