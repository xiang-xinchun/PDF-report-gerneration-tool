// 粘贴此代码到浏览器console中进行快速测试

// 测试1：检查全局回调函数是否存在
console.log("=== 测试1：检查全局回调函数 ===");
console.log("window.recalculateTable5 存在？", typeof window.recalculateTable5 === 'function');
console.log("window.recalculateTable5:", window.recalculateTable5);

// 测试2：检查计算模块是否存在
console.log("\n=== 测试2：检查计算模块 ===");
console.log("window.calculationModule 存在？", typeof window.calculationModule === 'object');
console.log("smartCalculate 存在？", typeof window.calculationModule?.smartCalculate === 'function');

// 测试3：检查表2中的权重数据
console.log("\n=== 测试3：检查表2权重数据 ===");
const weight1_1 = document.getElementById('weight1-1');
const weight1_2 = document.getElementById('weight1-2');
const weight1_3 = document.getElementById('weight1-3');
const weight1_4 = document.getElementById('weight1-4');
console.log("weight1-1:", weight1_1?.textContent || weight1_1?.value || "空");
console.log("weight1-2:", weight1_2?.textContent || weight1_2?.value || "空");
console.log("weight1-3:", weight1_3?.textContent || weight1_3?.value || "空");
console.log("weight1-4:", weight1_4?.textContent || weight1_4?.value || "空");

// 测试4：检查表4中的成绩数据
console.log("\n=== 测试4：检查表4成绩数据 ===");
const totalScore1 = document.getElementById('totalScore1');
const avgScore1 = document.getElementById('avgScore1');
console.log("totalScore1:", totalScore1?.textContent || totalScore1?.value || "空");
console.log("avgScore1:", avgScore1?.textContent || avgScore1?.value || "空");

// 测试5：检查表5的目标元素
console.log("\n=== 测试5：检查表5元素 ===");
for (let i = 1; i <= 4; i++) {
    const elem = document.getElementById(`targetAchieve${i}`);
    console.log(`targetAchieve${i}:`, elem?.textContent || "空");
}

// 测试6：检查表2的考核方式数量
console.log("\n=== 测试6：检查表2考核方式数量 ===");
const evaluationCount = document.querySelectorAll('#table2-container tbody tr').length;
console.log("动态检测到的考核方式数量:", evaluationCount);

// 测试7：手动填充测试数据（可选）
console.log("\n=== 测试7：填充测试数据（可选，取消注释下面的代码执行） ===");
console.log("要自动填充测试数据，取消注释下面的代码：");
console.log(`
// 设置表2权重
document.getElementById('weight1-1').textContent = '0.3';
document.getElementById('weight1-2').textContent = '0.3';
document.getElementById('weight1-3').textContent = '0.2';
document.getElementById('weight1-4').textContent = '0.2';

// 设置表4成绩
document.getElementById('totalScore1').textContent = '100';
document.getElementById('avgScore1').textContent = '85';

// 触发计算
window.recalculateTable5();
`);

// 测试8：手动触发计算
console.log("\n=== 测试8：手动触发表5计算 ===");
console.log("执行 window.recalculateTable5() 来手动触发计算");

// 测试9：查看计算结果
console.log("\n=== 测试9：执行完计算后检查结果 ===");
console.log("执行此代码查看表5结果:");
console.log(`
for (let i = 1; i <= 4; i++) {
    const elem = document.getElementById(\`targetAchieve\${i}\`);
    console.log(\`targetAchieve\${i}:\`, elem?.textContent);
}
`);
