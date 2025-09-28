@echo off
echo 正在启动课程目标达成情况评价报告生成工具...
cd /d "%~dp0"

echo 使用指定的主入口文件启动...
npx electron . --main=course-report-main.js

if %ERRORLEVEL% NEQ 0 (
  echo 第一种方法失败，尝试第二种方法...
  npx electron . -r ./course-report-main.js
)

if %ERRORLEVEL% NEQ 0 (
  echo 第二种方法失败，尝试第三种方法...
  start "" npm run start
)

if %ERRORLEVEL% NEQ 0 (
  echo 所有方法都失败了，请检查环境配置。
  echo 可能需要重新安装依赖: npm install
)

echo.
echo 如果应用没有启动，请尝试运行: npm install
echo 然后再次运行此脚本。
pause