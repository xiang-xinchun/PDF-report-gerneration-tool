/**
 * 课程目标达成度计算模块
 * 根据用户输入的数据自动计算权重、达成度和总达成度
 * 增强版：更强的验证和错误提示
 */

// 辅助函数：解析权重值，支持百分比和小数格式
function parseWeight(value) {
    if (!value) return 0;
    
    const str = value.toString().trim();
    
    // 处理百分比格式（如 "20%" 或 "0.2%"）
    if (str.includes('%')) {
        const numStr = str.replace('%', '');
        const num = parseFloat(numStr);
        if (isNaN(num)) return 0;
        
        // 如果是大于1的数，则除以100（如 20% -> 0.2）
        // 如果是小于等于1的数，则直接使用（如 0.2% -> 0.002）
        return num > 1 ? num / 100 : num / 100;
    }
    
    // 处理纯数字格式
    const num = parseFloat(str);
    if (isNaN(num)) return 0;
    
    // 如果是大于1的数字，假设是百分比形式（如 20 -> 0.2）
    // 如果是0-1之间的数字，假设已经是小数形式（如 0.2 -> 0.2）
    return num > 1 ? num / 100 : num;
}

// 辅助函数：安全解析数值
function safeParseFloat(value) {
    if (!value) return 0;
    
    // 检查是否包含非法字符
    const invalidChars = /[^\d.-]/g;
    if (invalidChars.test(value.toString())) {
        showCalculationNotice('输入包含非法字符，请仅输入数字: ' + value, true);
        return 0;
    }
    
    const parsed = parseFloat(value.toString());
    if (isNaN(parsed)) {
        showCalculationNotice('无法解析为数字: ' + value, true);
        return 0;
    }
    
    return parsed;
}

// 辅助函数：显示计算通知
function showCalculationNotice(message, isError = false) {
    if (window.showNotification) {
        window.showNotification({
            title: isError ? '计算错误' : '自动计算',
            message: message,
            type: isError ? 'error' : 'info'
        });
    } else if (window.showDebug) {
        window.showDebug(message);
    } else {
        console.log(message);
    }
}

// 辅助函数：验证输入数据
function validateInput(value, fieldName, minValue = null, maxValue = null) {
    const num = safeParseFloat(value);
    
    if (minValue !== null && num < minValue) {
        showCalculationNotice(`${fieldName} 值 ${num} 小于最小允许值 ${minValue}`, true);
        return false;
    }
    
    if (maxValue !== null && num > maxValue) {
        showCalculationNotice(`${fieldName} 值 ${num} 大于最大允许值 ${maxValue}`, true);
        return false;
    }
    
    return true;
}

