const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露通信方法
contextBridge.exposeInMainWorld('electronAPI', {
  selectSavePath: () => ipcRenderer.invoke('select-save-path') // 调用主进程选择保存路径
});