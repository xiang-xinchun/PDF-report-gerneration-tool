# 输入框失效问题 - 调试指南

## 问题描述
用户报告：点击confirm/alert对话框后，输入框和contenteditable元素无法点击和输入。

## 已实施的修复方案

### 1. JavaScript层面修复
- **位置**: `src/renderer/course-report.html` (第107-206行)
- **机制**: 
  - 劫持全局`window.confirm`和`window.alert`
  - 对话框关闭后立即执行多次输入框恢复
  - 在12个不同延迟时间点重复恢复：0, 1, 5, 10, 20, 50, 100, 150, 200, 300, 500, 1000ms
  - 每秒定期检查并恢复一次
  - 监听所有交互事件（click, mousedown, mouseup, touchstart, focus）

- **恢复内容**:
  - 移除阻止样式：`pointer-events`, `user-select`, `-webkit-user-select`, `-webkit-user-modify`
  - 强制设置可交互：`pointer-events: auto !important`, `user-select: text !important`
  - 设置Chromium特有属性：`-webkit-user-modify: read-write !important`
  - 移除`disabled`和`readonly`属性
  - 确保`contenteditable="true"`
  - 移除遮罩层和body.modal-open类

### 2. CSS层面修复
- **文件1**: `src/renderer/styles/edit-fix.css`
  - 为所有输入元素添加`!important`规则
  
- **文件2**: `src/renderer/styles/edit-fix-final.css` (最后加载，最高优先级)
  - 全局强制所有交互元素可用
  - 移除遮罩层
  - 恢复body样式

### 3. 模块层面修复
以下文件在confirm/alert调用后添加了恢复代码：
- `src/renderer/scripts/goal-manager.js` - removeGoal函数
- `src/renderer/scripts/table1-operation-buttons.js` - deleteIndicator和deleteRow函数
- `src/renderer/scripts/excelUpload.js` - alert调用后
- `src/renderer/scripts/direct-table-buttons.js` - 错误提示后
- `src/renderer/scripts/report-editor.js` - 全局恢复机制

### 4. 调试工具
- **文件**: `src/renderer/scripts/input-debug.js`
- **快捷键**:
  - `Ctrl+Shift+D` - 检查所有输入框状态
  - `Ctrl+Shift+F` - 强制修复所有输入框
- **功能**: 
  - 实时监控元素属性变化
  - 显示computed样式
  - 强制恢复功能

## 测试步骤

### 步骤1: 启动应用并打开控制台
```bash
npm start
```
按`F12`或`Ctrl+Shift+I`打开开发者工具控制台。

### 步骤2: 验证初始化
控制台应显示：
```
[输入框修复] ========== 初始化完成 ==========
```

### 步骤3: 测试课程目标删除
1. 点击"删除课程目标"按钮
2. 点击"确定"或"取消"
3. 观察控制台输出：
   ```
   [输入框修复] ========== CONFIRM 对话框出现 ==========
   [输入框修复] confirm参数: 确定要删除这个课程目标吗？
   [输入框修复] confirm返回: true/false
   [输入框修复] ========== 开始恢复 XX 个输入元素 ==========
   [输入框修复] confirm后 0ms 执行恢复
   [输入框修复] confirm后 1ms 执行恢复
   ...
   ```
4. 尝试点击任意输入框或contenteditable区域
5. **预期**: 应该可以正常输入

### 步骤4: 测试表格操作删除
1. 在表1中点击"删除指标"或"删除行"按钮
2. 点击"确定"或"取消"
3. 查看控制台日志（同上）
4. 尝试点击输入框

### 步骤5: 使用调试工具
如果输入框仍然无法点击：
1. 按`Ctrl+Shift+D`检查输入框状态
2. 控制台会显示每个输入元素的详细信息：
   ```
   [输入框调试] 元素详情: div.input-field
     - tag: DIV
     - contenteditable: true
     - 计算样式:
       * pointer-events: auto
       * user-select: text
       * display: block
   ```
