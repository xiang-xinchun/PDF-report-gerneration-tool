const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFileSync, execFile } = require('child_process');
const Store = require('electron-store');

// 设置应用程序的根目录
const appRoot = __dirname;

// 设置日志
function log(message) {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ${message}`);
  
  // 同时写入日志文件
  try {
    const logDir = path.join(appRoot, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'app.log');
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  } catch (err) {
    console.error('无法写入日志文件:', err);
  }
}

log('应用启动');

// 初始化配置存储
const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    // 确保窗口显示在最前面
    alwaysOnTop: true,
    show: false
  });

  // 处理页面加载错误
  mainWindow.webContents.on('did-fail-load', () => {
    console.error('加载页面失败，尝试重新加载');
    setTimeout(() => {
      mainWindow.loadFile('index.html');
    }, 1000);
  });

  mainWindow.loadFile('index.html');
  
  // 等页面加载完成后再显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false); // 显示后取消置顶
  });
  
  // 仅在开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

  // 读取图片文件夹
ipcMain.handle('load-images', async () => {
  try {
    const imagesDir = path.join(appRoot, 'images');
    console.log('图片目录路径:', imagesDir);
    
    // 检查目录是否存在
    if (!fs.existsSync(imagesDir)) {
      console.error('图片目录不存在:', imagesDir);
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('已创建图片目录');
    }
    
    const files = fs.readdirSync(imagesDir)
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .map(file => ({
        name: file,
        path: path.join(imagesDir, file)
      }));
    
    console.log('找到图片文件:', files.length);
    return { success: true, files };
  } catch (error) {
    console.error('加载图片失败:', error);
    return { success: false, error: error.message };
  }
});// 保存表单数据
ipcMain.handle('save-form-data', async (event, data) => {
  try {
    store.set('formData', data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 读取表单数据
ipcMain.handle('load-form-data', async () => {
  try {
    const data = store.get('formData', {});
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 生成PDF预览
ipcMain.handle('generate-preview', async (event, htmlContent) => {
  try {
    log('开始生成PDF预览...');
    const tempHtmlPath = path.join(app.getPath('temp'), 'preview.html');
    const tempPdfPath = path.join(app.getPath('temp'), 'preview.pdf');
    
    log(`临时HTML文件路径: ${tempHtmlPath}`);
    log(`临时PDF文件路径: ${tempPdfPath}`);
    log(`HTML内容长度: ${htmlContent ? htmlContent.length : 0} 字节`);
    
    // 检查HTML内容
    if (!htmlContent || htmlContent.length < 100) {
      log('错误: HTML内容为空或过短');
      throw new Error('HTML内容为空或过短，无法生成PDF');
    }
    
    // 确保临时目录存在
    const tempDir = path.dirname(tempHtmlPath);
    if (!fs.existsSync(tempDir)) {
      log(`创建临时目录: ${tempDir}`);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 写入HTML文件
    log('写入HTML文件...');
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
    
    // 确认文件已经写入
    if (!fs.existsSync(tempHtmlPath)) {
      log('错误: 临时HTML文件创建失败');
      throw new Error('临时HTML文件创建失败');
    }
    
    // 检查文件大小
    const stats = fs.statSync(tempHtmlPath);
    log(`临时HTML文件大小: ${stats.size} 字节`);
    
    if (stats.size === 0) {
      log('错误: 生成的HTML文件为空');
      throw new Error('生成的HTML文件为空');
    }
    
    // 尝试第1种方法: 使用直接PDF生成
    log('尝试方法1: 使用直接PDF生成');
    try {
      // 创建一个临时窗口来生成PDF
      const win = new BrowserWindow({
        width: 800,
        height: 1000, // 增加高度以显示更多内容
        show: false, // 设为true可在开发时看到窗口
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      // 加载HTML文件
      log('加载HTML文件...');
      await win.loadFile(tempHtmlPath);
      log('HTML文件加载成功');
      
      // 等待页面加载完成
      log('等待页面渲染 (2秒)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成PDF
      log('生成PDF...');
      const pdfOptions = {
        printBackground: true,
        pageSize: 'A4'
        // 移除页边距设置，使用默认值
      };
      log(`PDF选项: ${JSON.stringify(pdfOptions)}`);
      
      const data = await win.webContents.printToPDF(pdfOptions);
      
      // 写入临时PDF文件
      log(`写入临时PDF文件: ${tempPdfPath}`);
      fs.writeFileSync(tempPdfPath, data);
      
      // 关闭窗口
      win.destroy();
      
      // 检查生成的PDF
      if (fs.existsSync(tempPdfPath)) {
        const pdfSize = fs.statSync(tempPdfPath).size;
        log(`PDF文件创建成功，大小: ${pdfSize} 字节`);
        
        if (pdfSize > 0) {
          log('PDF预览生成成功');
          // 返回PDF的base64编码
          return { success: true, pdf: data.toString('base64') };
        } else {
          log('错误: 生成的PDF文件为空');
          throw new Error('生成的PDF文件为空');
        }
      } else {
        log('错误: PDF文件未创建');
        throw new Error('PDF文件未创建');
      }
    } catch (error) {
      log(`方法1失败: ${error.message}`);
      
      // 尝试第2种方法: 使用子进程生成PDF
      log('尝试方法2: 使用子进程生成PDF');
      try {
        const pdfProcessPromise = new Promise((resolve, reject) => {
          const pdfProcess = execFile('npx', ['electron', 'test-pdf-export.js', tempHtmlPath, tempPdfPath], {
            cwd: __dirname,
            timeout: 30000
          }, (error, stdout, stderr) => {
            if (error) {
              log(`子进程错误: ${error.message}`);
              log(`错误输出: ${stderr}`);
              reject(error);
              return;
            }
            log(`子进程输出: ${stdout}`);
            resolve();
          });
        });
        
        await pdfProcessPromise;
        
        // 检查生成的PDF
        if (fs.existsSync(tempPdfPath) && fs.statSync(tempPdfPath).size > 0) {
          log('方法2成功: 子进程生成PDF成功');
          const pdfData = fs.readFileSync(tempPdfPath);
          return { success: true, pdf: pdfData.toString('base64') };
        } else {
          throw new Error('子进程未能生成有效的PDF');
        }
      } catch (processError) {
        log(`方法2失败: ${processError.message}`);
        
        // 方法3: 如果预览失败，尝试打开HTML文件
        log('尝试方法3: 在浏览器中打开HTML文件');
        try {
          await shell.openExternal('file://' + tempHtmlPath);
          log('已在浏览器中打开HTML');
          return { 
            success: false, 
            error: '无法生成PDF预览，已在浏览器中打开HTML文件，请使用浏览器的打印功能导出PDF' 
          };
        } catch (err) {
          log(`方法3失败: ${err.message}`);
          throw new Error('所有预览方法均失败: ' + error.message);
        }
      }
    }
  } catch (error) {
    log(`预览生成失败: ${error.message}`);
    log(`错误详情: ${error.stack || '无堆栈信息'}`);
    return { 
      success: false, 
      error: `PDF预览生成失败: ${error.message}` 
    };
  }
});

// 导出最终PDF
ipcMain.handle('export-pdf', async (event, htmlContent) => {
  try {
    log('开始导出PDF流程');
    
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: '保存PDF报告',
      defaultPath: path.join(app.getPath('documents'), '课程目标达成情况评价报告.pdf'),
      filters: [{ name: 'PDF文件', extensions: ['pdf'] }]
    });
    
    if (canceled || !filePath) {
      log('用户取消了保存操作');
      return { success: false, error: '未选择保存路径' };
    }
    
    log(`用户选择的保存路径: ${filePath}`);
    const tempHtmlPath = path.join(app.getPath('temp'), 'export.html');
    log(`临时HTML文件路径: ${tempHtmlPath}`);
    
    // 确保临时目录存在
    const tempDir = path.dirname(tempHtmlPath);
    if (!fs.existsSync(tempDir)) {
      log(`创建临时目录: ${tempDir}`);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 写入临时HTML文件
    try {
      log(`写入临时HTML文件 (${htmlContent.length} 字节)`);
      fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
      
      // 确认HTML文件已写入并有内容
      if (!fs.existsSync(tempHtmlPath)) {
        log('错误: 临时HTML文件未创建');
        return { success: false, error: '临时HTML文件创建失败' };
      }
      
      const htmlSize = fs.statSync(tempHtmlPath).size;
      log(`临时HTML文件大小: ${htmlSize} 字节`);
      
      if (htmlSize === 0) {
        log('错误: 临时HTML文件为空');
        return { success: false, error: '临时HTML文件为空' };
      }
      
    } catch (writeError) {
      log(`写入临时HTML文件失败: ${writeError.message}`);
      return { success: false, error: `无法创建临时文件: ${writeError.message}` };
    }
    
    // 尝试多种方法导出PDF
    let exportSuccess = false;
    let exportError = null;
    
    // 方法1：使用原生Electron PDF导出
    log('尝试方法1: 使用Electron原生PDF导出');
    try {
      // 创建一个新窗口来生成PDF
      const win = new BrowserWindow({
        width: 800,
        height: 1000,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      log('加载HTML文件...');
      await win.loadFile(tempHtmlPath);
      log('HTML文件加载成功');
      
      // 确保页面完全加载
      log('等待页面渲染 (3秒)...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 生成截图用于调试
      try {
        const screenshotPath = path.join(path.dirname(filePath), 'debug-screenshot.png');
        await win.webContents.capturePage().then((image) => {
          fs.writeFileSync(screenshotPath, image.toPNG());
          log(`调试: 已保存页面截图到 ${screenshotPath}`);
        });
      } catch (ssErr) {
        log(`无法保存截图: ${ssErr.message}`);
      }
      
      // 配置PDF选项
      log('生成PDF...');
      const pdfOptions = {
        printBackground: true,
        pageSize: 'A4',
        landscape: false,
        preferCSSPageSize: true,
        scaleFactor: 100
        // 移除页边距设置，使用默认值
      };
      
      log(`PDF选项: ${JSON.stringify(pdfOptions)}`);
      const data = await win.webContents.printToPDF(pdfOptions);
      
      log(`写入PDF文件: ${filePath}`);
      fs.writeFileSync(filePath, data);
      win.destroy();
      
      // 验证PDF是否成功生成
      if (fs.existsSync(filePath)) {
        const pdfSize = fs.statSync(filePath).size;
        log(`PDF文件已生成，大小: ${pdfSize} 字节`);
        
        if (pdfSize > 0) {
          log('方法1成功: PDF导出成功');
          exportSuccess = true;
          
          // 尝试自动打开生成的PDF
          try {
            await shell.openPath(filePath);
            log('已自动打开PDF文件');
          } catch (openError) {
            log(`无法自动打开PDF文件: ${openError.message}`);
          }
        } else {
          log('错误: 生成的PDF文件为空');
          throw new Error('生成的PDF文件为空');
        }
      } else {
        log('错误: PDF文件未创建');
        throw new Error('PDF文件未创建');
      }
    } catch (exportErr) {
      log(`方法1失败: ${exportErr.message}`);
      exportError = exportErr;
      
      // 方法2：使用专用测试脚本导出
      if (!exportSuccess) {
        log('尝试方法2: 使用专用测试脚本导出');
        try {
          // 确保测试脚本存在
          const testScript = path.join(__dirname, 'test-pdf-export.js');
          if (!fs.existsSync(testScript)) {
            log('错误: 测试脚本不存在，跳过方法2');
            throw new Error('测试脚本不存在');
          }
          
          // 创建命令行进程
          log('启动专用导出进程...');
          await new Promise((resolve, reject) => {
            const args = [
              'electron',
              'test-pdf-export.js',
              tempHtmlPath,
              filePath
            ];
            
            log(`执行命令: npx ${args.join(' ')}`);
            const child = execFile('npx', args, {
              cwd: __dirname,
              timeout: 30000
            }, (error, stdout, stderr) => {
              if (error) {
                log(`导出进程失败: ${error.message}`);
                log(`标准错误: ${stderr}`);
                reject(error);
                return;
              }
              
              log(`导出进程输出: ${stdout}`);
              resolve();
            });
          });
          
          // 检查PDF是否成功生成
          if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
            log('方法2成功: PDF导出成功');
            exportSuccess = true;
            
            // 尝试自动打开生成的PDF
            try {
              await shell.openPath(filePath);
              log('已自动打开PDF文件');
            } catch (openErr) {
              log(`无法自动打开PDF文件: ${openErr.message}`);
            }
          } else {
            log('方法2失败: PDF文件未生成或为空');
            throw new Error('专用脚本未能生成有效的PDF文件');
          }
        } catch (scriptErr) {
          log(`方法2失败: ${scriptErr.message}`);
          
          // 方法3：尝试使用修复脚本导出
          if (!exportSuccess) {
            log('尝试方法3: 使用修复脚本导出');
            try {
              // 检查修复脚本是否存在
              const fixScript = path.join(__dirname, 'fix-pdf-export.js');
              if (!fs.existsSync(fixScript)) {
                log('错误: 修复脚本不存在，跳过方法3');
                throw new Error('修复脚本不存在');
              }
              
              // 运行修复脚本
              log('启动修复导出进程...');
              await new Promise((resolve, reject) => {
                const args = [
                  'electron',
                  'fix-pdf-export.js',
                  tempHtmlPath,
                  filePath
                ];
                
                log(`执行命令: npx ${args.join(' ')}`);
                execFile('npx', args, {
                  cwd: __dirname,
                  timeout: 30000
                }, (error, stdout, stderr) => {
                  if (error) {
                    log(`修复进程失败: ${error.message}`);
                    log(`标准错误: ${stderr}`);
                    reject(error);
                    return;
                  }
                  
                  log(`修复进程输出: ${stdout}`);
                  resolve();
                });
              });
              
              // 检查PDF是否成功生成
              if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
                log('方法3成功: PDF修复导出成功');
                exportSuccess = true;
                
                try {
                  await shell.openPath(filePath);
                  log('已自动打开PDF文件');
                } catch (openErr) {
                  log(`无法自动打开PDF文件: ${openErr.message}`);
                }
              } else {
                log('方法3失败: PDF文件未生成或为空');
                throw new Error('修复脚本未能生成有效的PDF文件');
              }
            } catch (fixErr) {
              log(`方法3失败: ${fixErr.message}`);
              
              // 方法4：最后的尝试 - 在浏览器中打开HTML
              if (!exportSuccess) {
                log('尝试方法4: 在浏览器中打开HTML让用户手动导出');
                try {
                  await shell.openExternal('file://' + tempHtmlPath);
                  log('已在浏览器中打开HTML');
                  return {
                    success: false,
                    error: '自动PDF导出失败，已在浏览器中打开HTML文件，请使用浏览器的打印功能保存为PDF (Ctrl+P)'
                  };
                } catch (browserErr) {
                  log(`方法4失败: ${browserErr.message}`);
                  return {
                    success: false,
                    error: '所有导出方法均失败，无法打开HTML。请联系技术支持。'
                  };
                }
              }
            }
          }
        }
      }
    }
    
    if (exportSuccess) {
      return { success: true, filePath };
    } else {
      return {
        success: false,
        error: exportError ? `PDF导出失败: ${exportError.message}` : '未知的导出错误'
      };
    }
  } catch (error) {
    log(`导出过程中的未处理错误: ${error.message}`);
    log(`错误栈: ${error.stack || '无堆栈信息'}`);
    return { success: false, error: `导出失败: ${error.message}` };
  }
});