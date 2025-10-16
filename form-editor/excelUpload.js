// 在页面加载完成后应用样式
document.addEventListener('DOMContentLoaded', function() {
    const addEvalBtn = document.querySelector('.add-evaluation-button');
    const removeEvalBtn = document.querySelector('.remove-evaluation-button');
    
    if (addEvalBtn) {
        addEvalBtn.style.cssText = `
            padding: 6px 12px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
            margin: 0 5px;
        `;
    }
    
    if (removeEvalBtn) {
        removeEvalBtn.style.cssText = `
            padding: 6px 12px;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
            margin: 0 5px;
        `;
    }

    // 初始化数量显示
    updateEvaluationCount();
    // 为现有行设置输入监听
    const existingRows = document.querySelectorAll('#table2-container tbody tr');
    existingRows.forEach(row => {
        addInputListeners(row);
    });
    syncEvaluationHeaders();
});
// 更新考核方式数量显示的函数
function updateEvaluationCount() {
    const table = document.querySelector('#table2-container table tbody');
    const currentCount = table.rows.length;
    const countLabel = document.getElementById('evaluation-count-label');
    
    if (countLabel) {
        countLabel.textContent = `当前考核方式数量: ${currentCount}`;
    }
}
function getCurrentGoalCount() {
    const countLabel = document.getElementById('goal-count-label');
    if (countLabel) {
        // 从文本中提取数字，例如："当前目标数量: 4" -> 4
        const match = countLabel.textContent.match(/\d+/);
        return match ? parseInt(match[0]) : 4;
    }
    return 4; // 默认值
}
function getCurrentEvaluationCount() {
    const countLabel = document.getElementById('evaluation-count-label');
    if (countLabel) {
        // 从文本中提取数字，例如："当前考核方式数量: 3" -> 3
        const match = countLabel.textContent.match(/\d+/);
        return match ? parseInt(match[0]) : 1;
    }
    return 1; // 默认值
}
function addExamRow() {
    const table = document.querySelector('#table2-container table tbody');
    const rowCount = table.rows.length + 1;
    const goalCount = getCurrentGoalCount();

    // 创建新行
    const newRow = table.insertRow();
    newRow.id = `exam-row-${rowCount}`;
    
    // 创建考核方式单元格
    const evalCell = newRow.insertCell();
    evalCell.innerHTML = `<div contenteditable="true" class="input-box" id="evaluation${rowCount}"></div>`;
    
    // 创建满分单元格
    const scoreCell = newRow.insertCell();
    scoreCell.innerHTML = `<div contenteditable="true" class="input-box" id="score${rowCount}"></div>`;
    
    // 创建权重单元格（4个课程目标）
    for (let i = 1; i <= goalCount; i++) {
        const weightCell = newRow.insertCell();
        weightCell.innerHTML = `<div contenteditable="true" class="input-box" id="weight${rowCount}-${i}"></div>`;
    }
    
    // 更新数量显示
    updateEvaluationCount();
    // 添加输入事件监听
    addInputListeners(newRow);
    // 同步表头
    syncEvaluationHeaders();
}

