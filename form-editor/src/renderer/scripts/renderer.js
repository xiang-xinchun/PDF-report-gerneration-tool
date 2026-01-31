const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// 表单步骤定义 - 根据红色标记区域精确设定
const formSteps = [
  {
    id: 1,
    title: '课程基本信息',
    description: '填写课程标题等基本信息（红色标记区域）',
    fields: [
      { 
        id: 'courseTitle', 
        label: '课程标题', 
        type: 'text',
        placeholder: '例如：《功能高分子材料》课程目标达成情况评价报告',
        defaultValue: '《功能高分子材料》课程目标达成情况评价报告',
        required: true
      },
      { 
        id: 'teacherName', 
        label: '任课教师', 
        type: 'text',
        placeholder: '输入教师姓名',
        required: true
      },
      { 
        id: 'teacherTitle', 
        label: '教师职称', 
        type: 'text',
        placeholder: '例如：讲师',
        required: true
      },
      { 
        id: 'semester', 
        label: '授课学期', 
        type: 'text',
        placeholder: '例如：23-24学年第二学期',
        defaultValue: '23-24学年第二学期',
        required: true
      },
      { 
        id: 'className', 
        label: '授课班级', 
        type: 'text',
        placeholder: '例如：材料化学T1班',
        required: true
      },
      { 
        id: 'studentCount', 
        label: '学生人数', 
        type: 'number',
        placeholder: '输入学生数量',
        required: true
      }
    ]
  },
  {
    id: 2,
    title: '课程目标',
    description: '填写课程简介和四个课程目标（红色标记区域）',
    fields: [
      { 
        id: 'courseIntro', 
        label: '课程简介', 
        type: 'textarea',
        placeholder: '请输入课程简介内容...',
        defaultValue: '功能高分子材料是材料化学学科中的一个重要分支，是我校材料化学专业本科生的专业选修课，是材料化学专业学生从事本专业所具备的基础理论知识和发展前沿知识，是培养高分子材料人才的专业基础技术课程之一。本课程的任务是使学生认真学习和掌握功能高分子材料的分子结构与性能之间的关系、制备方法、了解功能高分子材料应用的基本原理及研究方法，从而对功能高分子材料科学有一个比较全面的了解，为合理应用功能高分子材料和研究开发功能高分子材料打下良好的基础。本课程主要涉及功能高分子材料的基本概念、基本原理，阐述功能高分子材料的结构与性能之间的关系，同时对功能高分子材料的发展也有简明扼要的介绍。通过本课程的学习，使学生掌握具有重要应用价值的功能高分子材料品种，如离子交换树脂、吸附树脂、高分子分离膜、液晶高分子、电功能高分子、高分子纳米复合材料、生物降解高分子材料等。同时了解一些新的功能高分子材料如高分子催化剂、形状记忆高分子、智能型高分子凝胶、功能高分子材料的前沿发展动态和研究方向。',
        required: true,
        rows: 8
      },
      { 
        id: 'target1', 
        label: '目标1', 
        type: 'textarea',
        placeholder: '请描述课程目标1...',
        defaultValue: '通过本课程的学习，学生掌握和了解功能高分子材料的基本概念和结构与性能的关系等。',
        required: true,
        rows: 3
      },
      { 
        id: 'target2', 
        label: '目标2', 
        type: 'textarea',
        placeholder: '请描述课程目标2...',
        defaultValue: '通过本课程的学习，使学生了解高分子材料的合成与应用，能灵活使用所学的专业基础知识。',
        required: true,
        rows: 3
      },
      { 
        id: 'target3', 
        label: '目标3', 
        type: 'textarea',
        placeholder: '请描述课程目标3...',
        defaultValue: '学生将所学知识与现代科技发展紧密联系结合，将技术更好地服务于社会发展，包括材料新技术和新产品的开发研制、各种资源的综合利用、发展生产力的综合论证。',
        required: true,
        rows: 3
      },
      { 
        id: 'target4', 
        label: '目标4', 
        type: 'textarea',
        placeholder: '请描述课程目标4...',
        defaultValue: '注重培养学生的创新思维能力，鼓励学生主动探索与思考，将理论知识应用于实践，培养学生的科学研究和创新能力，开拓视野，激发创新思维，培养解决问题的能力，为未来的科研、开发、应用奠定坚实的基础。',
        required: true,
        rows: 3
      }
    ]
  },
  {
    id: 3,
    title: '课程目标与毕业要求关系',
    description: '填写课程目标对毕业要求指标点的支撑关系（红色标记区域）',
    fields: [
      {
        id: 'targetMatrix',
        label: '支撑矩阵',
        type: 'table',
        rows: [
          '1.3 应用工程基础和专业基础知识进行专业实验',
          '2.2 针对复杂化工工程问题，基于科学原理并采用数学模型进行分析和建模',
          '3.3 能够对材料性能进行准确表达',
          '4.1 能够基于科学原理并采用科学方法对复杂化工工程问题进行研究'
        ],
        columns: [
          '课程目标1',
          '课程目标2',
          '课程目标3',
          '课程目标4'
        ],
        placeholder: '输入H(高)、M(中)或L(低)',
        required: true
      }
    ]
  },
  {
    id: 4,
    title: '考核方式与权重',
    description: '填写考核方式对课程目标的权重关系（红色标记区域）',
    fields: [
      {
        id: 'assessmentMatrix',
        label: '考核方式与权重',
        type: 'table',
        rows: [
          '课堂表现',
          '课后作业',
          '线上作业',
          '期末考试',
          '合计'
        ],
        columns: [
          '满分',
          '课程目标1',
          '课程目标2',
          '课程目标3',
          '课程目标4'
        ],
        placeholder: '输入百分比',
        required: true
      },
      {
        id: 'assessmentResults',
        label: '考核成绩',
        type: 'table',
        rows: [
          '平均得分',
          '平均得分率'
        ],
        columns: [
          '课堂表现',
          '课后作业',
          '线上作业',
          '期末考试'
        ],
        placeholder: '输入分数',
        required: true
      }
    ]
  },
  {
    id: 5,
    title: '达成度分析',
    description: '填写课程分目标的达成度（红色标记区域）',
    fields: [
      {
        id: 'targetAchievement',
        label: '各课程目标达成度',
        type: 'table',
        rows: [
          '达成度'
        ],
        columns: [
          '课程目标1',
          '课程目标2',
          '课程目标3',
          '课程目标4'
        ],
        placeholder: '输入达成度数值',
        required: true
      },
      {
        id: 'overallAchievement',
        label: '总达成度',
        type: 'text',
        placeholder: '例如：0.800',
        defaultValue: '0.800',
        required: true
      },
      {
        id: 'achievementAnalysis',
        label: '达成情况分析',
        type: 'textarea',
        placeholder: '请详细分析课程目标达成情况...',
        defaultValue: '从期末测试来看最高分92分，90分以上2人，占比15.38%，80分以上8人占比61.5%，最低分63分，平均分为82.31分。课程总达成度为0.80，表明同学们较好地掌握功能高分子材料的基本理论知识，能较好地将所学知识应用到生活实践中，对功能高分子材料的发展前沿知识有初步的了解。分析各个目标达成度，还发现课程目标1达成度为0.809，表明通过授课学生们学习了解了功能高分子材料的基本知识和原理，结构和性能的关系。目标2达成度的达成度0.809，也表明了同学们掌握了功能高分子材料的制备方法以及应用。目标3的达成为0.79，说明同学们能较好地查阅相关文献，获取功能高分子材料最新研究进展。目标4的达成度为0.79，该达成度偏低表明同学们的创新思维能力和主动学习、思考能力方面仍待进一步提高。',
        required: true,
        rows: 8
      }
    ]
  },
  {
    id: 6,
    title: '持续改进措施',
    description: '填写针对课程持续改进措施（红色标记区域）',
    fields: [
      {
        id: 'improvementMeasures',
        label: '持续改进措施',
        type: 'textarea',
        placeholder: '请描述针对课程存在问题的持续改进措施...',
        defaultValue: '及时总结归纳所存在的问题，确保教学工作有计划，有组织，有步骤开展。存在不足分析：学习态度方面，部分学生学习态度不端正，上课低头玩手机，布置的作业应付了事；学习情况方面，由于学生先学习了高分子化学，具有了一定的知识和经验，具有了一定的自主学习能力和探究能力，合作意识较好；学生层次方面，有少数学生上课认真，能很快地掌握和消化所教知识和理论，也有少数学生上课做其他事情，对课程学习敷衍。持续改进的措施，教学方法上：应用新的教育理念，新理论，让学生在"做中学，学中会"，上课多采用新颖数字化教学方法，如雨课堂等。通过布置小组合作学习任务，课上引导，有效利用教学资源，主富教学方法，提高学生的学习兴趣。通过课前自学、课上引导、自主探究、合作交流等形式获取新知识，激发和培养学生自主学习、探究精神和合作意识。',
        required: true,
        rows: 10
      },
      {
        id: 'departmentReview',
        label: '教研室主任/系主任意见',
        type: 'textarea',
        placeholder: '教研室主任/系主任的意见将在此处显示',
        rows: 5,
        readonly: true
      },
      {
        id: 'collegeReview',
        label: '学院审核意见',
        type: 'textarea',
        placeholder: '学院领导的审核意见将在此处显示',
        rows: 5,
        readonly: true
      }
    ]
  }
];

