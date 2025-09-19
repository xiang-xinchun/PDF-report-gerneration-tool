#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取当前脚本所在的绝对路径
const scriptDir = __dirname;
console.log('脚本目录:', scriptDir);

// 确保我们在正确的目录中运行
process.chdir(scriptDir);
console.log('当前工作目录:', process.cwd());

// 查找 electron 可执行文件的路径
let electronPath;
try {
  // 尝试使用本地安装的 electron
  electronPath = require('electron');
  console.log('找到本地安装的 Electron:', electronPath);
} catch (e) {
  // 如果本地安装失败，尝试查找全局安装的 electron
  try {
    const possiblePaths = [
      path.join(process.env.APPDATA, 'npm', 'node_modules', 'electron', 'dist', 'electron.exe'),
      path.join(process.env.PROGRAMFILES, 'nodejs', 'node_modules', 'electron', 'dist', 'electron.exe'),
      'npx electron'
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        electronPath = p;
        console.log('找到全局安装的 Electron:', electronPath);
        break;
      }
    }
    
    if (!electronPath) {
      electronPath = 'npx electron';
      console.log('使用 npx electron 命令');
    }
  } catch (err) {
    console.error('无法找到 Electron:', err);
    console.log('尝试使用 npx electron');
    electronPath = 'npx electron';
  }
}

console.log('启动课程报告编辑器...');

let child;
try {
  // 如果是 npx electron，需要使用不同的启动方式
  if (electronPath === 'npx electron') {
    child = spawn('npx', ['electron', '.'], {
      stdio: 'inherit',
      windowsHide: false,
      cwd: scriptDir
    });
  } else {
    child = spawn(electronPath, ['.'], {
      stdio: 'inherit',
      windowsHide: false,
      cwd: scriptDir
    });
  }
  
  child.on('close', (code) => {
    console.log(`应用退出，退出码: ${code}`);
  });
  
  child.on('error', (err) => {
    console.error('启动应用时出错:', err);
    console.log('请尝试使用 start.bat 文件启动应用');
  });
} catch (error) {
  console.error('启动应用失败:', error);
  console.log('请尝试使用 start.bat 文件启动应用');
}