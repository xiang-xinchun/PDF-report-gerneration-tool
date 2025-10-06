// 辅助函数：解析权重值，支持百分比和小数格式
function parseWeight(value) {
    if (!value) return 0;
    
    const str = value.toString().trim();
    
    // 处理百分比格式
    if (str.includes('%')) {
        const numStr = str.replace('%', '');
        const num = parseFloat(numStr);
        if (isNaN(num)) return 0;
        return num > 1 ? num / 100 : num / 100;
    }
    
    // 处理纯数字格式
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    return num > 1 ? num / 100 : num;
}

// 辅助函数：安全解析数值
function safeParseFloat(value) {
    if (!value) return 0;
    
    const invalidChars = /[^\d.-]/g;
    if (invalidChars.test(value.toString())) {
        return 0;
    }
    
    const parsed = parseFloat(value.toString());
    if (isNaN(parsed)) {
        return 0;
    }
    
    return parsed;
}

// 辅助函数：显示计算通知
function showCalculationNotice(message, isError = false, forcePopup = false) {
    console.log(`${isError ? '错误' : '信息'}: ${message}`);
    if (isError || forcePopup) {
        if (window.showNotification) {
            window.showNotification({
                title: isError ? '计算错误' : '计算提示',
                message: message,
                type: isError ? 'error' : 'info'
            });
        }
    }
}

// 检查表1数据是否完整
function checkTable1Data() {
    const tableRows = document.querySelectorAll('table tbody tr[id^="table-row-"]');
    if (tableRows.length === 0) return false;
    
    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        const cells = row.querySelectorAll('td');
        for (let cell of cells) {
            const inputBox = cell.querySelector('.input-box');
            const content = inputBox ? inputBox.textContent.trim() : cell.textContent.trim();
            if (content && ['H', 'h', 'M', 'm', 'L', 'l'].some(c => content.includes(c))) {
                return true;
            }
        }
    }
    return false;
}

// 检查表2数据是否完整
function checkTable2Data() {
    let hasValidData = true;
    for (let i = 1; i <= 4; i++) {
        const scoreElement = document.getElementById(`score${i}`);
        if (scoreElement) {
            const score = safeParseFloat(scoreElement.textContent || scoreElement.value || '0');
            if (score <= 0) {
                hasValidData = false;
                break;
            }
        }
        
        for (let j = 1; j <= 4; j++) {
            const weightElement = document.getElementById(`weight${i}-${j}`);
            if (weightElement) {
                const weight = parseWeight(weightElement.textContent || weightElement.value || '0');
                if (weight <= 0) {
                    hasValidData = false;
                    break;
                }
            }
        }
        if (!hasValidData) break;
    }
    return hasValidData;
}

// 检查表4数据是否完整
function checkTable4Data() {
    let hasValidData = true;
    for (let i = 1; i <= 4; i++) {
        const totalScoreElement = document.getElementById(`totalScore${i}`);
        const avgScoreElement = document.getElementById(`avgScore${i}`);
        
        if (!totalScoreElement || !avgScoreElement) {
            hasValidData = false;
            continue;
        }
        
        const totalScore = safeParseFloat(totalScoreElement.textContent || totalScoreElement.value || '0');
        const avgScore = safeParseFloat(avgScoreElement.textContent || avgScoreElement.value || '0');
        
        if (totalScore <= 0 || avgScore <= 0) {
            hasValidData = false;
            break;
        }
    }
    return hasValidData;
}

// 检查是否所有必要数据都已输入
function checkAllRequiredData() {
    return checkTable1Data() && checkTable2Data() && checkTable4Data();
}

