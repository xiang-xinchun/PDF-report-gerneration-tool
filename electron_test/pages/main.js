const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // 加载主页面
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // 打开开发者工具（可选）
  mainWindow.webContents.openDevTools();
}

// 监听渲染进程的「选择保存路径」请求
ipcMain.handle('select-save-path', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存课程评价报告',
    defaultPath: path.join(app.getPath('documents'), '课程目标达成情况评价报告.pdf'),
    filters: [{ name: 'PDF 文件', extensions: ['pdf'] }]
  });
  return result.filePath; // 返回用户选择的保存路径
});

// 应用就绪后创建窗口
app.whenReady().then(createWindow);

// 关闭所有窗口时退出应用（Windows/Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// macOS 激活应用时重建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});