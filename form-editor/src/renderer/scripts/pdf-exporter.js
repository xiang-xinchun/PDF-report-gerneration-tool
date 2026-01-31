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

    const win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    const cleanup = () => {
      if (!win.isDestroyed()) {
        win.destroy();
      }
    };

    const handleFailure = (stage, error) => {
      console.error(`${stage}失败:`, error);
      cleanup();
      reject(error);
    };

    win.webContents.once('did-fail-load', (_event, errorCode, errorDescription) => {
      handleFailure('加载HTML', new Error(`${errorCode}: ${errorDescription}`));
    });

    win.webContents.once('did-finish-load', async () => {
      try {
        // 锁定缩放比，避免打印时边框被缩放导致粗细不一致
        await win.webContents.setVisualZoomLevelLimits(1, 1);
        win.webContents.setZoomFactor(1);

        // 注入打印专用样式，确保表格边框统一
        await win.webContents.insertCSS(`
          @media print {
            table { 
              border-collapse: collapse !important; 
              border: none !important;
            }
            th, td {
              border: 1px solid #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `);

        const pdfBuffer = await win.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        });

        fs.writeFile(pdfPath, pdfBuffer, (error) => {
          if (error) {
            handleFailure('写入PDF', error);
            return;
          }

          console.log(`PDF导出成功: ${pdfPath}`);
          cleanup();
          resolve(pdfPath);
        });
      } catch (error) {
        handleFailure('PDF生成', error);
      }
    });

    win.loadFile(htmlPath).catch((error) => handleFailure('加载HTML', error));
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