// 删除考核方式的最后一行
function deleteLastRow() {
    const table = document.querySelector('#table2-container table tbody');
    if (table.rows.length <= 1) {
        alert("至少需要保留一行考核方式");
        return;
    }
    table.deleteRow(table.rows.length - 1);

    // 更新数量显示
    updateEvaluationCount();
    syncEvaluationHeaders();
}
// 同步表头显示 - 动态创建列
function syncEvaluationHeaders() {
    const evaluationCount = document.querySelectorAll('#table2-container tbody tr').length;
    const table4 = document.querySelector('#table4-container table');
    
    // 清空表4的表头（保留第一个空列）
    const theadRow = table4.querySelector('thead tr');
    theadRow.innerHTML = '<th></th>';
    
    // 清空表4的数据行（保留第一列的标题）
    const totalScoreRow = table4.querySelector('#score-row-1');
    const avgScoreRow = table4.querySelector('#score-row-2');
    if (totalScoreRow.children.length === 0) {
        totalScoreRow.innerHTML = '<td>总分</td>';
    }
    if (avgScoreRow.children.length === 0) {
        avgScoreRow.innerHTML = '<td>平均分</td>';
    }

    // 收集有效的考核方式名称用于支撑材料
    const validEvaluations = [];
    
    // 根据表2的考核方式数量动态创建列
    for (let i = 1; i <= evaluationCount; i++) {
        const evaluationCell = document.getElementById(`evaluation${i}`);
        const scoreCell = document.getElementById(`score${i}`);
        
        if (evaluationCell && scoreCell) {
            const evaluationText = evaluationCell.textContent || '';
            const scoreText = scoreCell.textContent || '';

            // 收集考核方式名称
            if (evaluationText.trim()) {
                validEvaluations.push(evaluationText.trim());
            }
            
            // 创建表头列
            const headerTh = document.createElement('th');
            const headerDiv = document.createElement('div');
            headerDiv.id = `evaluationShow${i}`;
            headerDiv.textContent = `${evaluationText}`;
            headerTh.appendChild(headerDiv);
            theadRow.appendChild(headerTh);
            
            // 创建总分列
            let totalScoreTd = totalScoreRow.querySelector(`td:nth-child(${i + 1})`);
            if (!totalScoreTd) {
                totalScoreTd = document.createElement('td');
                totalScoreRow.appendChild(totalScoreTd);
            }
            let totalScoreDiv = document.getElementById(`totalScore${i}`);
            if (!totalScoreDiv) {
                totalScoreDiv = document.createElement('div');
                totalScoreDiv.id = `totalScore${i}`;
                totalScoreTd.appendChild(totalScoreDiv);
            }
            totalScoreDiv.textContent = scoreText;
            
            // 创建平均分列
            let avgScoreTd = avgScoreRow.querySelector(`td:nth-child(${i + 1})`);
            if (!avgScoreTd) {
                avgScoreTd = document.createElement('td');
                avgScoreRow.appendChild(avgScoreTd);
            }
            // 只更新平均分div，保留已填充的数据
            let avgScoreDiv = document.getElementById(`avgScore${i}`);
            if (!avgScoreDiv) {
                avgScoreDiv = document.createElement('div');
                avgScoreDiv.id = `avgScore${i}`;
                avgScoreTd.appendChild(avgScoreDiv);
            }
        }
    }
    // 同步支撑材料
    const supportMaterialElem = document.getElementById('supportMaterial');
    if (supportMaterialElem) {
        const supportText = validEvaluations.join('、');
        supportMaterialElem.textContent = supportText;
    }
}
// 为表格行添加输入事件监听
function addInputListeners(row) {
    const inputs = row.querySelectorAll('.input-box');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // 当考核方式或分数变化时，重新同步表头
            syncEvaluationHeaders();
        });
    });
}

// 初始化 Excel 上传功能
function initExcelUpload() {
    // 获取页面上的上传按钮
    const excelUploadBtn = document.getElementById('excel-upload-btn');
    if (!excelUploadBtn) {
        console.error('未找到上传按钮元素');
        return;
    }
    excelUploadBtn.addEventListener('click', showExcelExampleModal);
}

