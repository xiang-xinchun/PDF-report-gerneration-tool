const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

// 应用程序根目录
const appRoot = path.join(__dirname, '..');

// 运行的是独立应用还是导出功能
const isExportMode = process.argv.includes('--export');
let exportArgs = null;

// 如果是导出模式，解析参数
if (isExportMode) {
  const argIndex = process.argv.indexOf('--export') + 1;
  if (argIndex < process.argv.length) {
    try {
      exportArgs = JSON.parse(process.argv[argIndex]);
      console.log('导出模式参数:', exportArgs);
    } catch (e) {
      console.error('无法解析导出参数:', e);
    }
  }
}

async function exportToPdf(htmlPath, pdfPath) {
  return new Promise((resolve, reject) => {
    console.log(`正在导出PDF，源文件: ${htmlPath}`);
    console.log(`目标文件: ${pdfPath}`);
    
    // 创建一个隐藏的浏览器窗口
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    
    win.loadFile(htmlPath)
      .then(() => {
        // 等待一秒确保页面完全渲染
        setTimeout(() => {
          win.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
            }
          }).then(data => {
            // 写入PDF文件
            fs.writeFile(pdfPath, data, (error) => {
              if (error) {
                console.error('写入PDF失败:', error);
                reject(error);
              } else {
                console.log(`PDF导出成功: ${pdfPath}`);
                resolve(pdfPath);
              }
              win.destroy();
            });
          }).catch(error => {
            console.error('PDF生成失败:', error);
            win.destroy();
            reject(error);
          });
        }, 1000);
      })
      .catch(error => {
        console.error('加载HTML失败:', error);
        win.destroy();
        reject(error);
      });
  });
}

// 如果是导出模式，只执行导出功能
if (isExportMode && exportArgs) {
  app.whenReady().then(async () => {
    try {
      await exportToPdf(exportArgs.htmlPath, exportArgs.pdfPath);
      console.log('PDF导出成功，退出程序');
      app.exit(0);
    } catch (error) {
      console.error('PDF导出失败:', error);
      app.exit(1);
    }
  });
} else {
  // 主程序功能导出接口
  module.exports = {
    exportPdf: async function(htmlContent, pdfPath) {
      const tempHtmlPath = path.join(app.getPath('temp'), 'export.html');
      
      // 写入临时HTML文件
      fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
      
      // 启动子进程导出PDF（避免主进程阻塞）
      return new Promise((resolve, reject) => {
        const args = [
          path.join(__dirname, 'pdf-exporter.js'),
          '--export',
          JSON.stringify({
            htmlPath: tempHtmlPath,
            pdfPath: pdfPath
          })
        ];
        
        console.log('启动导出子进程，命令:', process.execPath, args.join(' '));
        
        const child = execFile(process.execPath, args, {
          windowsHide: true,
          timeout: 30000
        }, (error, stdout, stderr) => {
          if (error) {
            console.error('导出子进程失败:', error);
            console.error('错误输出:', stderr);
            reject(new Error(`导出失败: ${error.message}`));
            return;
          }
          
          console.log('导出子进程输出:', stdout);
          
          // 检查PDF是否成功生成
          if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0) {
            resolve(pdfPath);
          } else {
            reject(new Error('PDF文件未生成或为空'));
          }
        });
      });
    }
  };
}