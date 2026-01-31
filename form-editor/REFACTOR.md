# 项目重构完成说明

## 重构内容

### 1. 目录结构调整

项目已重构为标准的 Electron 项目结构：

```
course-report-generator/
├── src/                          # 源代码目录
│   ├── main/                    # 主进程代码
│   │   ├── index.js            # 主进程入口（ICU初始化）
│   │   ├── main.js             # 主进程核心逻辑
│   │   ├── icu-helper.js       # ICU数据文件辅助工具
│   │   ├── version-info.js     # 版本信息模块
│   │   ├── check-formula-image.js  # 公式图片检查
│   │   ├── create-formula-image.js # 公式图片创建
│   │   └── notification-handler.js # 通知处理
│   │
│   ├── renderer/               # 渲染进程代码
│   │   ├── index.html         # 备用界面
│   │   ├── course-report.html # 主界面
│   │   ├── scripts/           # JavaScript文件
│   │   │   ├── renderer.js
│   │   │   ├── report-editor.js
│   │   │   ├── excelUpload.js
│   │   │   ├── goal-manager.js
│   │   │   ├── calculation-enhanced.js
│   │   │   ├── calculation-dynamic.js
│   │   │   ├── table1-operation-buttons.js
│   │   │   ├── table3-description-updater.js
│   │   │   ├── add-row-feature.js
│   │   │   └── ... (其他脚本)
│   │   └── styles/            # CSS文件
│   │       ├── report-styles.css
│   │       ├── table-styles.css
│   │       ├── edit-fix.css
│   │       └── ... (其他样式)
│   │
│   └── preload/               # 预加载脚本
│       └── preload.js
│
├── assets/                    # 静态资源
│   └── images/               # 图片文件
│       ├── 校徽logo.png
│       ├── school_badge.png
│       ├── gradeExample.png
│       └── gradeTable.png
│
├── examples/                 # 示例文件
│   ├── 化学课程成绩表.xlsx
│   └── 表5自动计算说明.md
│
├── build/                    # 构建资源目录
├── dist/                     # 打包输出目录（自动生成）
│
├── package.json              # 项目配置
├── electron-builder.json     # 打包配置
├── pnpm-lock.yaml           # 依赖锁文件
├── .gitignore               # Git忽略文件
├── README.md                # 项目说明
├── 启动应用.bat             # Windows启动脚本
├── windows打包.bat          # Windows打包脚本
├── 应用检查.bat             # 应用检查脚本
└── 无图标打包.bat           # 无图标打包脚本
```

### 2. 已删除的文件

以下无用文件已被删除：
- `debug-*.js` - 调试脚本
- `test-*.js` - 测试脚本
- `CONSOLE-TEST-SCRIPT.js` - 控制台测试脚本
- `add-row-feature.js.new` - 备份文件
- `icu-helper-fixed.js` - 旧版本文件
- `create-icons.js` - 未使用的脚本
- `desktop.ini` - 系统文件
- 旧的 `index.js` - 已移至 src/main/index.js

### 3. 配置文件更新

#### package.json
- 更新 `main` 字段为 `src/main/index.js`
- 更新 `build.files` 配置以匹配新目录结构
- 更新 `build.directories` 添加 buildResources 路径

#### electron-builder.json
- 同步更新打包配置
- 优化文件包含规则

### 4. 路径引用更新

已更新所有文件中的路径引用：
- 主进程文件中的 preload 和 HTML 文件路径
- HTML 文件中的 CSS 和 JS 引用路径
- 图片资源路径

### 5. 启动脚本优化

简化了 `启动应用.bat`，直接使用 `npm start` 命令。

## 如何使用

### 开发模式

```bash
npm start
# 或
.\启动应用.bat
```

### 打包应用

```bash
npm run build:win     # 64位
npm run build:win32   # 32位
npm run build:all     # 全部
# 或
.\windows打包.bat
```

## 注意事项

1. **首次运行前**：确保运行 `npm install` 安装依赖
2. **公式图片**：需要将公式图片放置在 `assets/images/` 目录
3. **示例数据**：示例Excel文件位于 `examples/` 目录

## 下一步建议

1. 添加单元测试
2. 配置 ESLint 和 Prettier
3. 添加 TypeScript 支持（可选）
4. 完善 CI/CD 流程
