@echo off
REM ===================================================
REM Windows 应用程序打包脚本 - 课程目标达成情况评价报告生成工具
REM ===================================================

title 课程目标达成情况评价报告生成工具 - Windows 打包工具
color 0A

echo ┌─────────────────────────────────────────────────┐
echo │      课程目标达成情况评价报告生成工具           │
echo │            Windows 应用程序打包脚本             │
echo └─────────────────────────────────────────────────┘
echo.

cd /d "%~dp0"

echo 正在检查环境...
echo ──────────────────────────────────────

REM 检查 Node.js 和 npm 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [错误] 未找到 Node.js，请确保已安装 Node.js
    echo 您可以从 https://nodejs.org/zh-cn/ 下载安装 Node.js
    goto END
)

echo [√] Node.js 已安装: 
node --version

echo [√] NPM 已安装: 
npm --version

REM 检查必要文件是否存在
if not exist "package.json" (
    color 0C
    echo [错误] 未找到 package.json 文件
    goto END
)

echo [√] package.json 文件已找到

REM 确保工作目录准备就绪
echo 正在准备工作目录...
echo ──────────────────────────────────────
if not exist "icons" (
    mkdir "icons" 2>nul
    echo [i] 已创建 icons 目录
)

echo [√] 工作目录准备完成

REM 终止可能正在运行的应用实例
echo.
echo 步骤 1: 终止可能运行中的应用实例...
echo ──────────────────────────────────────
taskkill /F /IM "课程目标达成情况评价报告生成工具.exe" >nul 2>nul
taskkill /F /IM "electron.exe" >nul 2>nul
echo [√] 已终止运行中的应用实例
timeout /t 1 /nobreak >nul

REM 清理 dist 目录
echo.
echo 步骤 2: 清理 dist 目录...
echo ──────────────────────────────────────
if exist "dist" (
    rmdir /s /q "dist"
    if exist "dist" (
        echo [!] 警告: 无法删除 dist 目录，请检查是否有文件被锁定
    ) else (
        echo [√] dist 目录已清理
    )
) else (
    echo [i] dist 目录不存在，无需清理
)

REM 安装依赖
echo.
echo 步骤 3: 确保依赖已安装...
echo ──────────────────────────────────────
echo 正在安装依赖，请稍候...
call npm install
if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo [!] 警告: 依赖安装过程中出现错误，但将继续尝试打包
) else (
    echo [√] 所有依赖已安装
)

REM 确保 ICU 数据文件存在
echo.
echo 步骤 4: 检查 ICU 数据文件...
echo ──────────────────────────────────────
if not exist "icudtl.dat" (
    echo [!] ICU 数据文件不存在，尝试从 node_modules 复制...
    if exist "node_modules\electron\dist\icudtl.dat" (
        copy /Y "node_modules\electron\dist\icudtl.dat" "icudtl.dat" >nul
        echo [√] ICU 数据文件已复制
    ) else (
        echo [!] 警告: 未找到 ICU 数据文件，应用可能无法正确处理国际化内容
    )
) else (
    echo [√] ICU 数据文件已存在

REM 执行打包命令
echo.
echo 步骤 5: 打包应用程序...
echo ──────────────────────────────────────
echo.
echo 请选择打包类型:
echo.
echo  [1] 64位应用程序 (推荐，适用于大多数电脑)
echo  [2] 32位应用程序 (适用于老旧系统)
echo  [3] 两种架构都打包 (会占用更多磁盘空间)
echo.
set /p CHOICE="请输入选项编号 [1-3] (默认为1): "

echo.
echo 开始打包，请耐心等待...
echo ──────────────────────────────────────

set ERROR_OCCURRED=0

if "%CHOICE%"=="2" (
    echo 正在打包 32 位应用程序...
    call npm run dist:win32
    if %ERRORLEVEL% NEQ 0 set ERROR_OCCURRED=1
) else if "%CHOICE%"=="3" (
    echo 正在打包 64 位应用程序...
    call npm run dist:win
    if %ERRORLEVEL% NEQ 0 set ERROR_OCCURRED=1
    
    echo.
    echo 正在打包 32 位应用程序...
    call npm run dist:win32
    if %ERRORLEVEL% NEQ 0 set ERROR_OCCURRED=1
) else (
    echo 正在打包 64 位应用程序...
    call npm run dist:win
    if %ERRORLEVEL% NEQ 0 set ERROR_OCCURRED=1
)

echo.
echo ──────────────────────────────────────

if %ERROR_OCCURRED% EQU 0 (
    color 0A
    echo.
    echo  ✓ 打包成功完成！
    echo.
    echo  应用程序安装文件已生成在 dist 目录中
    echo.
    echo  您可以将安装程序分发给需要使用的用户
    
    REM 打开输出目录
    timeout /t 2 /nobreak >nul
    start "" "dist"
) else (
    color 0C
    echo.
    echo  × 打包过程中发生错误
    echo.
    echo  请检查上面的错误信息，解决问题后重新运行此脚本
    echo.
    echo  常见问题：
    echo   - Node.js 版本过低
    echo   - 网络连接问题
    echo   - 磁盘空间不足
)

:END
echo.
echo ──────────────────────────────────────
echo.
echo 按任意键退出...
pause>nul