// 全局变量
let currentStep = 1;
const totalSteps = formSteps.length;
let formData = {};

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化步骤指示器
  initStepIndicator();
  
  // 加载已保存的表单数据
  await loadFormData();
  
  // 渲染第一步表单
  renderCurrentStep();
  
  // 设置按钮事件处理
  document.getElementById('prev-btn').addEventListener('click', goToPrevStep);
  document.getElementById('next-btn').addEventListener('click', goToNextStep);
  document.getElementById('preview-btn').addEventListener('click', generatePreview);
  document.getElementById('export-btn').addEventListener('click', exportPDF);
  
  // 设置自动预览复选框事件处理
  document.getElementById('autoPreview').addEventListener('change', function() {
    if (this.checked) {
      // 如果勾选了自动预览，立即生成一次预览
      generatePreview();
    }
  });
  
  // 首次加载时生成预览
  generatePreview();
  
  // 初始禁用上一步按钮
  updateButtonStates();
});

// 初始化步骤指示器
function initStepIndicator() {
  const indicatorContainer = document.getElementById('step-indicator');
  indicatorContainer.innerHTML = '';
  
  for (let i = 1; i <= totalSteps; i++) {
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    stepElement.textContent = i;
    
    if (i === currentStep) {
      stepElement.classList.add('active');
    }
    
    indicatorContainer.appendChild(stepElement);
  }
}