function showExcelExampleModal() {
    // 检查弹窗是否已存在，避免重复创建
    let modal = document.getElementById('excel-example-modal');
    if (modal) {
        modal.style.display = 'block';
        return;
    }

    // 动态创建弹窗DOM（遮罩层+内容区）
    modal = document.createElement('div');
    modal.id = 'excel-example-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 9999; display: flex;
        align-items: center; justify-content: center;
    `;

    // 弹窗内容区（包含示例图、说明文字、按钮）
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #fff; padding: 20px; border-radius: 8px;
        width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto;
        position: relative;
    `;

    // 示例图片
    const exampleImg = document.createElement('img');
    exampleImg.src = './gradeExample.png';  
    exampleImg.alt = 'Excel成绩表示例样式';
    exampleImg.style.cssText = `
        width: 100%; height: auto; border: 1px solid #eee;
        margin-bottom: 15px; border-radius: 4px;
    `;

    // 说明文字
    const descText = document.createElement('p');
    descText.textContent = '请确保上传的Excel文件符合以下格式：包含序号、学号、姓名、考核方式成绩及总成绩，示例如下：';
    descText.style.cssText = `
        margin: 0 0 15px 0; color: #333; line-height: 1.5;
        font-size: 17px; font-family: "Source Han Sans SC Black", "Arial Black", sans-serif; font-weight: bolder;
    `;

    // 按钮组（确认上传/取消）
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 20px;';

    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = `
        padding: 8px 16px; border: none; border-radius: 4px;
        background: #ddd; color: #fff; cursor: pointer;
    `;
    cancelBtn.addEventListener('click', () => modal.remove());

    // 确认上传按钮（点击后执行原上传逻辑）
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '上传';
    confirmBtn.style.cssText = `
        padding: 8px 16px; border: none; border-radius: 4px;
        background: #2196f3; color: #fff; cursor: pointer;
    `;
    confirmBtn.addEventListener('click', () => {
        modal.remove();
        triggerExcelUpload(); // 执行真正的文件上传
    });

    //组装弹窗DOM
    btnGroup.appendChild(cancelBtn);
    btnGroup.appendChild(confirmBtn);
    modalContent.appendChild(descText);
    modalContent.appendChild(exampleImg);
    modalContent.appendChild(btnGroup);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

async function triggerExcelUpload() {
    try {
        const evaluationCount = getCurrentEvaluationCount();
        // 2.1 调用Electron的文件选择对话框
        const result = await window.electronAPI.openExcelFile();
        if (result.canceled) return; // 用户取消选择

        const filePath = result.filePaths[0];
        if (!filePath) return;

        // 2.2 解析Excel文件（原逻辑不变）
        const parseResult = await window.electronAPI.parseExcelFile(filePath,evaluationCount);
        if (!parseResult.success) {
            showNotification({
                title: '解析失败',
                message: parseResult.message,
                type: 'error'
            });
            return;
        }

        // 2.3 填充数据到页面（原逻辑不变）
        const data = parseResult.data;
        fillDataToPage(data);
        
        // 2.4 显示成功提示
        showNotification({
            title: '上传成功',
            message: '成绩表已成功上传并填充到表格中',
            type: 'success'
        });

    } catch (error) {
        console.error('处理Excel文件出错:', error);
        showNotification({
            title: '操作失败',
            message: error.message || '处理Excel时发生错误',
            type: 'error'
        });
    }
}


// document.getElementById('excel-upload-btn').addEventListener('click', async () => {
//     try {
//         const result = await window.electronAPI.openExcelFile();
//         if (result.canceled) return;
//         const filePath = result.filePaths[0];
//         if (!filePath) return;
//         const parseResult = await window.electronAPI.parseExcelFile(filePath);
//         if (!parseResult.success) {
//             showNotification({
//                 title: '解析失败',
//                 message: parseResult.message,
//                 type: 'error'
//             });
//             return;
//         }
//         const data = parseResult.data;
//         fillDataToPage(data);

//     } catch (error) {
//         console.error('处理Excel文件出错:', error);
//         showNotification({
//             title: '操作失败',
//             message: error.message || '处理Excel时发生错误',
//             type: 'error'
//         });
//     }
// });

// 工具函数1：提取有效成绩数据（过滤标题+空行，只保留"总成绩"列）
function extractValidScores(excelData) {
    const validScores = [];
    // 遍历Excel行：跳过前4行标题（成绩表格式：前3行是课程信息，第4行是列名）
    for (let i = 4; i < excelData.length; i++) {
        const row = excelData[i];
        // 过滤空行（行长度<10，或无学号/姓名/总成绩）
        if (!row || row.length < 10) continue;
        const totalScore = Number(row[8]); // 总成绩在第9列（索引8，对应Excel的"I列"）
        // 过滤非数字成绩（有效成绩应为70-100的数字）
        if (!isNaN(totalScore) && totalScore >= 0) {
            validScores.push(totalScore);
        }
    }
    return validScores;
}

function fillDataToPage(data) {
    syncEvaluationHeaders();
    // 填充考核方式平均分
    if (data.assessmentAverages && Array.isArray(data.assessmentAverages)) {
        data.assessmentAverages.forEach((item, index) => {
            // 只处理前4个输入框
            if (index >= 4) return;
            const inputElement = document.getElementById(`avgScore${index + 1}`);
            // 确保item和average都存在且是数值
            if (inputElement && item && typeof item.average === 'number') {
                inputElement.textContent = item.average.toFixed(2); 
            } else if (inputElement) {
                inputElement.textContent = '0.00'; 
            }
        });
    }
    // 填充班级信息
    document.getElementById('studentCount').textContent = data.studentCount || '0';

    // 填充成绩分析
    const avgTotalScore = Number(data.avgTotalScore) || 0;
    document.getElementById('maxScoreShow').textContent = data.maxScore || '0';
    document.getElementById('minScoreShow').textContent = data.minScore || '0';
    document.getElementById('avgTotalScoreShow').textContent = avgTotalScore.toFixed(2);

    // 填充各分数段人数
    document.getElementById('count1Show').textContent = data.counts?.count1 || '0';
    document.getElementById('count2Show').textContent = data.counts?.count2 || '0';
    document.getElementById('count3Show').textContent = data.counts?.count3 || '0';
    document.getElementById('count4Show').textContent = data.counts?.count4 || '0';
    document.getElementById('count5Show').textContent = data.counts?.count5 || '0';

    // 填充百分比
    document.getElementById('rate1Show').textContent = data.rates?.rate1 || '0%';
    document.getElementById('rate2Show').textContent = data.rates?.rate2 || '0%';
    document.getElementById('rate3Show').textContent = data.rates?.rate3 || '0%';
    document.getElementById('rate4Show').textContent = data.rates?.rate4 || '0%';
    document.getElementById('rate5Show').textContent = data.rates?.rate5 || '0%';

    if (window.calculationModule && typeof window.calculationModule.smartCalculate === 'function') {
        window.calculationModule.smartCalculate();
    }
}

// 工具函数2：计算成绩统计指标
function calculateScoreStats(validScores) {
    const totalCount = validScores.length;
    const maxScore = Math.max(...validScores);
    const minScore = Math.min(...validScores);
    const totalSum = validScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalSum / totalCount;

    // 统计各分数段人数（匹配成绩表的70-79、80-89、90-99分段）
    const scoreRanges = [
        { range: '70-79分', count: validScores.filter(s => s >=70 && s <=79).length },
        { range: '80-89分', count: validScores.filter(s => s >=80 && s <=89).length },
        { range: '90-99分', count: validScores.filter(s => s >=90 && s <=99).length }
    ];

    return {
        totalCount,    // 总人数
        maxScore,      // 最高分
        minScore,      // 最低分
        averageScore,  // 平均分（未四舍五入）
        scoreRanges    // 分数段分布
    };
}

function showNotification(options) {
    const { title, message, type = 'info' } = options;
    if (window.showNotification && window.showNotification !== showNotification) {
        try {
            window.showNotification(options);
            return; 
        } catch (e) {
            console.error('自定义通知调用失败:', e);
        }
    }
    alert(`${title}（${type}）：${message}`);
    console.log(`${title}（${type}）：${message}`);
}

// 当 DOM 内容加载完成后初始化 Excel 上传功能
document.addEventListener('DOMContentLoaded', initExcelUpload);