// 防抖函数，减少频繁计算
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 课程目标权重计算
function calculateTargetWeights() {
    if (!checkTable1Data()) {
        return [];
    }
    
    const targetStrengthValues = [];
    let hasValidData = false;
    
    try {
        for (let i = 1; i <= 4; i++) {
            let strengthValue = 0;
            let hCount = 0;
            let mCount = 0;
            let lCount = 0;
            
            const tableRows = document.querySelectorAll('table tbody tr[id^="table-row-"]');
            
            for (let j = 0; j < tableRows.length; j++) {
                const row = tableRows[j];
                const cells = row.querySelectorAll('td');
                
                const hasCategory = cells.length > 0 && cells[0].classList.contains('category');
                let cellIndex = hasCategory ? i + 1 : i;
                
                if (cellIndex >= 0 && cells.length > cellIndex) {
                    const cell = cells[cellIndex];
                    let cellContent = '';
                    
                    const inputBox = cell.querySelector('.input-box');
                    if (inputBox) {
                        cellContent = inputBox.textContent.trim();
                    } else {
                        cellContent = cell.textContent.trim();
                    }
                    
                    if (cellContent === 'H' || cellContent === 'h' || cellContent.includes('H') || cellContent.includes('h')) {
                        hCount++;
                    } else if (cellContent === 'M' || cellContent === 'm' || cellContent.includes('M') || cellContent.includes('m')) {
                        mCount++;
                    } else if (cellContent === 'L' || cellContent === 'l' || cellContent.includes('L') || cellContent.includes('l')) {
                        lCount++;
                    }
                }
            }
            
            strengthValue = 3 * hCount + 2 * mCount + 1 * lCount;
            
            // 如果在表1中没有找到有效的支撑强度，尝试读取直接输入的支撑强度值
            if (strengthValue === 0) {
                const hCountElement = document.getElementById(`targetHCount${i}`);
                const mCountElement = document.getElementById(`targetMCount${i}`);
                const lCountElement = document.getElementById(`targetLCount${i}`);
                
                if (hCountElement) {
                    const hValue = safeParseFloat(hCountElement.textContent);
                    strengthValue += 3 * hValue;
                }
                
                if (mCountElement) {
                    const mValue = safeParseFloat(mCountElement.textContent);
                    strengthValue += 2 * mValue;
                }
                
                if (lCountElement) {
                    const lValue = safeParseFloat(lCountElement.textContent);
                    strengthValue += 1 * lValue;
                }
                
                if (strengthValue === 0) {
                    const directStrengthElement = document.getElementById(`targetStrength${i}`);
                    if (directStrengthElement) {
                        const directStrength = safeParseFloat(directStrengthElement.textContent);
                        strengthValue = directStrength;
                    }
                }
            }
            
            if (strengthValue > 0) {
                hasValidData = true;
            }
            
            targetStrengthValues.push(strengthValue);
        }
        
        if (!hasValidData) {
            return [];
        }
    } catch (error) {
        showCalculationNotice('计算支撑强度时出错: ' + error.message, true);
        return [];
    }
    
    const totalStrength = targetStrengthValues.reduce((sum, value) => sum + value, 0);
    
    if (totalStrength <= 0) {
        return [];
    }
    
    const weights = targetStrengthValues.map(value => totalStrength > 0 ? value / totalStrength : 0);
    
    try {
        for (let i = 0; i < weights.length; i++) {
            const weightElement = document.getElementById(`targetWeight${i+1}`);
            if (weightElement) {
                const weightValue = weights[i].toFixed(3);
                weightElement.textContent = weightValue;
                
                const showWeightElement = document.getElementById(`showWeight${i+1}`);
                if (showWeightElement) {
                    showWeightElement.textContent = weightValue;
                }
            }
        }
        
        const totalWeightElement = document.getElementById('totalWeight');
        if (totalWeightElement) {
            totalWeightElement.textContent = totalStrength.toString();
        }
        
        showCalculationNotice('权重计算完成');
    } catch (error) {
        showCalculationNotice('更新权重表格时出错: ' + error.message, true);
    }
    
    return weights;
}

