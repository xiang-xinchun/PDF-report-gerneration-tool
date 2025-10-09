// 调试工具 - 在浏览器控制台中使用

// 手动触发表5计算
function debugCalculateTable5() {
  console.log('=== 手动触发表5计算 ===');
  if (typeof window.triggerTable5Calculation === 'function') {
    window.triggerTable5Calculation();
  } else {
    console.error('❌ window.triggerTable5Calculation 函数未定义');
  }
}

// 检查所有相关元素是否存在
function debugCheckElements() {
  console.log('=== 检查DOM元素 ===');
  
  console.log('\n表2 - 权重元素:');
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 4; j++) {
      const el = document.getElementById(`weight${i}-${j}`);
      const exists = el ? '✓' : '✗';
      const value = el ? el.textContent : 'N/A';
      console.log(`  ${exists} weight${i}-${j}: "${value}"`);
    }
  }
  
  console.log('\n表2 - 满分元素:');
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`score${i}`);
    const exists = el ? '✓' : '✗';
    const value = el ? el.textContent : 'N/A';
    console.log(`  ${exists} score${i}: "${value}"`);
  }
  
  console.log('\n表4 - 总分元素:');
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`totalScore${i}`);
    const exists = el ? '✓' : '✗';
    const value = el ? el.textContent : 'N/A';
    console.log(`  ${exists} totalScore${i}: "${value}"`);
  }
  
  console.log('\n表4 - 平均分元素:');
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`avgScore${i}`);
    const exists = el ? '✓' : '✗';
    const value = el ? el.textContent : 'N/A';
    const editable = el ? el.getAttribute('contenteditable') : 'N/A';
    console.log(`  ${exists} avgScore${i}: "${value}" (editable=${editable})`);
  }
  
  console.log('\n表5 - 达成度元素:');
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`targetAchieve${i}`);
    const exists = el ? '✓' : '✗';
    const value = el ? el.textContent : 'N/A';
    console.log(`  ${exists} targetAchieve${i}: "${value}"`);
  }
}

// 填充测试数据
function debugFillTestData() {
  console.log('=== 填充测试数据 ===');
  
  const testData = {
    scores: ['50', '20', '20', '10'],
    weights: [
      ['20%', '20%', '30%', '30%'],
      ['20%', '30%', '20%', '30%'],
      ['20%', '20%', '30%', '30%'],
      ['40%', '30%', '20%', '10%']
    ],
    avgScores: ['42.4', '15.9', '16.9', '7.1']
  };
  
  // 填充满分
  for (let i = 1; i <= 4; i++) {
    const scoreEl = document.getElementById(`score${i}`);
    if (scoreEl) {
      scoreEl.textContent = testData.scores[i-1];
      console.log(`✓ score${i} = ${testData.scores[i-1]}`);
    }
  }
  
  // 填充权重
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 4; j++) {
      const weightEl = document.getElementById(`weight${i}-${j}`);
      if (weightEl) {
        weightEl.textContent = testData.weights[i-1][j-1];
      }
    }
  }
  console.log('✓ 权重填充完成');
  
  // 填充平均分
  for (let i = 1; i <= 4; i++) {
    const avgScoreEl = document.getElementById(`avgScore${i}`);
    if (avgScoreEl) {
      avgScoreEl.textContent = testData.avgScores[i-1];
      console.log(`✓ avgScore${i} = ${testData.avgScores[i-1]}`);
    }
  }
  
  console.log('\n测试数据填充完成，等待2秒后自动计算...');
  setTimeout(() => {
    debugCalculateTable5();
  }, 2000);
}

// 清空所有数据
function debugClearAllData() {
  console.log('=== 清空所有数据 ===');
  
  // 清空表2
  for (let i = 1; i <= 4; i++) {
    const scoreEl = document.getElementById(`score${i}`);
    if (scoreEl) scoreEl.textContent = '';
    
    for (let j = 1; j <= 4; j++) {
      const weightEl = document.getElementById(`weight${i}-${j}`);
      if (weightEl) weightEl.textContent = '';
    }
  }
  
  // 清空表4
  for (let i = 1; i <= 4; i++) {
    const avgScoreEl = document.getElementById(`avgScore${i}`);
    if (avgScoreEl) avgScoreEl.textContent = '';
  }
  
  // 清空表5
  for (let i = 1; i <= 4; i++) {
    const achieveEl = document.getElementById(`targetAchieve${i}`);
    if (achieveEl) achieveEl.textContent = '';
  }
  
  console.log('✓ 所有数据已清空');
}

// 显示帮助信息
function debugHelp() {
  console.log(`
=== 表5计算调试工具 ===

可用命令:
  debugCheckElements()     - 检查所有相关DOM元素是否存在及其值
  debugCalculateTable5()   - 手动触发表5计算
  debugFillTestData()      - 填充测试数据并自动计算
  debugClearAllData()      - 清空所有数据
  debugHelp()              - 显示此帮助信息

使用示例:
  1. 检查元素: debugCheckElements()
  2. 填充测试数据: debugFillTestData()
  3. 手动计算: debugCalculateTable5()
  4. 清空数据: debugClearAllData()
  `);
}

// 暴露到全局
window.debugCalculateTable5 = debugCalculateTable5;
window.debugCheckElements = debugCheckElements;
window.debugFillTestData = debugFillTestData;
window.debugClearAllData = debugClearAllData;
window.debugHelp = debugHelp;

console.log('✓ 调试工具已加载，输入 debugHelp() 查看可用命令');
