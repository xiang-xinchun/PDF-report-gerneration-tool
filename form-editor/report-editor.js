(() => {
  const DEFAULT_LOADING_MESSAGE = '正在处理...';

  let steps = [];
  let currentStep = 0;
  let prevBtn = null;
  let nextBtn = null;
  let exportBtn = null;

  document.addEventListener('DOMContentLoaded', () => {
    showLoading('正在初始化编辑器...');
    setTimeout(() => {
      initializeEditor();
      hideLoading();
    }, 100);
  });

  function initializeEditor() {
    console.log('[Init] 开始初始化编辑器...');
    
    collectCoreElements();
    unlockEditableElements();
    prepareEditableElements();
    attachNavigationHandlers();
    
    // 初始化表2到表4的同步和表3的同步
    initializeTableSync();
    
    currentStep = 0;
    showStep(currentStep);
    
    // 确保按钮可用
    if (prevBtn) {
      prevBtn.removeAttribute('disabled');
      prevBtn.disabled = false;
      prevBtn.style.pointerEvents = '';
      prevBtn.style.opacity = '';
    }
    if (nextBtn) {
      nextBtn.removeAttribute('disabled');
      nextBtn.disabled = false;
      nextBtn.style.pointerEvents = '';
      nextBtn.style.opacity = '';
    }
    
    updateNavigationState();
    dispatchInitializationEvent();
    
    console.log('[Init] 编辑器初始化完成');
  }

  function collectCoreElements() {
    steps = Array.from(document.querySelectorAll('.step'));
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    exportBtn = document.getElementById('exportBtn');
  }

  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      if (index === stepIndex) {
        step.classList.add('active');
        step.style.display = 'block';
      } else {
        step.classList.remove('active');
        step.style.display = 'none';
      }
    });
    currentStep = stepIndex;
  }

  function updateNavigationState() {
    if (prevBtn) {
      prevBtn.disabled = currentStep === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = currentStep >= steps.length - 1;
    }
  }

  function attachNavigationHandlers() {
    if (prevBtn) {
      prevBtn.removeEventListener('click', handlePrevClick);
      prevBtn.addEventListener('click', handlePrevClick);
    }
    if (nextBtn) {
      nextBtn.removeEventListener('click', handleNextClick);
      nextBtn.addEventListener('click', handleNextClick);
    }
    if (exportBtn) {
      exportBtn.removeEventListener('click', handleExportClick);
      exportBtn.addEventListener('click', handleExportClick);
    }
  }

  function handlePrevClick() {
    if (currentStep > 0) {
      showStep(currentStep - 1);
      updateNavigationState();
    }
  }

  function handleNextClick() {
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
      updateNavigationState();
    }
  }

  async function handleExportClick() {
    console.log('[Export] 开始导出PDF...');
    
    // 禁用按钮防止重复点击
    if (exportBtn) {
      exportBtn.disabled = true;
      exportBtn.textContent = '正在导出...';
    }
    
    try {
      // 检查 electronAPI 是否存在
      if (!window.electronAPI || !window.electronAPI.exportPDF) {
        throw new Error('导出功能不可用，请确保应用程序正确启动');
      }
      
      // 调用导出API
      const result = await window.electronAPI.exportPDF();
      
      if (result.success) {
        console.log('[Export] PDF导出成功:', result.filePath);
        alert(`PDF报告已成功导出到:\n${result.filePath}`);
      } else {
        console.error('[Export] PDF导出失败:', result.message);
        alert(`导出失败: ${result.message}`);
      }
    } catch (error) {
      console.error('[Export] 导出过程出错:', error);
      alert(`导出时发生错误: ${error.message}`);
    } finally {
      // 延迟执行清理，确保导出完成
      setTimeout(() => {
        forceCleanupAfterExport();
      }, 500);
      
      // 恢复按钮状态
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = '导出PDF报告';
      }
    }
  }

  function forceCleanupAfterExport() {
    console.log('[Export] 强制清理导出状态...');
    
    try {
      // 1. 移除所有导出相关的类
      document.body.classList.remove('is-exporting', 'is-exporting-pdf', 'exporting');
      console.log('[Export] ✓ 已移除导出类');
      
      // 2. 移除所有可能的导出样式表
      const stylesheets = document.querySelectorAll('#export-styles, link[href*="export"]');
      stylesheets.forEach(sheet => {
        if (sheet.parentNode) {
          sheet.parentNode.removeChild(sheet);
          console.log('[Export] ✓ 已移除样式表:', sheet.id || sheet.href);
        }
      });
      
      // 3. 恢复所有步骤的显示状态
      document.querySelectorAll('.step').forEach((step, index) => {
        // 移除内联样式
        step.style.cssText = '';
        // 只显示当前激活的步骤
        if (index === currentStep) {
          step.classList.add('active');
          step.style.display = 'block';
        } else {
          step.classList.remove('active');
          step.style.display = 'none';
        }
      });
      console.log('[Export] ✓ 已恢复步骤显示状态');
      
      // 4. 强制恢复所有可编辑元素
      const editableSelectors = [
        '[contenteditable]',
        '.input-box',
        '.editable-text',
        'input',
        'textarea',
        'select'
      ];
      
      editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          // 移除所有内联样式
          element.style.pointerEvents = '';
          element.style.userSelect = '';
          element.style.webkitUserSelect = '';
          element.style.cursor = '';
          element.style.opacity = '';
          element.style.visibility = '';
          
          // 恢复可编辑属性
          if (element.hasAttribute('contenteditable')) {
            element.setAttribute('contenteditable', 'true');
            element.contentEditable = 'true';
          }
          
          // 移除禁用属性
          element.removeAttribute('disabled');
          element.removeAttribute('readonly');
          if (element.tagName !== 'BUTTON' || element.id !== 'exportBtn') {
            element.disabled = false;
          }
          element.readOnly = false;
        });
      });
      console.log('[Export] ✓ 已恢复所有可编辑元素');
      
      // 5. 清除所有数据集属性
      delete document.body.dataset.prevActiveStep;
      delete document.body.dataset.prevActiveStepIndex;
      document.querySelectorAll('.step').forEach(step => {
        delete step.dataset.prevDisplay;
      });
      console.log('[Export] ✓ 已清除临时数据');
      
      // 6. 重新调用解锁函数
      if (typeof unlockEditableElements === 'function') {
        unlockEditableElements();
        console.log('[Export] ✓ 已调用解锁函数');
      }
      
      // 7. 重新初始化可编辑元素
      if (typeof prepareEditableElements === 'function') {
        prepareEditableElements();
        console.log('[Export] ✓ 已重新初始化可编辑元素');
      }
      
      // 8. 强制重绘
      document.body.style.display = 'none';
      document.body.offsetHeight; // 触发重排
      document.body.style.display = '';
      
      console.log('[Export] ✅ 导出状态清理完成，编辑器已完全恢复');
      console.log('[Export] 当前步骤:', currentStep);
      console.log('[Export] body类列表:', document.body.className);
      
    } catch (cleanupError) {
      console.error('[Export] ❌ 清理导出状态时出错:', cleanupError);
      // 即使出错也尝试基本恢复
      document.body.classList.remove('is-exporting', 'is-exporting-pdf');
    }
  }

  function dispatchInitializationEvent() {
    const event = new CustomEvent('editorInitialized');
    document.dispatchEvent(event);
  }

  function unlockEditableElements() {
    console.log('[Init] 解锁可编辑元素...');
    
    // 移除导出模式类
    document.body.classList.remove('is-exporting', 'is-exporting-pdf');
    
    const elements = getEditableElements();
    console.log(`[Init] 找到 ${elements.length} 个可编辑元素`);
    
    elements.forEach(element => {
      // 设置 contenteditable
      if (element.hasAttribute('contenteditable') || 
          element.classList.contains('editable-text') || 
          element.classList.contains('input-box')) {
        element.setAttribute('contenteditable', 'true');
        element.contentEditable = 'true';
      }
      
      // 移除禁用属性
      element.removeAttribute('disabled');
      element.removeAttribute('readonly');
      element.disabled = false;
      element.readOnly = false;
      
      // 恢复交互样式
      element.style.pointerEvents = '';
      element.style.userSelect = '';
      element.style.cursor = '';
      element.style.opacity = '';
    });
    
    // 确保加载遮罩不阻挡交互
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.pointerEvents = 'none';
      overlay.style.display = 'none';
    }
    
    console.log('[Init] 元素解锁完成');
  }
  
  function prepareEditableElements() {
    console.log('[Init] 准备可编辑元素...');
    
    const elements = getEditableElements();
    console.log(`[Init] 准备 ${elements.length} 个元素`);
    
    elements.forEach(element => {
      const id = element.id;
      if (!id) {
        return;
      }

      const storageKey = `report_${id}`;
      const savedValue = localStorage.getItem(storageKey);
      if (savedValue !== null) {
        if (element.hasAttribute('contenteditable')) {
          element.textContent = savedValue;
        } else {
          element.value = savedValue;
        }
        console.log(`[Init] 已加载 ${id}: ${savedValue.substring(0, 20)}...`);
      }

      // 移除旧的监听器，添加新的
      element.removeEventListener('input', handleAutoSave);
      element.addEventListener('input', handleAutoSave);
    });
    
    console.log('[Init] 元素准备完成');
  }

  function handleAutoSave(event) {
    const element = event.currentTarget;
    const id = element.id;
    if (!id) {
      return;
    }

    const storageKey = `report_${id}`;
    const value = element.hasAttribute('contenteditable') ? element.textContent : element.value;
    localStorage.setItem(storageKey, value);
  }

  function getEditableElements() {
    return Array.from(document.querySelectorAll('[contenteditable="true"], .editable-text, .input-box, input, textarea'));
  }

  function showLoading(message = DEFAULT_LOADING_MESSAGE) {
    const overlay = ensureLoadingOverlay();
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';

    const progress = overlay.querySelector('#loading-progress');
    if (progress) {
      progress.textContent = message;
    }
  }

  function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      return;
    }

    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 200);
  }

  function ensureLoadingOverlay() {
    let overlay = document.getElementById('loading-overlay');
    if (overlay) {
      return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#fff';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
      <div style="width: 60px; height: 60px; border: 8px solid #f3f3f3; border-top: 8px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 15px; font-size: 18px; color: #333;">正在加载应用...</p>
      <p id="loading-progress" data-loading-message style="margin-top: 8px; font-size: 14px; color: #666;">${DEFAULT_LOADING_MESSAGE}</p>
    `;

    const style = document.createElement('style');
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    overlay.appendChild(style);
    document.body.appendChild(overlay);
    return overlay;
  }

  // 表格同步功能（表2→表4，表3→公式3下的表）
  function initializeTableSync() {
    console.log('[Sync] 初始化表格同步...');
    
    // 首次加载时同步数据
    syncTable2ToTable4();
    syncTable3ToShowWeight();
    
    // 为表2中的考核方式和满分字段添加监听器
    for (let i = 1; i <= 4; i++) {
      const evaluationElement = document.getElementById(`evaluation${i}`);
      const scoreElement = document.getElementById(`score${i}`);
      
      if (evaluationElement) {
        evaluationElement.addEventListener('input', () => {
          syncEvaluationName(i);
        });
      }
      
      if (scoreElement) {
        scoreElement.addEventListener('input', () => {
          syncTotalScore(i);
          triggerTable5Calculation();
        });
      }
      
      // 为表2中的权重字段添加监听器，触发表5计算
      for (let j = 1; j <= 4; j++) {
        const weightElement = document.getElementById(`weight${i}-${j}`);
        if (weightElement) {
          weightElement.addEventListener('input', () => {
            console.log(`[Sync] 权重 weight${i}-${j} 已变化`);
            triggerTable5Calculation();
          });
        }
      }
      
      // 为表4中的平均分字段添加监听器，触发表5计算
      const avgScoreElement = document.getElementById(`avgScore${i}`);
      if (avgScoreElement) {
        // 添加 input 事件（用户手动输入）
        avgScoreElement.addEventListener('input', () => {
          console.log(`[Sync] 平均分 avgScore${i} 已变化（input）: ${avgScoreElement.textContent}`);
          triggerTable5Calculation();
        });
        
        // 使用 MutationObserver 监听内容变化（Excel上传等自动填充）
        const observer = new MutationObserver(() => {
          console.log(`[Sync] 平均分 avgScore${i} 已变化（mutation）: ${avgScoreElement.textContent}`);
          triggerTable5Calculation();
        });
        
        observer.observe(avgScoreElement, {
          characterData: true,
          childList: true,
          subtree: true
        });
      }
      
      // 同样监听 totalScore 的变化
      const totalScoreElement = document.getElementById(`totalScore${i}`);
      if (totalScoreElement) {
        const observer = new MutationObserver(() => {
          console.log(`[Sync] 总分 totalScore${i} 已变化: ${totalScoreElement.textContent}`);
          triggerTable5Calculation();
        });
        
        observer.observe(totalScoreElement, {
          characterData: true,
          childList: true,
          subtree: true
        });
      }
      
      // ===== 新增：监听表3的权重值变化 =====
      const targetWeightElement = document.getElementById(`targetWeight${i}`);
      if (targetWeightElement) {
        // 使用 MutationObserver 监听 targetWeight 的变化
        const weightObserver = new MutationObserver(() => {
          const value = targetWeightElement.textContent.trim();
          console.log(`[Sync] 表3权重值 targetWeight${i} 已变化: ${value}`);
          syncTargetWeightToShow(i);
        });
        
        weightObserver.observe(targetWeightElement, {
          characterData: true,
          childList: true,
          subtree: true
        });
      }
    }
    
    // 初始化完成后，立即触发一次计算（延迟以确保DOM完全加载）
    setTimeout(() => {
      console.log('[Sync] 初始化后触发首次计算');
      triggerTable5Calculation();
    }, 1000);
    
    console.log('[Sync] 表格同步初始化完成');
  }
  
  function syncTable2ToTable4() {
    console.log('[Sync] 同步表2数据到表4...');
    
    for (let i = 1; i <= 4; i++) {
      syncEvaluationName(i);
      syncTotalScore(i);
    }
  }
  
  function syncEvaluationName(index) {
    const evaluationElement = document.getElementById(`evaluation${index}`);
    const evaluationShowElement = document.getElementById(`evaluationShow${index}`);
    
    if (evaluationElement && evaluationShowElement) {
      const value = evaluationElement.textContent.trim();
      evaluationShowElement.textContent = value;
      console.log(`[Sync] 已同步考核方式${index}: ${value}`);
    }
  }
  
  function syncTotalScore(index) {
    const scoreElement = document.getElementById(`score${index}`);
    const totalScoreElement = document.getElementById(`totalScore${index}`);
    
    if (scoreElement && totalScoreElement) {
      const value = scoreElement.textContent.trim();
      totalScoreElement.textContent = value;
      console.log(`[Sync] 已同步满分${index}: ${value}`);
    }
  }
  
  // 同步表3的权重值到公式(3)下的表
  function syncTable3ToShowWeight() {
    console.log('[Sync] 同步表3权重值到显示表...');
    
    for (let i = 1; i <= 4; i++) {
      syncTargetWeightToShow(i);
    }
  }
  
  function syncTargetWeightToShow(index) {
    const targetWeightElement = document.getElementById(`targetWeight${index}`);
    const showWeightElement = document.getElementById(`showWeight${index}`);
    
    if (targetWeightElement && showWeightElement) {
      const value = targetWeightElement.textContent.trim();
      showWeightElement.textContent = value;
      console.log(`[Sync] 已同步权重值${index}: ${value} (targetWeight${index} → showWeight${index})`);
    }
  }
  
  // 触发表5（课程分目标达成度）的自动计算
  function triggerTable5Calculation() {
    console.log('[Calc] 触发表5达成度计算...');
    
    // 使用防抖，避免频繁计算
    if (window.table5CalculationTimer) {
      clearTimeout(window.table5CalculationTimer);
    }
    
    window.table5CalculationTimer = setTimeout(() => {
      calculateTable5Achievements();
    }, 500);
  }
  
  // 暴露给全局，让其他模块可以调用
  window.triggerTable5Calculation = triggerTable5Calculation;
  
  // 计算表5的课程分目标达成度
  function calculateTable5Achievements() {
    console.log('[Calc] ========== 开始计算表5达成度 ==========');
    
    // 检查是否有计算模块
    if (typeof window.calculationModule !== 'undefined' && 
        typeof window.calculationModule.calculateWeights === 'function') {
      console.log('[Calc] 使用计算模块进行计算');
      window.calculationModule.calculateWeights();
      return;
    }
    
    // 如果没有计算模块，使用自定义计算
    console.log('[Calc] 使用内置计算逻辑');
    
    try {
      const achievements = [];
      let hasValidData = false;
      
      // 对于每个课程目标（1-4）
      for (let targetIndex = 1; targetIndex <= 4; targetIndex++) {
        let targetAchievement = 0;
        let contributionCount = 0;
        
        console.log(`[Calc] --- 计算课程目标${targetIndex} ---`);
        
        // 对于每种考核方式（1-4）
        for (let methodIndex = 1; methodIndex <= 4; methodIndex++) {
          // 获取权重 K_ij
          const weightElement = document.getElementById(`weight${methodIndex}-${targetIndex}`);
          if (!weightElement) {
            console.log(`[Calc] 警告: 找不到元素 weight${methodIndex}-${targetIndex}`);
            continue;
          }
          
          const weightText = weightElement.textContent.trim();
          if (!weightText) {
            console.log(`[Calc] 方式${methodIndex}对目标${targetIndex}: 权重为空，跳过`);
            continue;
          }
          
          let weight = parseWeightValue(weightText);
          
          // 获取总分 Z_j
          const totalScoreElement = document.getElementById(`totalScore${methodIndex}`);
          if (!totalScoreElement) {
            console.log(`[Calc] 警告: 找不到元素 totalScore${methodIndex}`);
            continue;
          }
          
          const totalScoreText = totalScoreElement.textContent.trim();
          const totalScore = parseFloat(totalScoreText) || 0;
          
          // 获取平均分 Q_j
          const avgScoreElement = document.getElementById(`avgScore${methodIndex}`);
          if (!avgScoreElement) {
            console.log(`[Calc] 警告: 找不到元素 avgScore${methodIndex}`);
            continue;
          }
          
          const avgScoreText = avgScoreElement.textContent.trim();
          const avgScore = parseFloat(avgScoreText) || 0;
          
          console.log(`[Calc] 方式${methodIndex}: 权重="${weightText}"(${weight}), 总分="${totalScoreText}"(${totalScore}), 平均分="${avgScoreText}"(${avgScore})`);
          
          // 计算贡献值：K_ij × (Q_j / Z_j)
          if (totalScore > 0 && weight > 0) {
            const contribution = weight * (avgScore / totalScore);
            targetAchievement += contribution;
            contributionCount++;
            hasValidData = true;
            console.log(`[Calc]   ✓ 贡献值 = ${weight.toFixed(3)} × (${avgScore}/${totalScore}) = ${contribution.toFixed(4)}`);
          } else {
            if (totalScore <= 0) {
              console.log(`[Calc]   ✗ 总分为0或负数，跳过`);
            } else if (weight <= 0) {
              console.log(`[Calc]   ✗ 权重为0，跳过`);
            }
          }
        }
        
        achievements.push(targetAchievement);
        
        // 更新表5中的达成度值
        const achievementElement = document.getElementById(`targetAchieve${targetIndex}`);
        if (achievementElement) {
          const achievementValue = targetAchievement.toFixed(3);
          achievementElement.textContent = achievementValue;
          console.log(`[Calc] ✓✓✓ 课程目标${targetIndex}达成度 = ${achievementValue} (${contributionCount}项贡献)`);
        } else {
          console.log(`[Calc] 警告: 找不到元素 targetAchieve${targetIndex}`);
        }
      }
      
      if (!hasValidData) {
        console.log('[Calc] ⚠️ 警告: 没有有效数据可计算');
      }
      
      console.log('[Calc] ========== 表5计算完成 ==========');
      console.log('[Calc] 结果:', achievements.map((v, i) => `目标${i+1}=${v.toFixed(3)}`).join(', '));
      
    } catch (error) {
      console.error('[Calc] ❌ 计算表5时出错:', error);
      console.error('[Calc] 错误堆栈:', error.stack);
    }
  }
  
  // 解析权重值（支持百分比和小数格式）
  function parseWeightValue(value) {
    if (!value) return 0;
    
    const str = value.toString().trim();
    
    // 处理百分比格式
    if (str.includes('%')) {
      const numStr = str.replace('%', '');
      const num = parseFloat(numStr);
      if (isNaN(num)) return 0;
      return num / 100;
    }
    
    // 处理纯数字格式
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    return num > 1 ? num / 100 : num;
  }

})();
