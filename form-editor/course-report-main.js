const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// 记录应用启动时间
const appStartTime = Date.now();
console.log('应用启动时间:', new Date().toISOString());

// 使用 require 动态加载重量级模块，避免启动时的阻塞
let XLSX;
setTimeout(() => {
    try {
        XLSX = require('xlsx');
        console.log('XLSX 模块加载完成, 用时:', Date.now() - appStartTime, 'ms');
    } catch (error) {
        console.error('加载 XLSX 模块失败:', error);
    }
}, 1000);

// 导入版本信息模块 - 延迟加载非关键模块
let versionInfo;
setTimeout(() => {
    try {
        versionInfo = require('./version-info');
        versionInfo.logVersionInfo();
    } catch (error) {
        console.error('加载版本信息失败:', error);
    }
}, 2000);

// 禁用GPU加速以避免某些图形渲染问题
app.disableHardwareAcceleration();

// 保持对window对象的全局引用，如果不这样做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let mainWindow;
let splashWindow;

// 创建加载窗口
function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    
    // 创建简单的启动屏幕HTML内容
    const splashHtml = `
    <html>
    <head>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: rgba(255, 255, 255, 0.8);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: #333;
                overflow: hidden;
                border-radius: 10px;
            }
            .loader {
                width: 60px;
                height: 60px;
                border: 8px solid #f3f3f3;
                border-top: 8px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .title {
                margin-top: 20px;
                font-size: 16px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="loader"></div>
        <div class="title">课程目标达成情况评价报告生成工具</div>
        <div style="margin-top: 10px;">正在启动，请稍候...</div>
    </body>
    </html>`;
    
    // 使用数据URL加载HTML内容
    splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
}

function createWindow() {
    // 记录主窗口创建时间
    const mainWindowStartTime = Date.now();
    
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        show: false, // 先不显示主窗口
        autoHideMenuBar: true, // 自动隐藏菜单栏
        menuBarVisible: false, // 默认隐藏菜单栏
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // 加载HTML文件
    mainWindow.loadFile(path.join(__dirname, 'course-report.html'));
    
    // 在主窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        console.log('主窗口准备显示, 耗时:', Date.now() - mainWindowStartTime, 'ms');
        
        // 关闭启动窗口
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
            splashWindow = null;
        }
        
        // 显示主窗口
        mainWindow.show();
    });
    
    // 生产环境不打开开发者工具
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // 当window被关闭时，触发以下事件
    mainWindow.on('closed', function () {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.executeJavaScript(`...`).then(() => {
          mainWindow = null;
          });
        } else {
          mainWindow = null;
        }
    });

    // 处理打开 Excel 文件
    ipcMain.handle('open-excel-file', async () => {
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile'],
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
                ]
            });
            return result;
        } catch (error) {
            console.error('打开 Excel 文件对话框错误:', error);
            throw error;
        }
    });

    ipcMain.handle('parse-excel-file', async (event, filePath) => {
    try {
        if (!filePath) {
            return { success: false, message: '文件路径为空' };
        }

        const workbook = XLSX.readFile(filePath);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (excelData.length === 0) {
            return { success: false, message: 'Excel文件中没有数据' };
        }

        console.log('Excel数据总行数:', excelData.length);
        console.log('前几行数据:', excelData.slice(0, 6));

        // 计算成绩统计数据
        const scores = []
        for (let i = 3; i <= 40; i++) {
            if (excelData[i] && excelData[i].length > 8) {
                const scoreValue = excelData[i][8]; // 总成绩在第9列（索引8）
                const scoreNum = Number(scoreValue);
                console.log(`第${i+1}行成绩:`, scoreValue, '=>', scoreNum);
                
                if (!isNaN(scoreNum) && scoreNum >= 0) {
                    scores.push(scoreNum);
                }
            }
        }
        console.log('解析到的有效成绩:', scores);
        console.log('实际人数:', scores.length);
        if (scores.length === 0) {
            return { success: false, message: '未找到有效的成绩数据' };
        }

        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const avgScore = (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1);

        // 统计各分数段人数
        const count1 = scores.filter(s => s >= 90 && s <= 100).length;
        const count2 = scores.filter(s => s >= 80 && s < 90).length;
        const count3 = scores.filter(s => s >= 70 && s < 80).length;
        const count4 = scores.filter(s => s >= 60 && s < 70).length;
        const count5 = scores.filter(s => s < 60).length;
        const total = scores.length;

        // 计算百分比
        const calcRate = (count) => total > 0 ? ((count / total) * 100).toFixed(1) : 0;

        // 返回结构化数据
        return {
            success: true,
            data: {
                studentCount: total,
                maxScore,
                minScore,
                avgTotalScore: avgScore,
                counts: { count1, count2, count3, count4, count5 },
                rates: {
                    rate1: calcRate(count1),
                    rate2: calcRate(count2),
                    rate3: calcRate(count3),
                    rate4: calcRate(count4),
                    rate5: calcRate(count5)
                }
            }
        };
    } catch (error) {
        console.error('解析Excel文件错误:', error);
        return { success: false, message: error.message };
    }
});
}

// 当Electron完成初始化并准备好创建浏览器窗口时调用此方法
app.whenReady().then(() => {
    // 记录就绪时间
    console.log('Electron应用就绪, 用时:', Date.now() - appStartTime, 'ms');
    
    // 设置空菜单以彻底移除菜单栏
    const { Menu } = require('electron');
    Menu.setApplicationMenu(null);
    
    // 首先创建启动窗口
    createSplashWindow();
    
    // 延迟创建主窗口，让启动窗口有时间显示
    setTimeout(() => {
        createWindow();
    }, 800);

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