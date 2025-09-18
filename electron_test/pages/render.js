// 步骤管理
const steps = ['step1', 'step2', 'step3'];
let currentStepIndex = 0;

// DOM 元素
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// 课程名称联动（步骤1输入后，后续步骤自动显示）
const courseNameInput = document.getElementById('courseName');
const courseNameShow1 = document.getElementById('courseNameShow1'); 
const courseNameShow2 = document.getElementById('courseNameShow2'); 
const courseNameShow3 = document.getElementById('courseNameShow3'); 
const courseNameShow4 = document.getElementById('courseNameShow4');
const courseNameShow5 = document.getElementById('courseNameShow5');
// 监听输入事件：当用户编辑 courseName 时，同步更新所有显示区域
courseNameInput.addEventListener('input', () => {
  // 获取用户输入的课程名称
  const courseName = courseNameInput.textContent; 
  // 同步到所有需要显示的位置
  courseNameShow1.textContent = courseName;
  courseNameShow2.textContent = courseName;
  courseNameShow3.textContent = courseName;
  courseNameShow4.textContent = courseName;
  courseNameShow5.textContent = courseName;
});

// 权重值与达成度联动（步骤4输入后，总达成度区域自动显示）
const targetWeight1 = document.getElementById('targetWeight1');
const targetWeight2 = document.getElementById('targetWeight2');
const targetWeight3 = document.getElementById('targetWeight3');
const targetWeight4 = document.getElementById('targetWeight4');
const targetAchieve1 = document.getElementById('targetAchieve1');
const targetAchieve2 = document.getElementById('targetAchieve2');
const targetAchieve3 = document.getElementById('targetAchieve3');
const targetAchieve4 = document.getElementById('targetAchieve4');
const showWeight1 = document.getElementById('showWeight1');
const showWeight2 = document.getElementById('showWeight2');
const showWeight3 = document.getElementById('showWeight3');
const showWeight4 = document.getElementById('showWeight4');
const showAchieve1 = document.getElementById('showAchieve1');
const showAchieve2 = document.getElementById('showAchieve2');
const showAchieve3 = document.getElementById('showAchieve3');
const showAchieve4 = document.getElementById('showAchieve4');
const totalAchieve = document.getElementById('totalAchieve');

// 监听权重值输入，同步到总达成度表格
function syncWeightAndAchieve() {
  showWeight1.textContent = targetWeight1.value;
  showWeight2.textContent = targetWeight2.value;
  showWeight3.textContent = targetWeight3.value;
  showWeight4.textContent = targetWeight4.value
  showAchieve1.textContent = targetAchieve1.value;
  showAchieve2.textContent = targetAchieve2.value;
  showAchieve3.textContent = targetAchieve3.value;
  showAchieve4.textContent = targetAchieve4.value;

  // 自动计算总达成度（可选，也可让用户手动输入）
  const w1 = parseFloat(showWeight1.textContent);
  const w2 = parseFloat(showWeight2.textContent);
  const w3 = parseFloat(showWeight3.textContent);
  const w4 = parseFloat(showWeight4.textContent);
  const a1 = parseFloat(showAchieve1.textContent);
  const a2 = parseFloat(showAchieve2.textContent);
  const a3 = parseFloat(showAchieve3.textContent);
  const a4 = parseFloat(showAchieve4.textContent);
  const total = (w1*a1 + w2*a2 + w3*a3 + w4*a4).toFixed(2);
  totalAchieve.value = total;
}

// 绑定权重值和达成度输入事件
[targetWeight1, targetWeight2, targetWeight3, targetWeight4, 
 targetAchieve1, targetAchieve2, targetAchieve3, targetAchieve4].forEach(el => {
  el.addEventListener('input', syncWeightAndAchieve);
});

// 步骤切换逻辑
function showCurrentStep() {
  // 隐藏所有步骤
  steps.forEach(stepId => {
    document.getElementById(stepId).classList.remove('active');
  });
  // 显示当前步骤
  document.getElementById(steps[currentStepIndex]).classList.add('active');
  
  // 更新按钮状态
  prevBtn.disabled = currentStepIndex === 0;
  
  // 控制下一步按钮文本
  if (currentStepIndex === steps.length - 1) {
    nextBtn.textContent = '生成并保存 PDF 报告';
  } else {
    nextBtn.textContent = '下一步';
  }
}

prevBtn.addEventListener('click', () => {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    showCurrentStep(); 
  }
});

// 下一步按钮点击事件
nextBtn.addEventListener('click', () => {
  if (currentStepIndex < steps.length - 1) {
    currentStepIndex++;
    showCurrentStep();
  } else {
    bottomExportPdfBtn.focus();
    // 最后一步点击时执行 PDF 导出
    exportPdf();
  }
});

// 提取 PDF 导出逻辑为独立函数
function exportPdf() {
  try {
    // 1. 调用主进程选择保存路径
    window.electronAPI.selectSavePath().then(savePath => {
      if (!savePath) return; // 用户取消选择
      
      // 2. 配置 HTML 转 PDF 选项
      const opt = {
        margin: 10,
        filename: savePath,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // 3. 隐藏按钮，避免导出到 PDF 中
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      
      // 4. 生成 PDF
      html2pdf().set(opt).from(reportContent).save().then(() => {
        // 5. 恢复按钮显示
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        
        alert(`PDF 报告已成功保存至：\n${savePath}`);
      });
    });
  } catch (error) {
    console.error('PDF 导出失败：', error);
    alert('PDF 导出失败，请重试！');
  }
}

// 初始化显示第一步
showCurrentStep();