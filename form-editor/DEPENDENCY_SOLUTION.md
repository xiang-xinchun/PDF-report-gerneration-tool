# 三种方案对比 - Windows 7 依赖项解决方案

## 🎯 核心问题

Electron应用在Windows 7上需要：
1. ❌ Windows 7 SP1 - **无法绕过**（系统API要求）
2. ❌ .NET Framework 4.5+ - **安装程序需要**
3. ⚠️ Visual C++ Redistributable - **应用需要，但可内置**

## ✅ 解决方案

### 方案1: 便携版 (Portable.exe) ★推荐★

**优点**:
- ✅ 不需要 .NET Framework
- ✅ 不需要安装程序
- ✅ 双击即可运行
- ✅ 完全便携

**仍需要**:
- ⚠️ Windows 7 SP1（操作系统更新，无法避免）
- ⚠️ VC++ Runtime（系统通常已有）

**依赖最小化**: ⭐⭐⭐⭐⭐

### 方案2: 压缩包 (.zip)

**优点**:
- ✅ 不需要 .NET Framework
- ✅ 不需要安装程序
- ✅ 解压即用
- ✅ 完全便携

**仍需要**:
- ⚠️ Windows 7 SP1
- ⚠️ VC++ Runtime

**依赖最小化**: ⭐⭐⭐⭐⭐

### 方案3: 安装程序 (Setup.exe)

**优点**:
- ✅ 传统安装体验
- ✅ 自动创建快捷方式

**需要**:
- ❌ .NET Framework 4.5+
- ❌ Windows 7 SP1
- ⚠️ VC++ Runtime

**依赖最小化**: ⭐⭐⭐

---

## 📊 详细对比

| 依赖项 | 安装程序 | 便携版 | 压缩包 | 说明 |
|-------|---------|--------|--------|------|
| **Win7 SP1** | 必需 | 必需 | 必需 | Electron 21 API要求，**无法避免** |
| **.NET Framework** | 必需 | ❌不需要 | ❌不需要 | 仅NSIS安装程序需要 |
| **VC++ Runtime** | 需要 | 需要 | 需要 | 系统通常已安装 |
| **安装步骤** | 需要 | 无 | 解压 | - |
| **管理员权限** | 可选 | ❌不需要 | ❌不需要 | - |
| **注册表** | 写入 | ❌不写 | ❌不写 | - |
| **便携性** | ❌ | ✅ | ✅ | - |
| **文件大小** | 69MB | 120MB | 115MB | - |

---

## 🎯 推荐策略

### 对于Windows 7用户

#### 首选方案: **便携版 (Portable.exe)**

```
课程目标达成情况评价报告生成工具-1.0.0-x64-Portable.exe
```

**理由**:
1. 不需要.NET Framework（最大的障碍）
2. 双击即可运行
3. 无需安装步骤
4. VC++ Runtime系统通常已有

**如果缺少VC++ Runtime**:
- 提示用户下载（8MB，一次性安装）
- 或预先在电脑上安装

#### 备选方案: **压缩包 (.zip)**

```
课程目标达成情况评价报告生成工具-1.0.0-x64.zip
```

**适用场景**:
- 需要批量部署
- 需要查看文件结构
- U盘运行

---

## 💡 实际部署建议

### 场景1: 给老师使用（多台Win7电脑）

**推荐**: 便携版 + 一键VC++安装包

```
发放包内容:
├── 课程目标达成情况评价报告生成工具-Portable.exe
├── VC_redist.x64.exe (8MB，VC++安装包)
└── 使用说明.txt
```

**说明.txt内容**:
```
1. 如果双击程序提示缺少DLL，先运行 VC_redist.x64.exe
2. VC++安装后重新双击程序即可
3. VC++仅需安装一次
```

### 场景2: 网络分发

**推荐**: 提供两个下载链接

```
Win7/8 用户 → 下载便携版 (120MB)
Win10/11 用户 → 下载安装版 (69MB)
```

### 场景3: 内网/离线环境

**推荐**: 压缩包 + VC++离线包

```
离线安装包:
├── 课程报告工具.zip
├── VC_redist.x64.exe
├── VC_redist.x86.exe (给32位系统)
└── 安装说明.pdf
```

---

## ⚠️ 关于 Windows 7 SP1

### 无法避免的依赖

Windows 7 SP1 是 Electron 21 的**硬性要求**，因为：
- Chromium 106 需要 Win7 SP1 的新API
- 无法通过任何打包方式绕过
- 即使降级到更老的Electron也不推荐（安全性和兼容性）

### 检测方法

让用户检查是否安装SP1:
```
开始菜单 → 运行 → winver
查看版本号:
- 6.1.7601 = Win7 SP1 ✅
- 6.1.7600 = Win7 RTM ❌需要升级
```

### 如果未安装SP1

提供SP1下载链接:
- [Windows 7 SP1 x64](https://www.microsoft.com/zh-cn/download/details.aspx?id=5842)
- [Windows 7 SP1 x86](https://www.microsoft.com/zh-cn/download/details.aspx?id=5842)

---

## 🔧 技术实现细节

### 便携版如何避免.NET依赖？

**原理**:
- NSIS安装程序需要.NET Framework来运行安装逻辑
- 便携版直接打包exe，不需要安装程序
- electron-builder的"portable"目标生成单文件可执行程序

### VC++ Runtime能否内置？

**理论上可以**，但不推荐：
- 需要静态链接，会增加文件大小（+30MB）
- Electron不直接支持，需要自定义构建
- 大多数Windows 7已安装VC++ 2015-2022

**最佳实践**:
- 检测是否已安装
- 如未安装，提示用户下载（8MB）
- 或在第一次启动时自动下载安装

### 自动安装VC++？

可以在便携版首次启动时检测并安装:

```javascript
// 在main.js中添加
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkVCRuntime() {
  // 检测VC++是否已安装
  const key = 'HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64';
  exec(`reg query "${key}" /v Installed`, (error) => {
    if (error) {
      // 未安装，提示用户
      dialog.showMessageBox({
        type: 'warning',
        title: '缺少运行库',
        message: 'Visual C++ Redistributable未安装',
        detail: '应用可能无法正常运行。是否现在下载安装？（8MB）',
        buttons: ['下载安装', '稍后'],
        defaultId: 0
      }).then(result => {
        if (result.response === 0) {
          // 打开下载页面或内置安装包
          shell.openExternal('https://aka.ms/vs/17/release/vc_redist.x64.exe');
        }
      });
    }
  });
}
```

---

## 📦 构建配置

当前electron-builder.json配置：

```json
"win": {
  "target": ["nsis", "portable", "zip"]
}
```

**输出**:
- `*-Setup.exe` - 安装程序（需要.NET）
- `*-Portable.exe` - 便携版（不需要.NET）
- `*.zip` - 压缩包（不需要.NET）

---

## ✨ 总结

### 最佳方案

**Windows 7 用户**: 使用**便携版**或**压缩包**
- ✅ 不需要 .NET Framework
- ⚠️ 仍需要 Win7 SP1（无法避免）
- ⚠️ 可能需要 VC++ Runtime（通常已有）

### 依赖最小化程度

1. **便携版/压缩包**: ⭐⭐⭐⭐⭐ (仅需Win7 SP1)
2. **安装程序**: ⭐⭐⭐ (需要Win7 SP1 + .NET 4.5+)

### 实施建议

1. 默认提供便携版
2. 附带VC++ Runtime安装包
3. 说明文档中提示如何检查SP1
4. 为Win10/11用户提供安装程序版

**结论**: 无法完全消除依赖，但可以通过便携版**大幅降低**安装门槛。
