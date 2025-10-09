// 测试表5自动计算功能
// 在浏览器控制台中运行此脚本来快速测试

console.log('=== 开始测试表5自动计算功能 ===');

// 测试数据
const testData = {
  evaluations: ['期末考试', '课堂表现', '课后作业', '线上作业'],
  scores: [50, 20, 20, 10],
  weights: [
    ['20%', '20%', '30%', '30%'],  // 方式1对目标1-4的权重
    ['20%', '30%', '20%', '30%'],  // 方式2对目标1-4的权重
    ['20%', '20%', '30%', '30%'],  // 方式3对目标1-4的权重
    ['40%', '30%', '20%', '10%']   // 方式4对目标1-4的权重
  ],
  avgScores: [42.4, 15.9, 16.9, 7.1]
};

// 填充表2数据
console.log('步骤1：填充表2（考核方式、满分、权重）...');
for (let i = 1; i <= 4; i++) {
  // 填充考核方式
  const evalElement = document.getElementById(`evaluation${i}`);
  if (evalElement) {
    evalElement.textContent = testData.evaluations[i-1];
    console.log(`✓ evaluation${i} = ${testData.evaluations[i-1]}`);
  }
  
  // 填充满分
  const scoreElement = document.getElementById(`score${i}`);
  if (scoreElement) {
    scoreElement.textContent = testData.scores[i-1];
    console.log(`✓ score${i} = ${testData.scores[i-1]}`);
  }
  
  // 填充权重
  for (let j = 1; j <= 4; j++) {
    const weightElement = document.getElementById(`weight${i}-${j}`);
    if (weightElement) {
      weightElement.textContent = testData.weights[i-1][j-1];
    }
  }
}
console.log('✓ 表2数据填充完成');

// 等待同步到表4
setTimeout(() => {
  console.log('\n步骤2：检查表4总分是否已同步...');
  for (let i = 1; i <= 4; i++) {
    const totalScoreElement = document.getElementById(`totalScore${i}`);
    if (totalScoreElement) {
      console.log(`✓ totalScore${i} = ${totalScoreElement.textContent} (应为 ${testData.scores[i-1]})`);
    }
  }
  
  // 填充表4平均分
  console.log('\n步骤3：填充表4平均分...');
  for (let i = 1; i <= 4; i++) {
    const avgScoreElement = document.getElementById(`avgScore${i}`);
    if (avgScoreElement) {
      avgScoreElement.textContent = testData.avgScores[i-1];
      console.log(`✓ avgScore${i} = ${testData.avgScores[i-1]}`);
      // 触发input事件
      avgScoreElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  
  // 等待计算完成
  setTimeout(() => {
    console.log('\n步骤4：检查表5达成度计算结果...');
    
    // 预期结果（根据公式计算）
    const expected = {
      target1: 0.2*(15.9/20) + 0.2*(16.9/20) + 0.2*(7.1/10) + 0.4*(42.4/50),
      target2: 0.2*(15.9/20) + 0.3*(16.9/20) + 0.2*(7.1/10) + 0.3*(42.4/50),
      target3: 0.3*(15.9/20) + 0.2*(16.9/20) + 0.3*(7.1/10) + 0.2*(42.4/50),
      target4: 0.3*(15.9/20) + 0.3*(16.9/20) + 0.3*(7.1/10) + 0.1*(42.4/50)
    };
    
    console.log('\n预期值：');
    console.log(`  目标1: ${expected.target1.toFixed(3)}`);
    console.log(`  目标2: ${expected.target2.toFixed(3)}`);
    console.log(`  目标3: ${expected.target3.toFixed(3)}`);
    console.log(`  目标4: ${expected.target4.toFixed(3)}`);
    
    console.log('\n实际值：');
    for (let i = 1; i <= 4; i++) {
      const achieveElement = document.getElementById(`targetAchieve${i}`);
      if (achieveElement) {
        const actual = achieveElement.textContent;
        const expectedValue = expected[`target${i}`].toFixed(3);
        const match = actual === expectedValue ? '✓' : '✗';
        console.log(`  ${match} targetAchieve${i} = ${actual} (预期: ${expectedValue})`);
      }
    }
    
    console.log('\n=== 测试完成 ===');
  }, 1500);
}, 1000);