3. 如果发现pointer-events不是auto，按`Ctrl+Shift+F`强制修复
4. 再次尝试点击输入框

### 步骤6: 监控定期恢复
观察控制台每秒输出：
```
[输入框修复] ===== 定期检查和恢复 =====
[输入框修复] ========== 开始恢复 XX 个输入元素 ==========
...
```

## 可能的问题和排查

### 问题1: 控制台没有显示修复日志
**原因**: JavaScript未正确加载
**排查**:
1. 检查`course-report.html`第107行是否有`window.DEBUG_INPUT_FIX = true;`
2. 刷新页面 (Ctrl+R)
3. 查看Network面板是否有JS加载错误

### 问题2: 日志显示"恢复完成"但仍无法点击
**原因**: CSS优先级问题或浏览器渲染延迟
**排查**:
1. 在控制台手动执行：
   ```javascript
   window._forceInputsInteractive()
   ```
2. 检查元素的computed样式（右键点击 → 检查元素 → Computed标签）
3. 查看是否有`pointer-events: none`
4. 如果有，检查是哪个CSS文件设置的（Sources标签）

### 问题3: 只有特定输入框失效
**原因**: 该元素可能有特殊的事件监听器或CSS
**排查**:
1. 右键点击失效的输入框 → 检查元素
2. 在Elements面板查看该元素的：
   - `contenteditable`属性是否为`true`
   - `disabled`属性是否存在
   - Event Listeners标签查看是否有preventDefault
3. 在控制台执行：
   ```javascript
   const el = document.querySelector('#失效元素的ID');
   console.log({
     contenteditable: el.contentEditable,
     disabled: el.disabled,
     pointerEvents: getComputedStyle(el).pointerEvents,
     userSelect: getComputedStyle(el).userSelect
   });
   ```

### 问题4: Ctrl+Shift+D没有反应
**原因**: input-debug.js未加载
**检查**: 
1. 查看`course-report.html`是否包含：
   ```html
   <script src="scripts/input-debug.js"></script>
   ```
2. Network面板确认文件已加载
3. 控制台执行：
   ```javascript
   typeof checkInputsState
   ```
   应返回`"function"`

## 调试变量

在控制台可以使用的全局函数：
```javascript
// 强制恢复所有输入框
window._forceInputsInteractive()

// 检查输入框状态（需要input-debug.js）
checkInputsState()

// 强制修复（需要input-debug.js）
fixAllInputs()

// 开启/关闭调试日志
window.DEBUG_INPUT_FIX = true  // 开启
window.DEBUG_INPUT_FIX = false // 关闭
```

## 已知限制

1. **定期恢复的性能影响**: 每秒执行一次恢复可能稍微影响性能，生产环境可以考虑关闭
2. **控制台日志**: DEBUG_INPUT_FIX=true会产生大量日志，发布时应设为false
3. **浏览器兼容性**: `-webkit-user-modify`仅在Chromium内核有效，但Electron就是Chromium

## 下一步行动

如果以上所有修复都无效，请：

1. **导出完整日志**:
   - 右键控制台 → Save as...
   - 保存为`console-log.txt`

2. **截图**:
   - F12打开控制台的截图
   - 右键失效输入框 → 检查元素 → Computed标签的截图
   - Event Listeners标签的截图

3. **记录详细步骤**:
   - 哪个按钮触发的confirm/alert
   - 点击确定还是取消
   - 哪个输入框失效了（ID或位置）
   - 刷新页面后是否恢复

4. **提供信息**:
   - Electron版本: 38.3.0
   - Node版本: (运行`node -v`)
   - 操作系统: Windows/Linux/Mac
   - 是否使用了外部鼠标/触摸板

## 紧急回退方案

如果问题严重影响使用，可以临时禁用confirm对话框：

在`course-report.html`的`<head>`中添加：
```html
<script>
window.confirm = function() { return true; };  // 所有confirm自动返回true
window.alert = function() {};  // 禁用alert
</script>
```

这样可以继续使用，但会失去确认提示。
