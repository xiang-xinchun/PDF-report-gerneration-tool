// 测试表3到公式3下表的同步功能

console.log('=== 测试表3权重值同步功能 ===');

// 模拟表3权重值的变化
function testTable3Sync() {
  console.log('\n步骤1：设置表3的权重值...');
  
  const testWeights = ['0.278', '0.278', '0.222', '0.222'];
  
  for (let i = 1; i <= 4; i++) {
    const targetWeightEl = document.getElementById(`targetWeight${i}`);
    if (targetWeightEl) {
      targetWeightEl.textContent = testWeights[i-1];
      console.log(`✓ targetWeight${i} = ${testWeights[i-1]}`);
    } else {
      console.log(`✗ 找不到 targetWeight${i}`);
    }
  }
  
  // 等待同步
  setTimeout(() => {
    console.log('\n步骤2：检查公式3下的表是否已同步...');
    
    let allSynced = true;
    for (let i = 1; i <= 4; i++) {
      const targetWeightEl = document.getElementById(`targetWeight${i}`);
      const showWeightEl = document.getElementById(`showWeight${i}`);
      
      if (targetWeightEl && showWeightEl) {
        const sourceValue = targetWeightEl.textContent.trim();
        const targetValue = showWeightEl.textContent.trim();
        const synced = sourceValue === targetValue;
        
        if (synced) {
          console.log(`✓ showWeight${i} = "${targetValue}" (已同步)`);
        } else {
          console.log(`✗ showWeight${i} = "${targetValue}" (预期: "${sourceValue}")`);
          allSynced = false;
        }
      }
    }
    
    if (allSynced) {
      console.log('\n✓✓✓ 所有权重值已成功同步！');
    } else {
      console.log('\n✗✗✗ 部分权重值未同步，请检查');
    }
  }, 1000);
}

// 运行测试
testTable3Sync();

// 暴露到全局
window.testTable3Sync = testTable3Sync;

console.log('\n可以随时运行 testTable3Sync() 来测试同步功能');