// 课程目标权重计算
function calculateTargetWeights() {
    // 获取支撑强度值
    // 根据表格中的H、M、L数量计算强度值: Vi = 3x+2y+1z
    const targetStrengthValues = [];
    let hasValidData = false;
    
    try {
        // 从表1中获取每个目标的支撑强度值
        // 遍历目标1-4
        for (let i = 1; i <= 4; i++) {
            let strengthValue = 0;
            let hCount = 0;
            let mCount = 0;
            let lCount = 0;
            
            // 获取表1中该课程目标的所有单元格
            // 查找表1中所有行，尝试多种选择器以确保能找到表格
            const tableRows = document.querySelectorAll('table tbody tr[id^="table-row-"]');
            console.log(`找到的表格行数: ${tableRows.length}`);
            
            // 如果没有找到匹配的行，尝试其他选择器
            if (tableRows.length === 0) {
                const allTables = document.querySelectorAll('table');
                console.log(`在页面中找到的表格数量: ${allTables.length}`);
                
                if (allTables.length > 0) {
                    // 尝试找到第一个表格中的行
                    const firstTableRows = allTables[0].querySelectorAll('tbody tr');
                    console.log(`第一个表格中找到的行数: ${firstTableRows.length}`);
                }
            }
            
            // 遍历表1的每一行，检查支撑强度
            for (let j = 0; j < tableRows.length; j++) {
                const row = tableRows[j];
                const cells = row.querySelectorAll('td');
                
                // 检查这一行是否有分类列（检查第一个单元格是否有category类）
                const hasCategory = cells.length > 0 && cells[0].classList.contains('category');
                
                // 根据是否有分类列来确定课程目标的列索引
                let cellIndex;
                if (hasCategory) {
                    // 有分类列：分类(0) + 描述(1) + 目标1(2) + 目标2(3) + 目标3(4) + 目标4(5) + 操作(6)
                    cellIndex = i + 1; // 目标i对应列索引i+1
                } else {
                    // 无分类列（rowspan第二行）：描述(0) + 目标1(1) + 目标2(2) + 目标3(3) + 目标4(4) + 操作(5)
                    cellIndex = i; // 目标i对应列索引i
                }
                
                // 确保单元格索引有效且单元格存在
                if (cellIndex >= 0 && cells.length > cellIndex) {
                    const cell = cells[cellIndex];
                    // 获取单元格中的内容，包括所有子元素
                    let cellContent = '';
                    
                    // 如果单元格有子元素，尝试从子元素中读取
                    const inputBox = cell.querySelector('.input-box');
                    if (inputBox) {
                        cellContent = inputBox.textContent.trim();
                    } else {
                        // 否则直接读取单元格内容
                        cellContent = cell.textContent.trim();
                    }
                    
                    // 根据单元格内容判断支撑强度，增强匹配能力
                    if (cellContent === 'H' || cellContent === 'h' || cellContent.includes('H') || cellContent.includes('h')) {
                        hCount++;
                        console.log(`在行${j+1}中找到课程目标${i}的H支撑（列索引${cellIndex}）`);
                    } else if (cellContent === 'M' || cellContent === 'm' || cellContent.includes('M') || cellContent.includes('m')) {
                        mCount++;
                        console.log(`在行${j+1}中找到课程目标${i}的M支撑（列索引${cellIndex}）`);
                    } else if (cellContent === 'L' || cellContent === 'l' || cellContent.includes('L') || cellContent.includes('l')) {
                        lCount++;
                        console.log(`在行${j+1}中找到课程目标${i}的L支撑（列索引${cellIndex}）`);
                    }
                }
            }
            
            // 计算强度值: Vi = 3x+2y+1z
            strengthValue = 3 * hCount + 2 * mCount + 1 * lCount;
            
            console.log(`=== 课程目标${i}计算结果 ===`);
            console.log(`高支撑(H)=${hCount}, 中支撑(M)=${mCount}, 低支撑(L)=${lCount}`);
            console.log(`强度值计算: ${hCount}×3 + ${mCount}×2 + ${lCount}×1 = ${strengthValue}`);
            
            // 如果在表1中没有找到有效的支撑强度，尝试读取直接输入的支撑强度值
            if (strengthValue === 0) {
                // 查找表格中是否有targetHCount, targetMCount, targetLCount等字段
                const hCountElement = document.getElementById(`targetHCount${i}`);
                const mCountElement = document.getElementById(`targetMCount${i}`);
                const lCountElement = document.getElementById(`targetLCount${i}`);
                
                if (hCountElement) {
                    const hValue = safeParseFloat(hCountElement.textContent);
                    validateInput(hValue, '高支撑强度(H)数量', 0);
                    strengthValue += 3 * hValue;
                }
                
                if (mCountElement) {
                    const mValue = safeParseFloat(mCountElement.textContent);
                    validateInput(mValue, '中支撑强度(M)数量', 0);
                    strengthValue += 2 * mValue;
                }
                
                if (lCountElement) {
                    const lValue = safeParseFloat(lCountElement.textContent);
                    validateInput(lValue, '低支撑强度(L)数量', 0);
                    strengthValue += 1 * lValue;
                }
                
                // 如果还是没有找到，尝试直接读取支撑强度值
                if (strengthValue === 0) {
                    const directStrengthElement = document.getElementById(`targetStrength${i}`);
                    if (directStrengthElement) {
                        const directStrength = safeParseFloat(directStrengthElement.textContent);
                        validateInput(directStrength, `课程目标${i}支撑强度值`, 0);
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
            showCalculationNotice('未找到有效的支撑强度数据，请先输入支撑强度数据', true);
            return [];
        }
    } catch (error) {
        showCalculationNotice('计算支撑强度时出错: ' + error.message, true);
        return [];
    }
    
    // 计算总强度
    const totalStrength = targetStrengthValues.reduce((sum, value) => sum + value, 0);
    
    if (totalStrength <= 0) {
        showCalculationNotice('所有支撑强度值之和为零，无法计算权重', true);
        return [];
    }
    
    // 计算每个目标的权重 - 根据公式1: wi = Vi / ∑Vi
    const weights = targetStrengthValues.map(value => totalStrength > 0 ? value / totalStrength : 0);
    
    // 输出计算过程
    console.log('支撑强度值数组 (Vi):', targetStrengthValues);
    console.log('总强度值 (∑Vi):', totalStrength);
    console.log('计算得到的权重数组 (wi):', weights.map(w => w.toFixed(3)));
    
    try {
        // 更新权重表格
        for (let i = 0; i < weights.length; i++) {
            const weightElement = document.getElementById(`targetWeight${i+1}`);
            if (weightElement) {
                // 确保显示三位小数的精确值
                const weightValue = weights[i].toFixed(3);
                weightElement.textContent = weightValue;
                console.log(`设置目标${i+1}权重为: ${weightValue}`);
                
                // 同时更新最后总结表格中的权重显示
                const showWeightElement = document.getElementById(`showWeight${i+1}`);
                if (showWeightElement) {
                    showWeightElement.textContent = weightValue;
                    console.log(`更新总结表格中目标${i+1}权重为: ${weightValue}`);
                }
            } else {
                console.warn(`未找到目标${i+1}的权重元素`);
            }
        }
        
        // 更新总权值 - 总权值应为原始的总强度值，不是权重之和
        const totalWeightElement = document.getElementById('totalWeight');
        if (totalWeightElement) {
            totalWeightElement.textContent = totalStrength.toString();
            console.log('设置总权值为原始总强度值：', totalStrength);
        }
        
        showCalculationNotice('权重计算完成');
    } catch (error) {
        showCalculationNotice('更新权重表格时出错: ' + error.message, true);
    }
    
    return weights;
}

// 课程分目标达成度计算
function calculateTargetAchievements() {
    // 获取考核方式的权重、总分和平均分
    const examData = [];
    let hasValidData = false;
    
    try {
        console.log('=== 开始读取考核数据（表4） ===');
        // 读取考核数据
        for (let i = 1; i <= 4; i++) {  // 假设有4种考核方式
            const totalScoreElement = document.getElementById(`totalScore${i}`);
            const avgScoreElement = document.getElementById(`avgScore${i}`);
            
            if (totalScoreElement && avgScoreElement) {
                const totalScore = safeParseFloat(totalScoreElement.textContent || totalScoreElement.value || '0');
                const avgScore = safeParseFloat(avgScoreElement.textContent || avgScoreElement.value || '0');
                
                console.log(`考核方式${i}: 总分=${totalScore}, 平均分=${avgScore}`);
                
                if (totalScore > 0) {
                    hasValidData = true;
                } else if (avgScore > 0) {
                    showCalculationNotice(`总分为0但平均分大于0，请检查考核方式${i}的数据`, true);
                }
                
                // 验证平均分不应该大于总分
                if (avgScore > totalScore && totalScore > 0) {
                    showCalculationNotice(`考核方式${i}的平均分(${avgScore})大于总分(${totalScore})，请检查`, true);
                }
                
                examData.push({
                    totalScore: totalScore,
                    avgScore: avgScore,
                    name: `考核方式${i}`
                });
            } else {
                console.log(`未找到考核方式${i}的元素`);
                examData.push({
                    totalScore: 0,
                    avgScore: 0,
                    name: `考核方式${i}`
                });
            }
        }
        
        if (!hasValidData) {
            showCalculationNotice('未找到有效的考核数据，请先输入考核总分和平均分', true);
            return [];
        }
    } catch (error) {
        showCalculationNotice('读取考核数据时出错: ' + error.message, true);
        return [];
    }
    
    // 计算每个课程目标的达成度
    const achievements = [];
    let hasValidWeight = false;
    
    try {
        console.log('=== 开始计算课程目标达成度 ===');
        for (let targetIndex = 1; targetIndex <= 4; targetIndex++) {  // 假设有4个课程目标
            let targetAchievement = 0;
            let hasWeightForThisTarget = false;
            
            console.log(`--- 计算课程目标${targetIndex}的达成度 ---`);
            
            // 对每种考核方式进行计算
            for (let methodIndex = 1; methodIndex <= 4; methodIndex++) {  // 假设有4种考核方式
                // 获取该目标在该考核方式下的权重
                const weightElement = document.getElementById(`weight${methodIndex}-${targetIndex}`);
                if (weightElement) {
                    let weightText = (weightElement.textContent || weightElement.value || '0').trim();
                    let weight = parseWeight(weightText);
                    
                    console.log(`考核方式${methodIndex}对目标${targetIndex}的权重: ${weightText} -> ${weight}`);
                    
                    if (weight > 0) {
                        hasValidWeight = true;
                        hasWeightForThisTarget = true;
                        
                        // 获取该考核方式的总分和平均分
                        const examInfo = examData[methodIndex - 1];
                        if (examInfo && examInfo.totalScore > 0) {
                            // 计算该考核方式对达成度的贡献: Kij × Qij/Zij
                            const contribution = weight * (examInfo.avgScore / examInfo.totalScore);
                            targetAchievement += contribution;
                            console.log(`贡献度计算: ${weight} × (${examInfo.avgScore}/${examInfo.totalScore}) = ${contribution}`);
                        } else {
                            console.log(`考核方式${methodIndex}缺少有效总分，该权重将被忽略`);
                            showCalculationNotice(`课程目标${targetIndex}的考核方式${methodIndex}缺少有效总分，该权重将被忽略`, true);
                        }
                    } else {
                        console.log(`考核方式${methodIndex}对目标${targetIndex}的权重为0，跳过`);
                    }
                } else {
                    console.log(`未找到权重元素: weight${methodIndex}-${targetIndex}`);
                }
            }
            
            if (!hasWeightForThisTarget) {
                showCalculationNotice(`课程目标${targetIndex}没有有效权重，达成度将为0`, true);
            }
            
            console.log(`课程目标${targetIndex}的原始达成度: ${targetAchievement}`);
            
            // 不限制达成度在0-1范围内，允许超过1
            // targetAchievement = Math.max(0, Math.min(1, targetAchievement));
            achievements.push(targetAchievement);
            
            console.log(`课程目标${targetIndex}的最终达成度: ${targetAchievement}`);
            
            // 更新达成度表格
            const achievementElement = document.getElementById(`targetAchieve${targetIndex}`);
            if (achievementElement) {
                const achievementValue = targetAchievement.toFixed(3);
                if (achievementElement.tagName.toLowerCase() === 'input') {
                    achievementElement.value = achievementValue;
                } else {
                    achievementElement.textContent = achievementValue;
                }
                
                // 同时更新最后总结表格中的达成度显示
                const showAchieveElement = document.getElementById(`showAchieve${targetIndex}`);
                if (showAchieveElement) {
                    if (showAchieveElement.tagName.toLowerCase() === 'input') {
                        showAchieveElement.value = achievementValue;
                    } else {
                        showAchieveElement.textContent = achievementValue;
                    }
                }
            } else {
                console.log(`未找到达成度元素: targetAchieve${targetIndex}`);
            }
        }
        
        if (!hasValidWeight) {
            showCalculationNotice('未找到有效的权重数据，请先输入权重', true);
            return [];
        }
        
        showCalculationNotice('达成度计算完成');
    } catch (error) {
        showCalculationNotice('计算达成度时出错: ' + error.message, true);
        return [];
    }
    
    return achievements;
}

// 课程总达成度计算 - 根据公式(3): P = ∑(wi × Pi)
function calculateTotalAchievement() {
    console.log('=== 开始计算课程目标总达成度 ===');
    
    // 获取权重和达成度
    const weights = [];
    const achievements = [];
    let hasValidData = false;
    
    try {
        console.log('读取表3（权重值）和表5（分目标达成度）的数据...');
        
        for (let i = 1; i <= 4; i++) {  // 假设有4个课程目标
            const weightElement = document.getElementById(`showWeight${i}`);
            const achievementElement = document.getElementById(`showAchieve${i}`);
            
            if (weightElement && achievementElement) {
                const weight = safeParseFloat(weightElement.textContent || weightElement.value || '0');
                const achievement = safeParseFloat(achievementElement.textContent || achievementElement.value || '0');
                
                console.log(`课程目标${i}: 权重(w${i})=${weight}, 达成度(P${i})=${achievement}`);
                
                if (weight > 0 && achievement >= 0) {
                    hasValidData = true;
                }
                
                weights.push(weight);
                achievements.push(achievement);
            } else {
                console.log(`未找到课程目标${i}的权重或达成度元素`);
                weights.push(0);
                achievements.push(0);
            }
        }
        
        if (!hasValidData) {
            showCalculationNotice('未找到有效的权重和达成度数据，总达成度将为0', true);
            
            // 更新总达成度为0
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
    
    // 计算总达成度: P = Σ(wi × Pi) - 公式(3)
    console.log('\n按照公式(3)计算总达成度: P = Σ(wi × Pi)');
    let totalAchievement = 0;
    const contributions = [];
    
    for (let i = 0; i < weights.length; i++) {
        const contribution = weights[i] * achievements[i];
        contributions.push(contribution);
        totalAchievement += contribution;
        
        console.log(`课程目标${i+1}贡献: w${i+1} × P${i+1} = ${weights[i]} × ${achievements[i]} = ${contribution.toFixed(6)}`);
    }
    
    console.log(`\n总达成度计算:`);
    console.log(`P = ${contributions.map((c, i) => `(${weights[i]} × ${achievements[i]})`).join(' + ')}`);
    console.log(`P = ${contributions.map(c => c.toFixed(6)).join(' + ')}`);
    console.log(`P = ${totalAchievement.toFixed(6)}`);
    
    // 不限制总达成度范围，允许超过1
    // totalAchievement = Math.max(0, Math.min(1, totalAchievement));
    
    try {
        // 更新总达成度
        const totalAchieveElement = document.getElementById('totalAchieve');
        if (totalAchieveElement) {
            const finalValue = totalAchievement.toFixed(3);
            if (totalAchieveElement.tagName.toLowerCase() === 'input') {
                totalAchieveElement.value = finalValue;
            } else {
                totalAchieveElement.textContent = finalValue;
            }
            console.log(`更新总达成度显示为: ${finalValue}`);
        } else {
            console.log('未找到总达成度元素: totalAchieve');
        }
        
        showCalculationNotice(`总达成度计算完成: ${totalAchievement.toFixed(3)}`);
    } catch (error) {
        showCalculationNotice('更新总达成度时出错: ' + error.message, true);
    }
    
    return totalAchievement;
}

// 绑定计算事件
function setupCalculationEvents() {
    // 监听支撑强度值输入变化，计算权重
    document.addEventListener('input', function(event) {
        const target = event.target;
        
        if (!target) return;
        
        // 处理表1中支撑矩阵的输入变化
        let insideTable1 = false;
        let tableRow = target.closest('tr[id^="table-row-"]');
        
        if (tableRow) {
            // 检查是否在表1中（可能需要更精确的匹配）
            const tableContainer = tableRow.closest('.table-container');
            if (tableContainer) {
                const tableCaption = tableContainer.previousElementSibling;
                if (tableCaption && tableCaption.textContent && tableCaption.textContent.includes('表1')) {
                    insideTable1 = true;
                }
            }
        }
        
        // 如果是表1中的输入，或者是其他支撑强度相关输入，重新计算权重和达成度
        if (insideTable1 || 
            (target.id && (target.id.startsWith('targetStrength') || 
            target.id.startsWith('targetHCount') || 
            target.id.startsWith('targetMCount') || 
            target.id.startsWith('targetLCount')))) {
            calculateTargetWeights();
            calculateTargetAchievements();
            calculateTotalAchievement();
        }
        
        // 处理考核方式相关输入（表2和表4）
        if (target.id && (target.id.startsWith('totalScore') || 
            target.id.startsWith('avgScore') || 
            target.id.startsWith('score') ||
            (target.id.startsWith('weight') && target.id.includes('-')))) {
            console.log('检测到考核数据变化，重新计算达成度');
            calculateTargetAchievements();
            calculateTotalAchievement();
        }
        
        // 处理表2中的考核方式输入变化
        let insideTable2 = false;
        let examRow = target.closest('tr[id^="exam-row-"]');
        if (examRow) {
            insideTable2 = true;
        }
        
        // 处理表4中的成绩输入变化
        let insideTable4 = false;
        let scoreRow = target.closest('tr[id^="score-row-"]');
        if (scoreRow) {
            insideTable4 = true;
        }
        
        if (insideTable2 || insideTable4) {
            console.log('检测到表2或表4数据变化，重新计算达成度');
            setTimeout(() => {
                calculateTargetAchievements();
                calculateTotalAchievement();
            }, 100); // 延迟100ms确保数据已更新
        }
    });
    
    // 为表2和表4的所有输入框添加专门的事件监听器
    bindTable2And4Events();
    
    // 不再需要手动计算按钮，所有计算都自动进行
    // 移除已存在的计算按钮（如果有）
    const existingButton = document.querySelector('.action-button[data-purpose="calculate"]');
    if (existingButton && existingButton.parentNode) {
        existingButton.parentNode.removeChild(existingButton);
    }
}

// 专门绑定表2和表4的事件监听
function bindTable2And4Events() {
    console.log('绑定表2和表4的事件监听器...');
    
    // 绑定表2（考核方式权重）的所有输入框
    for (let i = 1; i <= 4; i++) { // 考核方式1-4
        // 满分输入框
        const scoreElement = document.getElementById(`score${i}`);
        if (scoreElement) {
            scoreElement.addEventListener('input', function() {
                console.log(`表2满分${i}发生变化，重新计算达成度`);
                setTimeout(() => {
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                }, 50);
            });
            scoreElement.addEventListener('blur', function() {
                setTimeout(() => {
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                }, 50);
            });
        }
        
        // 权重输入框
        for (let j = 1; j <= 4; j++) { // 课程目标1-4
            const weightElement = document.getElementById(`weight${i}-${j}`);
            if (weightElement) {
                weightElement.addEventListener('input', function() {
                    console.log(`表2权重${i}-${j}发生变化，重新计算达成度`);
                    setTimeout(() => {
                        calculateTargetAchievements();
                        calculateTotalAchievement();
                    }, 50);
                });
                weightElement.addEventListener('blur', function() {
                    setTimeout(() => {
                        calculateTargetAchievements();
                        calculateTotalAchievement();
                    }, 50);
                });
            }
        }
    }
    
    // 绑定表4（考核成绩）的所有输入框
    for (let i = 1; i <= 4; i++) { // 考核方式1-4
        // 总分输入框
        const totalScoreElement = document.getElementById(`totalScore${i}`);
        if (totalScoreElement) {
            totalScoreElement.addEventListener('input', function() {
                console.log(`表4总分${i}发生变化，重新计算达成度`);
                setTimeout(() => {
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                }, 50);
            });
            totalScoreElement.addEventListener('blur', function() {
                setTimeout(() => {
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                }, 50);
            });
        }
        
        // 平均分输入框
        const avgScoreElement = document.getElementById(`avgScore${i}`);
        if (avgScoreElement) {
            avgScoreElement.addEventListener('input', function() {
                console.log(`表4平均分${i}发生变化，重新计算达成度`);
                setTimeout(() => {
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                }, 50);
            });
            avgScoreElement.addEventListener('blur', function() {
                setTimeout(() => {
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                }, 50);
            });
        }
    }
    
    // 为表2和表4中的所有input-box添加事件监听
    const table2And4InputBoxes = document.querySelectorAll('#exam-row-1 .input-box, #exam-row-2 .input-box, #exam-row-3 .input-box, #exam-row-4 .input-box, #score-row-1 .input-box, #score-row-2 .input-box');
    table2And4InputBoxes.forEach(function(inputBox) {
        inputBox.addEventListener('input', function() {
            console.log('检测到表2或表4的input-box变化');
            setTimeout(() => {
                calculateTargetAchievements();
                calculateTotalAchievement();
            }, 50);
        });
        inputBox.addEventListener('blur', function() {
            setTimeout(() => {
                calculateTargetAchievements();
                calculateTotalAchievement();
            }, 50);
        });
    });
    
    console.log('表2和表4的事件监听器绑定完成');
}

// 初始化计算模块
function initCalculationModule() {
    console.log('初始化计算模块...');
    
    try {
        // 绑定事件监听
        setupCalculationEvents();
        
        // 为表格中的所有单元格添加事件监听
        const allTables = document.querySelectorAll('table');
        for (let table of allTables) {
            // 检查表格是否是支撑矩阵表格（表1）
            const tableCaption = table.closest('.table-container')?.previousElementSibling;
            const isTable1 = tableCaption && tableCaption.textContent && tableCaption.textContent.includes('表1');
            
            if (isTable1) {
                console.log('找到表1支撑矩阵表格，添加特殊监听器');
            }
            
            // 为所有单元格添加事件
            const cells = table.querySelectorAll('td');
            for (let cell of cells) {
                // 对所有单元格直接添加监听器
                cell.addEventListener('input', function() {
                    calculateTargetWeights();
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                });
                cell.addEventListener('blur', function() {
                    calculateTargetWeights();
                    calculateTargetAchievements();
                    calculateTotalAchievement();
                });
                
                // 同时为单元格内的input-box添加监听器
                const inputBoxes = cell.querySelectorAll('.input-box');
                for (let box of inputBoxes) {
                    box.addEventListener('input', function() {
                        calculateTargetWeights();
                        calculateTargetAchievements();
                        calculateTotalAchievement();
                    });
                    box.addEventListener('blur', function() {
                        calculateTargetWeights();
                        calculateTargetAchievements();
                        calculateTotalAchievement();
                    });
                }
            }
        }
        
        // 添加辅助函数，重新计算所有内容
        function recalculateAll() {
            console.log('重新计算所有数据...');
            calculateTargetWeights();
            calculateTargetAchievements();
            calculateTotalAchievement();
        }
        
        // 初始化计算（如果表格中已有数据）
        // 使用多次尝试的方式，确保DOM完全加载后计算
        setTimeout(() => {
            recalculateAll();
            
            // 1秒后再次计算，确保数据已经正确加载
            setTimeout(() => {
                recalculateAll();
                showCalculationNotice('数据自动计算已启用，所有结果将保留三位小数');
                
                // 2秒后再次计算，以应对可能的延迟加载
                setTimeout(() => {
                    recalculateAll();
                }, 2000);
            }, 1000);
        }, 500);
        
        console.log('计算模块初始化完成');
    } catch (error) {
        console.error('计算模块初始化失败:', error);
        showCalculationNotice('计算模块初始化失败: ' + error.message, true);
    }
}

// 测试函数：使用文档中的示例数据验证计算
function testWithDocumentExample() {
    console.log('=== 使用文档示例数据进行测试 ===');
    
    // 文档中的表2数据（权重）
    const weights = {
        1: [0.2, 0.2, 0.2, 0.4], // 课程目标1: 课堂表现20%, 课后作业20%, 线上作业20%, 期末考试40%
        2: [0.2, 0.3, 0.2, 0.3], // 课程目标2: 课堂表现20%, 课后作业30%, 线上作业20%, 期末考试30%
        3: [0.3, 0.2, 0.3, 0.2], // 课程目标3: 课堂表现30%, 课后作业20%, 线上作业30%, 期末考试20%
        4: [0.3, 0.3, 0.3, 0.1]  // 课程目标4: 课堂表现30%, 课后作业30%, 线上作业30%, 期末考试10%
    };
    
    // 文档中的表4数据（成绩）
    const examData = [
        { totalScore: 20, avgScore: 15.9, name: '课堂表现' },
        { totalScore: 20, avgScore: 16.9, name: '课后作业' },
        { totalScore: 10, avgScore: 7.1, name: '线上作业' },
        { totalScore: 50, avgScore: 42.4, name: '期末考试' }
    ];
    
    // 计算每个课程目标的达成度
    for (let targetIndex = 1; targetIndex <= 4; targetIndex++) {
        let targetAchievement = 0;
        console.log(`\\n--- 计算课程目标${targetIndex}的达成度 ---`);
        
        for (let methodIndex = 1; methodIndex <= 4; methodIndex++) {
            const weight = weights[targetIndex][methodIndex - 1];
            const examInfo = examData[methodIndex - 1];
            const contribution = weight * (examInfo.avgScore / examInfo.totalScore);
            targetAchievement += contribution;
            
            console.log(`${examInfo.name}贡献: ${weight} × (${examInfo.avgScore}/${examInfo.totalScore}) = ${weight} × ${(examInfo.avgScore / examInfo.totalScore).toFixed(3)} = ${contribution.toFixed(3)}`);
        }
        
        console.log(`课程目标${targetIndex}达成度: ${targetAchievement.toFixed(3)}`);
        
        // 验证是否与文档中的期望值匹配
        const expectedValues = [0.809, 0.809, 0.790, 0.790]; // 根据文档中的示例
        const expected = expectedValues[targetIndex - 1];
        const diff = Math.abs(targetAchievement - expected);
        if (diff < 0.001) {
            console.log(`✓ 计算结果正确，与期望值${expected}匹配`);
        } else {
            console.log(`⚠ 计算结果${targetAchievement.toFixed(3)}与期望值${expected}存在差异`);
        }
    }
    
    // 验证总达成度计算
    console.log('\n=== 验证总达成度计算 ===');
    const targetWeights = [0.278, 0.278, 0.222, 0.222]; // 文档中的权重
    const targetAchievements = [0.809, 0.809, 0.790, 0.790]; // 文档中的达成度
    
    console.log('根据文档数据计算总达成度:');
    let totalP = 0;
    const contributions = [];
    
    for (let i = 0; i < 4; i++) {
        const contribution = targetWeights[i] * targetAchievements[i];
        contributions.push(contribution);
        totalP += contribution;
        console.log(`课程目标${i+1}: ${targetWeights[i]} × ${targetAchievements[i]} = ${contribution.toFixed(6)}`);
    }
    
    console.log(`总达成度 P = ${contributions.join(' + ')} = ${totalP.toFixed(6)}`);
    console.log(`预期结果: 0.800564，实际计算: ${totalP.toFixed(6)}`);
    
    if (Math.abs(totalP - 0.800564) < 0.000001) {
        console.log('✓ 总达成度计算正确！');
    } else {
        console.log('⚠ 总达成度计算可能存在误差');
    }
}

// 添加到window对象以便全局访问
window.calculationModule = {
    init: initCalculationModule,
    calculateWeights: calculateTargetWeights,
    calculateAchievements: calculateTargetAchievements,
    calculateTotal: calculateTotalAchievement,
    testExample: testWithDocumentExample
};