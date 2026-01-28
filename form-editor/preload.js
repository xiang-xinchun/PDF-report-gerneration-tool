const { contextBridge, ipcRenderer } = require('electron');

// 预加载脚本中创建安全的API桥接
contextBridge.exposeInMainWorld('electronAPI', {
    // Excel文件操作
    openExcelFile: () => ipcRenderer.invoke('open-excel-file'),
    parseExcelFile: (filePath,evaluationCount) => ipcRenderer.invoke('parse-excel-file', filePath,evaluationCount),
    // 导出PDF方法
    exportPDF: async () => {
        try {
            console.log('开始导出PDF流程...');
            const result = await ipcRenderer.invoke('export-pdf');
            if (result.success) {
                console.log('PDF已成功导出到:', result.filePath);
                // 通知渲染进程导出成功
                return { success: true, filePath: result.filePath };
            } else {
                console.error('PDF导出失败:', result.message);
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('PDF导出过程发生错误:', error);
            // 提供更详细的错误信息
            let errorMsg = error.toString();
            if (error.stack) {
                console.error('错误堆栈:', error.stack);
            }
            return { success: false, message: errorMsg };
        }
    },
    // 重启应用
    relaunchApp: () => ipcRenderer.invoke('relaunch-app')
});

// 为窗口添加调试函数
contextBridge.exposeInMainWorld('showDebug', (message) => {
    console.log('调试信息:', message);
    try {
        const debugElement = document.getElementById('debug-info');
        if (debugElement) {
            debugElement.textContent = message;
            debugElement.style.display = 'block';
        } else {
            console.log('找不到debug-info元素，无法显示调试信息');
        }
    } catch (err) {
        console.error('显示调试信息出错:', err);
    }
});