// 课程分目标达成度计算
function calculateTargetAchievements() {
    if (!checkTable2Data() || !checkTable4Data()) {
        return [];
    }
    
    const examData = [];
    let hasValidData = false;
    
    try {
        for (let i = 1; i <= 4; i++) {
            const totalScoreElement = document.getElementById(`totalScore${i}`);
            const avgScoreElement = document.getElementById(`avgScore${i}`);
            
            if (totalScoreElement && avgScoreElement) {
                const totalScore = safeParseFloat(totalScoreElement.textContent || totalScoreElement.value || '0');
                const avgScore = safeParseFloat(avgScoreElement.textContent || avgScoreElement.value || '0');
                
                if (totalScore > 0) {
                    hasValidData = true;
                }
                
                examData.push({
                    totalScore: totalScore,
                    avgScore: avgScore,
                    name: `考核方式${i}`
                });
            } else {
                examData.push({
                    totalScore: 0,
                    avgScore: 0,
                    name: `考核方式${i}`
                });
            }
        }
        
        if (!hasValidData) {
            return [];
        }
    } catch (error) {
        showCalculationNotice('读取考核数据时出错: ' + error.message, true);
        return [];
    }
    
    const achievements = [];
    let hasValidWeight = false;
    
    try {
        for (let targetIndex = 1; targetIndex <= 4; targetIndex++) {
            let targetAchievement = 0;
            let hasWeightForThisTarget = false;
            
            for (let methodIndex = 1; methodIndex <= 4; methodIndex++) {
                const weightElement = document.getElementById(`weight${methodIndex}-${targetIndex}`);
                if (weightElement) {
                    let weightText = (weightElement.textContent || weightElement.value || '0').trim();
                    let weight = parseWeight(weightText);
                    
                    if (weight > 0) {
                        hasValidWeight = true;
                        hasWeightForThisTarget = true;
                        
                        const examInfo = examData[methodIndex - 1];
                        if (examInfo && examInfo.totalScore > 0) {
                            const contribution = weight * (examInfo.avgScore / examInfo.totalScore);
                            targetAchievement += contribution;
                        }
                    }
                }
            }
            
            if (!hasWeightForThisTarget) {
                // 不显示警告，因为可能有些目标确实没有权重
            }
            
            achievements.push(targetAchievement);
            
            const achievementElement = document.getElementById(`targetAchieve${targetIndex}`);
            if (achievementElement) {
                const achievementValue = targetAchievement.toFixed(3);
                if (achievementElement.tagName.toLowerCase() === 'input') {
                    achievementElement.value = achievementValue;
                } else {
                    achievementElement.textContent = achievementValue;
                }
                
                const showAchieveElement = document.getElementById(`showAchieve${targetIndex}`);
                if (showAchieveElement) {
                    if (showAchieveElement.tagName.toLowerCase() === 'input') {
                        showAchieveElement.value = achievementValue;
                    } else {
                        showAchieveElement.textContent = achievementValue;
                    }
                }
            }
        }
        
        if (!hasValidWeight) {
            return [];
        }
        
        showCalculationNotice('达成度计算完成');
    } catch (error) {
        showCalculationNotice('计算达成度时出错: ' + error.message, true);
        return [];
    }
    
    return achievements;
}

// 课程总达成度计算
function calculateTotalAchievement() {
    if (!checkTable1Data() || !checkTable2Data() || !checkTable4Data()) {
        return 0;
    }
    
    const weights = [];
    const achievements = [];
    let hasValidData = false;
    
    try {
        for (let i = 1; i <= 4; i++) {
            const weightElement = document.getElementById(`showWeight${i}`);
            const achievementElement = document.getElementById(`showAchieve${i}`);
            
            if (weightElement && achievementElement) {
                const weight = safeParseFloat(weightElement.textContent || weightElement.value || '0');
                const achievement = safeParseFloat(achievementElement.textContent || achievementElement.value || '0');
                
                if (weight > 0 && achievement >= 0) {
                    hasValidData = true;
                }
                
                weights.push(weight);
                achievements.push(achievement);
            } else {
                weights.push(0);
                achievements.push(0);
            }
        }
        
        if (!hasValidData) {
            const totalAchieveElement = document.getElementById('totalAchieve');
            if (totalAchieveElement) {
                if (totalAchieveElement.tagName.toLowerCase() === 'input') {
                    totalAchieveElement.value = '0.00';
                } else {
                    totalAchieveElement.textContent = '0.00';
                }
            }
            return 0;
        }
    } catch (error) {
        showCalculationNotice('读取权重和达成度数据时出错: ' + error.message, true);
        return 0;
    }
    
    let totalAchievement = 0;
    for (let i = 0; i < weights.length; i++) {
        totalAchievement += weights[i] * achievements[i];
    }
    
    try {
        const totalAchieveElement = document.getElementById('totalAchieve');
        if (totalAchieveElement) {
            const finalValue = totalAchievement.toFixed(3);
            if (totalAchieveElement.tagName.toLowerCase() === 'input') {
                totalAchieveElement.value = finalValue;
            } else {
                totalAchieveElement.textContent = finalValue;
            }
        }
        
        showCalculationNotice(`总达成度计算完成: ${totalAchievement.toFixed(3)}`);
    } catch (error) {
        showCalculationNotice('更新总达成度时出错: ' + error.message, true);
    }
    
    return totalAchievement;
}

