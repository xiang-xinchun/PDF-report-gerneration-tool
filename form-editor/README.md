# 课程目标达成情况评价报告生成工具

## 简介

这是一个基于 Electron 开发的课程目标达成情况评价报告生成工具。应用支持公式、表格等复杂内容编辑，能够导出高质量的PDF报告。

## 项目结构

```
course-report-generator/
├── src/
│   ├── main/              # 主进程代码
│   │   ├── index.js       # 主进程入口（ICU初始化）
│   │   ├── main.js        # 主进程逻辑
│   │   ├── icu-helper.js  # ICU辅助工具
│   │   └── ...            # 其他主进程模块
│   ├── renderer/          # 渲染进程代码
│   │   ├── course-report.html  # 主界面
│   │   ├── scripts/       # JS脚本
│   │   └── styles/        # CSS样式
│   └── preload/           # 预加载脚本
│       └── preload.js
├── assets/                # 静态资源
│   └── images/           # 图片资源
├── build/                # 构建资源
├── dist/                 # 打包输出（自动生成）
├── package.json
└── README.md
```

## 功能特点

### 报告生成器
- **完整的报告编辑界面**：提供课程目标达成情况评价报告的完整编辑功能
- **数学公式支持**：使用 MathJax 支持复杂数学公式的编辑和显示
- **表格编辑**：支持复杂表格的填写和编辑
- **分步骤填写**：将报告填写分为多个步骤，便于操作
- **高质量PDF导出**：使用 Electron 的 printToPDF API 生成高质量PDF

## 安装与运行

### 前提条件

- 安装 [Node.js](https://nodejs.org/) (推荐版本 16.x 或更高)
- 安装 npm 或 pnpm

### 安装步骤

1. 克隆或下载此仓库
2. 进入项目目录
3. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 运行应用

```bash
npm start
# 或直接运行
.\启动应用.bat
```

## 打包应用

### Windows 打包

```bash
npm run build:win
# 或运行
.\windows打包.bat
```
```

## 使用说明

### 1. 启动应用

运行应用后，将显示分步骤的报告编辑界面。

### 2. 报告生成器使用

1. 应用启动后，将显示分步骤的报告编辑界面。
2. 按照步骤填写报告内容，包括课程信息、目标、表格数据等。
3. 完成填写后，点击"导出PDF报告"按钮导出完整报告。

### 3. 分步填写

1. 填写课程基本信息、课程目标以及支撑矩阵等内容
2. 完成当前步骤所有必填项后，点击"下一步"按钮继续
3. 可以随时点击"上一步"按钮回到之前的步骤修改内容

### 4. 导出报告

- 完成所有步骤的填写后，点击"导出PDF报告"按钮
- 选择保存位置后，系统将自动生成PDF并用默认程序打开预览

## 自定义配置

如需自定义报告模板或内容，可以修改以下文件：

- `course-report.html`：修改报告的HTML结构
- `report-styles.css`：修改报告的样式
- `report-editor.js`：修改交互逻辑和PDF导出功能

## 依赖项

- [Electron](https://www.electronjs.org/)：跨平台桌面应用程序框架
- [MathJax](https://www.mathjax.org/)：数学公式渲染库

## 许可证

MIT