// 更新步骤指示器状态
function updateStepIndicator() {
  const steps = document.querySelectorAll('.step-indicator .step');
  
  steps.forEach((step, index) => {
    step.classList.remove('active', 'completed');
    
    const stepNumber = index + 1;
    if (stepNumber === currentStep) {
      step.classList.add('active');
    } else if (stepNumber < currentStep) {
      step.classList.add('completed');
    }
  });
  
  document.getElementById('step-status').textContent = `第 ${currentStep} 步，共 ${totalSteps} 步`;
}

// 渲染当前步骤的表单
function renderCurrentStep() {
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = '';
  
  const currentFormStep = formSteps.find(step => step.id === currentStep);
  if (!currentFormStep) return;
  
  const stepSection = document.createElement('div');
  stepSection.className = 'form-section';
  
  const stepTitle = document.createElement('h4');
  stepTitle.textContent = currentFormStep.title;
  stepSection.appendChild(stepTitle);
  
  // 添加步骤描述信息
  if (currentFormStep.description) {
    const stepDesc = document.createElement('div');
    stepDesc.className = 'step-description alert alert-info';
    stepDesc.innerHTML = `<strong>当前步骤：</strong> ${currentFormStep.description}`;
    stepSection.appendChild(stepDesc);
  }  currentFormStep.fields.forEach(field => {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'mb-3 highlight-area';
    
    const label = document.createElement('label');
    label.className = 'form-label';
    label.setAttribute('for', field.id);
    label.textContent = field.label;
    fieldContainer.appendChild(label);
    
    if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.className = 'form-control';
      textarea.id = field.id;
      textarea.placeholder = field.placeholder || '';
      textarea.rows = field.rows || 3;
      textarea.required = !!field.required;
      textarea.readOnly = !!field.readonly;
      textarea.value = formData[field.id] || field.defaultValue || '';
      
      textarea.addEventListener('input', (e) => {
        formData[field.id] = e.target.value;
        saveFormData();
      });
      
      fieldContainer.appendChild(textarea);
    } else if (field.type === 'table') {
      const table = document.createElement('table');
      table.className = 'table table-bordered';
      
      // 创建表头
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      // 添加空单元格作为第一列的表头
      const emptyHeader = document.createElement('th');
      emptyHeader.scope = 'col';
      headerRow.appendChild(emptyHeader);
      
      // 添加列标题
      field.columns.forEach(column => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = column;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // 创建表格内容
      const tbody = document.createElement('tbody');
      
      field.rows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        // 添加行标题
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = row;
        tr.appendChild(th);
        
        // 添加单元格
        field.columns.forEach((column, colIndex) => {
          const td = document.createElement('td');
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'form-control';
          input.placeholder = field.placeholder || '';
          
          const cellId = `${field.id}_${rowIndex}_${colIndex}`;
          input.id = cellId;
          
          // 设置已保存的值
          if (formData[field.id] && formData[field.id][rowIndex] && formData[field.id][rowIndex][colIndex] !== undefined) {
            input.value = formData[field.id][rowIndex][colIndex];
          }
          
          // 保存输入值
          input.addEventListener('input', (e) => {
            if (!formData[field.id]) {
              formData[field.id] = [];
            }
            
            if (!formData[field.id][rowIndex]) {
              formData[field.id][rowIndex] = [];
            }
            
            formData[field.id][rowIndex][colIndex] = e.target.value;
            saveFormData();
          });
          
          td.appendChild(input);
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
      fieldContainer.appendChild(table);
    } else {
      // 默认为文本输入框
      const input = document.createElement('input');
      input.type = field.type || 'text';
      input.className = 'form-control';
      input.id = field.id;
      input.placeholder = field.placeholder || '';
      input.required = !!field.required;
      input.value = formData[field.id] || field.defaultValue || '';
      
      input.addEventListener('input', (e) => {
        formData[field.id] = e.target.value;
        saveFormData();
      });
      
      fieldContainer.appendChild(input);
    }
    
    stepSection.appendChild(fieldContainer);
  });
  
  formContainer.appendChild(stepSection);
}

// 保存表单数据
async function saveFormData() {
  try {
    await ipcRenderer.invoke('save-form-data', formData);
    
    // 如果启用了自动预览，则更新预览
    const autoPreview = document.getElementById('autoPreview').checked;
    if (autoPreview) {
      generatePreview();
    }
  } catch (error) {
    console.error('保存表单数据失败:', error);
  }
}

// 加载表单数据
async function loadFormData() {
  try {
    const result = await ipcRenderer.invoke('load-form-data');
    if (result.success) {
      formData = result.data || {};
    }
  } catch (error) {
    console.error('加载表单数据失败:', error);
  }
}

// 验证当前步骤的表单
function validateCurrentStep() {
  const currentFormStep = formSteps.find(step => step.id === currentStep);
  if (!currentFormStep) return true;
  
  let isValid = true;
  
  currentFormStep.fields.forEach(field => {
    if (field.required) {
      if (field.type === 'table') {
        // 表格验证逻辑
        if (!formData[field.id] || !formData[field.id].some(row => row && row.some(cell => cell))) {
          isValid = false;
        }
      } else {
        // 普通输入框验证
        if (!formData[field.id]) {
          isValid = false;
        }
      }
    }
  });
  
  return isValid;
}

// 前往上一步
function goToPrevStep() {
  if (currentStep > 1) {
    currentStep--;
    renderCurrentStep();
    updateStepIndicator();
    updateButtonStates();
  }
}

// 显示通知消息
function showNotification(message, title = '通知', type = 'info') {
  const toastEl = document.getElementById('notification-toast');
  const toastTitle = document.getElementById('toast-title');
  const toastBody = document.getElementById('toast-message');
  
  if (!toastEl || !toastTitle || !toastBody) {
    console.error('找不到通知元素，无法显示通知');
    console.log(message, title, type);
    return;
  }
  
  // 设置通知类型的样式
  toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'text-white');
  
  if (type === 'success') {
    toastEl.classList.add('bg-success', 'text-white');
  } else if (type === 'error') {
    toastEl.classList.add('bg-danger', 'text-white');
  } else if (type === 'warning') {
    toastEl.classList.add('bg-warning');
  } else {
    toastEl.classList.add('bg-info', 'text-white');
  }
  
  // 设置通知内容
  toastTitle.textContent = title;
  toastBody.textContent = message;
  
  // 显示通知
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// 为兼容性提供的showToast别名函数
const showToast = showNotification;

// 前往下一步
function goToNextStep() {
  if (!validateCurrentStep()) {
    showNotification('请完成当前步骤的所有必填项再继续', '验证失败', 'warning');
    return;
  }
  
  if (currentStep < totalSteps) {
    currentStep++;
    renderCurrentStep();
    updateStepIndicator();
    updateButtonStates();
  }
}

// 更新按钮状态
function updateButtonStates() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  prevBtn.disabled = currentStep === 1;
  nextBtn.textContent = currentStep === totalSteps ? '完成' : '下一步';
}

// 生成表单数据的HTML
function generateFormHtml() {
  // 生成与原始报告模板完全匹配的HTML
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>课程目标达成情况评价报告</title>
    <style>
      body {
        font-family: "SimSun", "宋体", serif;
        margin: 0;
        padding: 20px;
        color: #333;
        line-height: 1.6;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        max-width: 600px;
      }
      h1 {
        text-align: center;
        font-size: 24px;
        margin: 20px 0 40px 0;
        font-weight: bold;
      }
      h2 {
        font-size: 20px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
        margin-top: 30px;
        font-weight: bold;
      }
      h3 {
        font-size: 18px;
        margin-top: 25px;
        font-weight: bold;
      }
      p {
        text-indent: 2em;
        margin: 15px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        page-break-inside: avoid;
      }
      table, th, td {
        border: 1px solid #000;
      }
      th, td {
        padding: 8px;
        text-align: center;
        vertical-align: middle;
      }
      caption {
        font-weight: bold;
        margin-bottom: 10px;
        caption-side: top;
      }
      .date {
        text-align: right;
        margin-top: 10px;
        font-size: 14px;
      }
      .page-break {
        page-break-before: always;
      }
      @page {
        size: A4;
        margin: 2cm;
      }
      /* 添加适合打印的样式 */
      @media print {
        body {
          font-size: 12pt;
        }
        h1 {
          font-size: 18pt;
        }
        h2 {
          font-size: 16pt;
        }
        table {
          font-size: 10pt;
        }
      }
    </style>
  </head>
  <body>
    <div class="date">2024/7/11</div>
    
    <div class="header">
      <div class="logo">
        <div style="width: 100px; height: 100px; border-radius: 50%; border: 2px solid #9e2b2b; display: flex; justify-content: center; align-items: center; margin-right: 20px;">
          <div style="color: #9e2b2b; font-weight: bold; font-size: 28px;">JXNU</div>
        </div>
        <div style="font-size: 36px; font-weight: bold; font-family: 'KaiTi', '楷体', cursive;">
          江西师范大学<br>
          <span style="font-size: 20px;">JIANGXI NORMAL UNIVERSITY</span>
        </div>
      </div>
    </div>
    
    <h1>${formData.courseTitle || '《功能高分子材料》课程目标达成情况评价报告'}</h1>
    
    <h2>一、课程简介</h2>
    <p>${formData.courseIntro || '功能高分子材料是材料化学学科中的一个重要分支，是我校材料化学专业本科生的专业选修课，是材料化学专业学生从事本专业所具备的基础理论知识和发展前沿知识，是培养高分子材料人才的专业基础技术课程之一。本课程的任务是使学生认真学习和掌握功能高分子材料的分子结构与性能之间的关系、制备方法、了解功能高分子材料应用的基本原理及研究方法，从而对功能高分子材料科学有一个比较全面的了解，为合理应用功能高分子材料和研究开发功能高分子材料打下良好的基础。本课程主要涉及功能高分子材料的基本概念、基本原理，阐述功能高分子材料的结构与性能之间的关系，同时对功能高分子材料的发展也有简明扼要的介绍。通过本课程的学习，使学生掌握具有重要应用价值的功能高分子材料品种，如离子交换树脂、吸附树脂、高分子分离膜、液晶高分子、电功能高分子、高分子纳米复合材料、生物降解高分子材料等。同时了解一些新的功能高分子材料如高分子催化剂、形状记忆高分子、智能型高分子凝胶、功能高分子材料的前沿发展动态和研究方向。'}</p>
    
    <h2>二、课程目标</h2>
    <p>通过本课程的教学，学生应该具备如下知识和能力：</p>
    <p>目标1：${formData.target1 || '通过本课程的学习，学生掌握和了解功能高分子材料的基本概念和结构与性能的关系等。'}</p>
    <p>目标2：${formData.target2 || '通过本课程的学习，使学生了解高分子材料的合成与应用，能灵活使用所学的专业基础知识。'}</p>
    <p>目标3：${formData.target3 || '学生将所学知识与现代科技发展紧密联系结合，将技术更好地服务于社会发展，包括材料新技术和新产品的开发研制、各种资源的综合利用、发展生产力的综合论证。'}</p>
    <p>目标4：${formData.target4 || '注重培养学生的创新思维能力，鼓励学生主动探索与思考，将理论知识应用于实践，培养学生的科学研究和创新能力，开拓视野，激发创新思维，培养解决问题的能力，为未来的科研、开发、应用奠定坚实的基础。'}</p>
    
    <!-- 第三部分：课程目标对毕业要求指标点的支撑关系 -->
    <h2>三、课程目标对毕业要求指标点的支撑关系</h2>
    <p>表1是依据江西师范大学材料化学专业人才培养方案和《功能高分子材料》课程大纲得到的课程目标对毕业要求各指标点的对应支撑关系矩阵。</p>
    
    <table>
      <caption>表1.课程目标对毕业要求指标点的支撑矩阵</caption>
      <tr>
        <th></th>
        <th>课程目标1</th>
        <th>课程目标2</th>
        <th>课程目标3</th>
        <th>课程目标4</th>
      </tr>
      ${generateTableContent('targetMatrix')}
    </table>
    
    <!-- 第四部分：考核方式 -->
    <h2>四、课程目标与考核方式的对应权重关系</h2>
    <p>本课程目标达成度评价采用直接评价方式进行。直接评价采用"考核成绩分析法"，数据源自抽取样本学生的课程考核成绩，对应的支撑材料为课堂表现、课后作业、线上作业、期末考试等成绩，其对应的各个课程目标考核方式与权重关系见表2。</p>
    
    <table>
      <caption>表2.课程考核方式对课程目标的权重关系矩阵</caption>
      <tr>
        <th>考核方式</th>
        <th>满分</th>
        <th colspan="4">权重</th>
      </tr>
      <tr>
        <th></th>
        <th></th>
        <th>课程目标1</th>
        <th>课程目标2</th>
        <th>课程目标3</th>
        <th>课程目标4</th>
      </tr>
      ${generateTableContent('assessmentMatrix')}
    </table>
    
    <table>
      <caption>表4.课程考核方式对应的考核成绩情况</caption>
      <tr>
        <th></th>
        <th>课堂表现</th>
        <th>课后作业</th>
        <th>线上作业</th>
        <th>期末考试</th>
      </tr>
      ${generateTableContent('assessmentResults')}
    </table>
    
    <!-- 第五部分：达成度评价 -->
    <h2>五、课程目标达成度评价</h2>
    
    <table>
      <caption>表5.课程分目标的达成度</caption>
      <tr>
        <th></th>
        <th>课程目标1</th>
        <th>课程目标2</th>
        <th>课程目标3</th>
        <th>课程目标4</th>
      </tr>
      ${generateTableContent('targetAchievement')}
    </table>
    
    <h3>(三) 课程目标的总达成度</h3>
    <p>课程的整体目标达成度由该课程所有的课程分目标达成度的加权平均值确定。设本课程有n个课程目标，利用公式 (1) 计算得到的第i课程目标的权重值为 wi ，利用公式 (2) 计算得到的第i个课程分目标的达成度为 Pi ，则该门课程的整体目标达成度 P 为：</p>
    
    <table>
      <tr>
        <th>课程目标1</th>
        <th>课程目标2</th>
        <th>课程目标3</th>
        <th>课程目标4</th>
        <th>课程目标总达成度</th>
      </tr>
      <tr>
        <td>0.278</td>
        <td>0.278</td>
        <td>0.222</td>
        <td>0.222</td>
        <td>${formData.overallAchievement || '0.800'}</td>
      </tr>
    </table>
    
    <!-- 第六部分：分析与改进 -->
    <h2>六、课程目标达成情况评价分析与持续改进</h2>
    
    <table>
      <tr>
        <th>课程名称</th>
        <td>功能高分子材料</td>
        <th>课程类别</th>
        <td>专业选修</td>
        <th>学时</th>
        <td>32</td>
        <th>学分</th>
        <td>2</td>
      </tr>
      <tr>
        <th>任课教师</th>
        <td>${formData.teacherName || ''}</td>
        <th>教师职称</th>
        <td>${formData.teacherTitle || ''}</td>
        <th>授课时间</th>
        <td>${formData.semester || '23-24学年第二学期'}</td>
      </tr>
      <tr>
        <th>授课班级</th>
        <td>${formData.className || ''}</td>
        <th>学生人数</th>
        <td>${formData.studentCount || ''}</td>
        <th>期末考核方式</th>
        <td>考试改革（开卷考试）</td>
      </tr>
    </table>
    
    <table>
      <tr>
        <th rowspan="10">课程目标达成情况分析</th>
        <td>${formData.achievementAnalysis || '从期末测试来看最高分92分，90分以上2人，占比15.38%，80分以上8人占比61.5%，最低分63分，平均分为82.31分。课程总达成度为0.80，表明同学们较好地掌握功能高分子材料的基本理论知识，能较好地将所学知识应用到生活实践中，对功能高分子材料的发展前沿知识有初步的了解。分析各个目标达成度，还发现课程目标1达成度为0.809，表明通过授课学生们学习了解了功能高分子材料的基本知识和原理，结构和性能的关系。目标2达成度的达成度0.809，也表明了同学们掌握了功能高分子材料的制备方法以及应用。目标3的达成为0.79，说明同学们能较好地查阅相关文献，获取功能高分子材料最新研究进展。目标4的达成度为0.79，该达成度偏低表明同学们的创新思维能力和主动学习、思考能力方面仍待进一步提高。'}</td>
      </tr>
    </table>
    
    <table>
      <tr>
        <th rowspan="8">持续改进措施</th>
        <td>${formData.improvementMeasures || '及时总结归纳所存在的问题，确保教学工作有计划，有组织，有步骤开展。存在不足分析：学习态度方面，部分学生学习态度不端正，上课低头玩手机，布置的作业应付了事；学习情况方面，由于学生先学习了高分子化学，具有了一定的知识和经验，具有了一定的自主学习能力和探究能力，合作意识较好；学生层次方面，有少数学生上课认真，能很快地掌握和消化所教知识和理论，也有少数学生上课做其他事情，对课程学习敷衍。持续改进的措施，教学方法上：应用新的教育理念，新理论，让学生在"做中学，学中会"，上课多采用新颖数字化教学方法，如雨课堂等。通过布置小组合作学习任务，课上引导，有效利用教学资源，主富教学方法，提高学生的学习兴趣。通过课前自学、课上引导、自主探究、合作交流等形式获取新知识，激发和培养学生自主学习、探究精神和合作意识。'}</td>
      </tr>
    </table>
    
    <table>
      <tr>
        <th rowspan="3">教研室主任或系主任意见</th>
        <td style="height: 100px; vertical-align: top;"></td>
      </tr>
      <tr>
        <td style="text-align: right;">教研室主任/系主任签名：</td>
      </tr>
      <tr>
        <td style="text-align: right;">日期：</td>
      </tr>
    </table>
    
    <table>
      <tr>
        <th rowspan="3">学院审核意见</th>
        <td style="height: 100px; vertical-align: top;"></td>
      </tr>
      <tr>
        <td style="text-align: right;">学院负责人签名：</td>
      </tr>
      <tr>
        <td style="text-align: right;">日期：</td>
      </tr>
    </table>
    
  </body>
  </html>
  `;
  
  return html;
}

// 生成表格内容的HTML
function generateTableContent(tableId) {
  // 找到当前表格对应的字段定义
  let tableField = null;
  for (const step of formSteps) {
    for (const field of step.fields) {
      if (field.id === tableId) {
        tableField = field;
        break;
      }
    }
    if (tableField) break;
  }
  
  if (!tableField) {
    console.error(`找不到表格字段定义: ${tableId}`);
    return '';
  }
  
  // 如果没有表格数据，创建一个默认的空表格
  if (!formData[tableId] || !Array.isArray(formData[tableId]) || formData[tableId].length === 0) {
    console.log(`为表格 ${tableId} 创建默认内容`);
    
    let html = '';
    const rows = tableField.rows || [];
    
    rows.forEach((rowTitle, rowIndex) => {
      html += '<tr>';
      html += `<th>${rowTitle}</th>`;
      
      // 为每一列添加一个空的单元格
      const columns = tableField.columns || [];
      columns.forEach(() => {
        html += '<td></td>';
      });
      
      html += '</tr>';
    });
    
    return html;
  }
  
  // 使用已有的表格数据生成HTML
  console.log(`为表格 ${tableId} 生成内容，数据行数: ${formData[tableId].length}`);
  
  let html = '';
  formData[tableId].forEach((row, rowIndex) => {
    if (rowIndex >= (tableField.rows || []).length) {
      console.log(`跳过超出行索引的数据: ${rowIndex}`);
      return;
    }
    
    html += '<tr>';
    
    // 添加行标题
    if (tableField && tableField.rows && tableField.rows[rowIndex]) {
      html += `<th>${tableField.rows[rowIndex]}</th>`;
    } else {
      html += '<th></th>';
    }
    
    // 添加单元格数据
    if (Array.isArray(row)) {
      row.forEach((cell, cellIndex) => {
        if (cellIndex >= (tableField.columns || []).length) {
          return;
        }
        html += `<td>${cell || ''}</td>`;
      });
      
      // 如果数据列数不足，填充空单元格
      const columnsNeeded = (tableField.columns || []).length;
      const columnsHave = row.length;
      for (let i = columnsHave; i < columnsNeeded; i++) {
        html += '<td></td>';
      }
    } else {
      // 如果行数据不是数组，为所有列创建空单元格
      const columnsNeeded = (tableField.columns || []).length;
      for (let i = 0; i < columnsNeeded; i++) {
        html += '<td></td>';
      }
    }
    
    html += '</tr>';
  });
  
  // 检查是否所有行都已生成，如果不是，添加缺少的行
  const totalRows = (tableField.rows || []).length;
  const generatedRows = formData[tableId].length;
  
  if (generatedRows < totalRows) {
    console.log(`为表格 ${tableId} 添加缺少的 ${totalRows - generatedRows} 行`);
    
    for (let i = generatedRows; i < totalRows; i++) {
      html += '<tr>';
      
      // 添加行标题
      if (tableField && tableField.rows && tableField.rows[i]) {
        html += `<th>${tableField.rows[i]}</th>`;
      } else {
        html += '<th></th>';
      }
      
      // 添加空单元格
      const columnsNeeded = (tableField.columns || []).length;
      for (let j = 0; j < columnsNeeded; j++) {
        html += '<td></td>';
      }
      
      html += '</tr>';
    }
  }
  
  return html;
}

// 生成PDF预览
async function generatePreview() {
  try {
    // 显示加载指示器
    showNotification('正在生成PDF预览，请稍候...', '预览', 'info');
    
    // 生成HTML内容
    const htmlContent = generateFormHtml();
    console.log('生成的HTML长度：', htmlContent.length);
    
    // 确认HTML内容不为空
    if (!htmlContent || htmlContent.length < 100) {
      throw new Error('生成的HTML内容无效或过短');
    }
    
    // 调用主进程生成PDF
    console.log('正在调用主进程生成PDF...');
    const result = await ipcRenderer.invoke('generate-preview', htmlContent);
    
    if (result.success) {
      console.log('预览PDF生成成功，数据大小：', result.pdf ? result.pdf.length : 0);
      // 在iframe中显示PDF
      const pdfPreview = document.getElementById('pdf-preview');
      
      if (result.pdf && result.pdf.length > 0) {
        pdfPreview.src = `data:application/pdf;base64,${result.pdf}`;
        showNotification('PDF预览已生成', '预览成功', 'success');
      } else {
        throw new Error('服务器返回的PDF数据为空');
      }
    } else {
      showNotification(`生成预览失败: ${result.error}`, '预览错误', 'error');
    }
  } catch (error) {
    console.error('生成预览时出错：', error);
    showNotification(`生成预览时发生错误: ${error.message}`, '预览错误', 'error');
  }
}

// 导出PDF
async function exportPDF() {
  try {
    // 显示加载指示器
    showNotification('正在准备导出PDF，请稍候...', '导出', 'info');
    
    // 生成HTML内容
    const htmlContent = generateFormHtml();
    console.log('导出的HTML长度：', htmlContent.length);
    
    // 确认HTML内容不为空
    if (!htmlContent || htmlContent.length < 100) {
      throw new Error('生成的HTML内容无效或过短');
    }
    
    // 调用主进程导出PDF
    console.log('正在调用主进程导出PDF...');
    const result = await ipcRenderer.invoke('export-pdf', htmlContent);
    
    if (result.success) {
      console.log('PDF导出成功，路径：', result.filePath);
      showNotification(`PDF已成功导出到: ${result.filePath}`, '导出成功', 'success');
    } else {
      console.warn('导出PDF失败：', result.error);
      showNotification(`导出PDF失败: ${result.error}`, '导出失败', 'error');
      
      // 如果错误信息包含"已打开HTML文件"，提示用户
      if (result.error && result.error.includes('已打开HTML文件')) {
        showNotification('已在浏览器中打开HTML文件，请使用浏览器的打印功能(Ctrl+P)将文件保存为PDF', '请手动打印', 'warning');
      }
    }
  } catch (error) {
    console.error('导出PDF时出错：', error);
    showNotification(`导出PDF时发生错误: ${error.message}`, '导出错误', 'error');
  }
}