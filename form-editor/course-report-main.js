const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// 禁用GPU加速以避免某些图形渲染问题
app.disableHardwareAcceleration();

// 保持对window对象的全局引用，如果不这样做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let mainWindow;

function createWindow() {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // 加载index.html
    mainWindow.loadFile(path.join(__dirname, 'course-report.html'));

    // 打开开发者工具
    // mainWindow.webContents.openDevTools();

    // 当window被关闭时，触发以下事件
    mainWindow.on('closed', function () {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        mainWindow = null;
    });
}

// 当Electron完成初始化并准备好创建浏览器窗口时调用此方法
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // 在macOS上，当点击dock图标并且没有其他窗口打开时，
        // 通常在应用程序中重新创建一个窗口。
        if (mainWindow === null) createWindow();
    });
});

// 当全部窗口关闭时退出。
app.on('window-all-closed', function () {
    // 在macOS上，除非用户用Cmd + Q确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') app.quit();
});

// 处理PDF导出请求
ipcMain.handle('export-pdf', async () => {
    try {
        // 获取PDF保存路径
        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: '保存PDF报告',
            defaultPath: 'course-report.pdf',
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });

        if (canceled || !filePath) {
            return { success: false, message: '导出已取消' };
        }

        // 获取当前页面的PDF，添加特殊类以激活打印样式
        try {
            await mainWindow.webContents.executeJavaScript(`
                try {
                    // 添加特殊样式表以确保内容可见
                    const exportStylesheet = document.createElement('link');
                    exportStylesheet.rel = 'stylesheet';
                    exportStylesheet.href = 'export-styles.css';
                    exportStylesheet.id = 'export-styles';
                    document.head.appendChild(exportStylesheet);
                    
                    // 添加导出类
                    document.body.classList.add('is-exporting-pdf');
                    
                    // 基本的可见性处理
                    document.querySelectorAll('.step').forEach(step => {
                        step.style.display = 'block';
                    });

                    console.log('PDF导出准备完成');
                } catch (err) {
                    console.error('PDF导出准备出错:', err);
                    throw err;
                }
            `);
        } catch (error) {
            console.error('执行导出准备脚本时出错:', error);
            throw error;
        }

        // 等待一小段时间，确保样式已应用
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 等待更长时间以确保样式完全加载和应用
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 使用更简单的选项，避免可能的冲突
        const pdfData = await mainWindow.webContents.printToPDF({
            margins: { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 },
            pageSize: 'A4',
            printBackground: true,
            landscape: false
        });
        
        // 移除导出PDF的类并恢复界面状态
        try {
            await mainWindow.webContents.executeJavaScript(`
                try {
                    // 移除导出样式表
                    const exportStylesheet = document.getElementById('export-styles');
                    if (exportStylesheet) {
                        exportStylesheet.parentNode.removeChild(exportStylesheet);
                    }
                    
                    // 移除导出类
                    document.body.classList.remove('is-exporting-pdf');
                    
                    // 恢复步骤显示状态
                    const currentStep = document.querySelector('.step.active');
                    if (currentStep) {
                        document.querySelectorAll('.step').forEach(step => {
                            if (step !== currentStep) {
                                step.style.display = 'none';
                            } else {
                                step.style.display = 'block';
                            }
                        });
                    }
                    
                    console.log('PDF导出后清理完成');
                } catch (err) {
                    console.error('PDF导出后清理出错:', err);
                }
            `);
        } catch (error) {
            console.error('执行导出后清理脚本时出错:', error);
            // 不抛出异常，确保PDF仍然能被保存
        }

        // 将PDF数据写入文件
        fs.writeFileSync(filePath, pdfData);
        
        // 使用系统默认应用打开PDF
        shell.openPath(filePath);
        
        return { success: true, filePath };
    } catch (error) {
        console.error('PDF导出错误:', error);
        return { 
            success: false, 
            message: '导出PDF时发生错误: ' + error.message 
        };
    }
});