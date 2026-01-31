# 自定义对话框方案 - 解决输入框失焦问题

## 方案说明

**问题根源**：浏览器原生的`confirm()`和`alert()`会导致输入框失去焦点和交互能力。

**解决方案**：使用自定义HTML对话框替代原生对话框，完全避免失焦问题。

## 实现方式

### 1. 自定义对话框组件
- **文件**: `src/renderer/scripts/custom-dialogs.js`
- **功能**: 
  - `customConfirm(message, title, options)` - 替代confirm
  - `customAlert(message, title, options)` - 替代alert
- **特点**:
  - 纯HTML/CSS实现，不触发浏览器行为
  - 返回Promise，支持async/await
  - 美观的UI（圆角、阴影、动画）
  - 支持ESC关闭
  - 支持点击遮罩关闭

### 2. 已替换的调用位置

#### goal-manager.js
- `removeGoal()` - 删除课程目标
- `showNotice()` - 通知消息

#### table1-operation-buttons.js
- `deleteIndicator()` - 删除指标
- `deleteRow()` - 删除行

#### excelUpload.js
- `deleteLastRow()` - 删除最后一行
- Excel导入错误提示

#### direct-table-buttons.js
- 添加行功能错误提示

#### report-editor.js
- `undoLastOperation()` - 撤销操作
- `resetAllContent()` - 恢复全部内容

## 使用方法

### customConfirm（确认对话框）

```javascript
// 基本用法
const result = await customConfirm('确定要删除吗？', '确认删除');
if (result) {
    // 用户点击了确定
} else {
    // 用户点击了取消或ESC
}

// 高级用法 - 自定义按钮文本和样式
const result = await customConfirm(
    '确定要删除这个课程目标吗？这将同时删除所有相关表格中的对应列/行。',
    '确认删除课程目标',
    { 
        danger: true,           // 确定按钮显示为红色
        confirmText: '删除',    // 自定义确定按钮文本
        cancelText: '取消'      // 自定义取消按钮文本
    }
);
```

### customAlert（警告对话框）

```javascript
// 基本用法
await customAlert('导入成功！', '成功');

// 自定义按钮文本
await customAlert(
    '至少需要保留一行考核方式',
    '无法删除',
    { okText: '知道了' }
);
```

## 函数必须改为async

使用自定义对话框的函数必须加上`async`关键字：

```javascript
// 错误 ❌
function deleteRow(row) {
    const result = await customConfirm(...);  // 报错：不能在非async函数中使用await
}

// 正确 ✅
async function deleteRow(row) {
    const result = await customConfirm(...);
    if (!result) return;
    // ...删除逻辑
}
```

## 样式定制

对话框样式在`custom-dialogs.js`中内联定义，可以修改：

- **遮罩层**: `rgba(0, 0, 0, 0.5)` + `backdrop-filter: blur(2px)`
- **对话框**: 白色背景，圆角8px，最大宽度500px
- **按钮**: 
  - Primary（主要）: 蓝色 `#2196F3`
  - Secondary（次要）: 灰色 `#f5f5f5`
  - Danger（危险）: 红色 `#f44336`
- **动画**: 0.2s淡入+缩放效果

## 与旧方案对比

| 特性 | 原生confirm/alert | 自定义对话框 |
|------|------------------|-------------|
| 失焦问题 | ✗ 会导致输入框失焦 | ✓ 完全避免失焦 |
| 外观 | ✗ 浏览器默认样式 | ✓ 可自定义美化 |
| 交互 | ✗ 同步阻塞 | ✓ 异步Promise |
| 按钮文本 | ✗ 固定"确定/取消" | ✓ 可自定义 |
| 动画 | ✗ 无 | ✓ 淡入动画 |
| ESC关闭 | ✓ 支持 | ✓ 支持 |
| 键盘导航 | ✓ 支持 | ✓ 支持 |

## 调试

在控制台可以测试对话框：

```javascript
// 测试confirm
customConfirm('这是测试消息', '测试标题').then(result => {
    console.log('用户选择:', result);
});

// 测试alert
customAlert('这是提示消息', '提示').then(() => {
    console.log('对话框已关闭');
});
```

## 注意事项

1. **必须使用await**：所有调用customConfirm/customAlert的地方都必须加await
2. **函数改为async**：包含对话框调用的函数必须声明为async
3. **事件监听器**：如果在事件监听器中使用，监听器函数也要是async
4. **加载顺序**：custom-dialogs.js必须在其他脚本之前加载（已在HTML头部加载）

## 旧方案状态

监听恢复方案已在HTML中注释禁用（DEBUG_INPUT_FIX = false），但代码保留以备不时之需。

如需启用旧方案，修改`course-report.html`第108行：
```javascript
const DEBUG_INPUT_FIX = true;  // 改为true
```

但推荐继续使用自定义对话框方案，从根本上解决问题。
