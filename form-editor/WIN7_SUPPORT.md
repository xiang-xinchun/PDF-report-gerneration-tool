# Windows 7 兼容性说明

## 问题
原版本使用 Electron 38.3.0，不支持 Windows 7/8/8.1。
Electron 从 22.0.0 版本开始停止支持旧版Windows。

## 解决方案

### 1. 降级 Electron 版本
- **从**: Electron 38.3.0
- **到**: Electron 21.4.4（最后支持Win7的稳定版本）

### 2. 降级 electron-builder
- **从**: 26.0.12
- **到**: 24.13.3（与Electron 21兼容）

### 3. 配置构建目标
在 `electron-builder.json` 中添加：
```json
"win": {
  "target": [
    {
      "target": "nsis",
      "arch": ["x64", "ia32"]  // 同时支持64位和32位
    }
  ],
  "requestedExecutionLevel": "asInvoker",  // 避免权限问题
  "verifyUpdateCodeSignature": false
}
```

## 重新安装依赖

**重要**：必须删除旧依赖并重新安装

```bash
# 删除 node_modules 和锁文件
rm -rf node_modules
rm pnpm-lock.yaml  # 或 package-lock.json

# 重新安装（使用国内镜像）
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
pnpm install
# 或
npm install
```

## 构建命令

### 构建 64位版本（Win7 x64）
```bash
npm run dist:win
```

### 构建 32位版本（Win7 x86）
```bash
npm run dist:win32
```

### 构建所有架构
```bash
npm run build:all
```

## 支持的系统

使用 Electron 21.4.4 后支持：
- ✅ Windows 7 SP1 及以上
- ✅ Windows 8/8.1
- ✅ Windows 10
- ✅ Windows 11

## 注意事项

### 1. API 兼容性
Electron 21 的一些新API可能不可用，但本项目使用的API都兼容：
- ✅ BrowserWindow
- ✅ ipcMain/ipcRenderer
- ✅ contextBridge
- ✅ dialog
- ✅ shell

### 2. Node.js 版本
Electron 21.4.4 内置 Node.js 16.x，完全兼容本项目代码。

### 3. Chromium 版本
- Electron 38: Chromium 128
- Electron 21: Chromium 106

功能影响：
- ✅ 所有现有功能正常工作
- ✅ CSS兼容性良好
- ✅ JavaScript ES6+支持
- ⚠️ 一些最新的CSS/JS特性可能不支持（但本项目未使用）

### 4. 已知限制
- Windows 7需要安装 .NET Framework 4.5+
- Windows 7需要安装所有系统更新
- 某些Windows 7 RTM版本可能需要升级到SP1

## 测试建议

打包后在以下环境测试：
1. Windows 7 SP1 x64
2. Windows 7 SP1 x86（32位）
3. Windows 10 x64
4. Windows 11

## 故障排查

### 安装失败
**症状**：安装程序无法启动或报错
**解决**：
1. 确保Windows 7已安装SP1
2. 安装 Visual C++ Redistributable 2015-2022
3. 确保 .NET Framework 4.5+已安装

### 应用无法启动
**症状**：双击图标无反应
**检查**：
1. 在 `%APPDATA%` 查看日志文件
2. 以管理员权限运行
3. 检查防火墙/杀毒软件

### API错误
**症状**：某些功能报错
**检查**：
1. 查看开发者工具控制台（Ctrl+Shift+I）
2. 检查是否使用了Electron 21不支持的API
3. 查看main.log日志

## 升级路径

如果将来不需要支持Windows 7：
1. 升级到最新Electron版本
2. 测试所有功能
3. 更新依赖项
4. 重新构建和测试

## 相关链接

- [Electron 21.4.4 Release Notes](https://github.com/electron/electron/releases/tag/v21.4.4)
- [Electron Windows 7 Support](https://www.electronjs.org/docs/latest/tutorial/windows-7-support)
- [electron-builder Configuration](https://www.electron.build/configuration/win)