// 智能计算函数，根据数据完整性决定计算哪些内容
function smartCalculate() {
    const table1Complete = checkTable1Data();
    const table2Complete = checkTable2Data();
    const table4Complete = checkTable4Data();
    
    console.log(`数据状态: 表1=${table1Complete}, 表2=${table2Complete}, 表4=${table4Complete}`);
    
    // 表1完成就计算权重
    if (table1Complete) {
        calculateTargetWeights();
    }
    
    // 表2和表4完成就计算达成度
    if (table2Complete && table4Complete) {
        calculateTargetAchievements();
    }
    
    // 所有表都完成就计算总达成度
    if (table1Complete && table2Complete && table4Complete) {
        calculateTotalAchievement();
    }
}

// 绑定计算事件（使用防抖）
function setupCalculationEvents() {
    const debouncedCalculate = debounce(smartCalculate, 300);
    
    document.addEventListener('input', function(event) {
        const target = event.target;
        if (!target) return;
        
        // 检查是否在可编辑元素中
        const isEditable = target.isContentEditable || 
                          target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' ||
                          (target.classList && target.classList.contains('input-box'));
        
        if (isEditable) {
            debouncedCalculate();
        }
    });
    
    // 专门绑定表2和表4的事件监听
    bindTable2And4Events();
}

// 专门绑定表2和表4的事件监听
function bindTable2And4Events() {
    const debouncedCalculate = debounce(smartCalculate, 300);
    
    // 绑定表2（考核方式权重）的所有输入框
    for (let i = 1; i <= 4; i++) {
        const scoreElement = document.getElementById(`score${i}`);
        if (scoreElement) {
            scoreElement.addEventListener('input', debouncedCalculate);
        }
        
        for (let j = 1; j <= 4; j++) {
            const weightElement = document.getElementById(`weight${i}-${j}`);
            if (weightElement) {
                weightElement.addEventListener('input', debouncedCalculate);
            }
        }
    }
    
    // 绑定表4（考核成绩）的所有输入框
    for (let i = 1; i <= 4; i++) {
        const totalScoreElement = document.getElementById(`totalScore${i}`);
        if (totalScoreElement) {
            totalScoreElement.addEventListener('input', debouncedCalculate);
        }
        
        const avgScoreElement = document.getElementById(`avgScore${i}`);
        if (avgScoreElement) {
            avgScoreElement.addEventListener('input', debouncedCalculate);
        }
    }
    
    // 为表2和表4中的所有input-box添加事件监听
    const table2And4InputBoxes = document.querySelectorAll('#exam-row-1 .input-box, #exam-row-2 .input-box, #exam-row-3 .input-box, #exam-row-4 .input-box, #score-row-1 .input-box, #score-row-2 .input-box');
    table2And4InputBoxes.forEach(function(inputBox) {
        inputBox.addEventListener('input', debouncedCalculate);
    });
}

// 初始化计算模块
function initCalculationModule() {
    console.log('初始化计算模块...');
    
    function clearAllInputs() {
        const editableDivs = document.querySelectorAll('div[contenteditable="true"]');
        editableDivs.forEach(div => {
            div.textContent = '';
        });
        
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });
        
        const contentElements = document.querySelectorAll(
            '#studentCount, #maxScoreShow, #minScoreShow, #avgTotalScoreShow, ' +
            '[id^="count"], [id^="rate"], [id^="targetWeight"], [id^="targetAchieve"]'
        );
        contentElements.forEach(el => {
            el.textContent = '';
        });
    }
    
    try {
        clearAllInputs();
        localStorage.clear();
        sessionStorage.clear();
        
        setupCalculationEvents();
        console.log('计算功能已启用：智能计算模式，根据数据完整性自动计算相应结果');
        
        console.log('计算模块初始化完成');
    } catch (error) {
        console.error('计算模块初始化失败:', error);
        showCalculationNotice('计算模块初始化失败: ' + error.message, true);
    }
}

// 初始化模块
initCalculationModule();
