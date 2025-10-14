/**
 * 目标管理器快速调试脚本
 * 在浏览器控制台运行此脚本来检查和调试
 */

console.log('===== 目标管理器调试工具 =====');

// 检查1: 脚本是否加载
console.log('1. 检查goalManager是否存在:', typeof window.goalManager !== 'undefined' ? '✅' : '❌');

// 检查2: DOM元素是否存在
console.log('2. 检查h2元素:');
const h2s = document.querySelectorAll('h2');
h2s.forEach((h2, index) => {
    console.log(`   h2[${index}]: ${h2.textContent.substring(0, 20)}...`);
});

// 检查3: 控制按钮是否存在
console.log('3. 检查控制按钮:');
const buttonContainer = document.getElementById('goal-control-buttons');
console.log('   控制面板:', buttonContainer ? '✅ 已添加' : '❌ 未找到');

const addButton = document.getElementById('add-goal-button');
console.log('   添加按钮:', addButton ? '✅ 已添加' : '❌ 未找到');

const removeButton = document.getElementById('remove-goal-button');
console.log('   删除按钮:', removeButton ? '✅ 已添加' : '❌ 未找到');

const countLabel = document.getElementById('goal-count-label');
console.log('   数量标签:', countLabel ? `✅ 已添加 (${countLabel.textContent})` : '❌ 未找到');

// 检查4: 课程目标容器
console.log('4. 检查课程目标容器:');
const goalContainers = document.querySelectorAll('[id^="target"][id$="-container"]');
console.log(`   找到 ${goalContainers.length} 个目标容器`);

// 检查5: 表格
console.log('5. 检查相关表格:');
console.log('   表1:', document.querySelector('#table1-container') ? '✅' : '❌');
console.log('   表2:', document.querySelector('#table2-container') ? '✅' : '❌');
console.log('   表3:', document.querySelector('#table3-container') ? '✅' : '❌');
console.log('   表5:', document.querySelector('#table5-container') ? '✅' : '❌');
console.log('   表6:', document.querySelector('#table6-container') ? '✅' : '❌');

// 提供手动初始化方法
console.log('\n如果按钮未显示,尝试手动初始化:');
console.log('方法1: window.goalManager.init()');
console.log('方法2: 在控制台粘贴以下代码强制添加按钮:');
console.log(`
if (window.goalManager) {
    window.goalManager.init();
} else {
    console.error('goalManager未加载,请检查goal-manager.js是否正确引入');
}
`);

console.log('\n===== 调试工具结束 =====');

// 自动尝试修复
if (!document.getElementById('goal-control-buttons') && window.goalManager) {
    console.log('\n⚠️ 按钮未找到,尝试重新初始化...');
    setTimeout(() => {
        window.goalManager.init();
        console.log('✅ 重新初始化完成');
    }, 100);
}
