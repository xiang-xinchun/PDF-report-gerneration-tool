/**
 * 动态课程目标计算增强模块
 * 扩展原有计算模块,支持动态数量的课程目标
 */

(function() {
    'use strict';

    /**
     * 获取当前课程目标数量
     */
    function getCurrentGoalCount() {
        // 从表1的表头获取目标数量
        const table1Headers = document.querySelectorAll('#table1-container table thead .goal-header');
        if (table1Headers.length > 0) {
            return table1Headers.length;
        }
        
        // 从第二部分获取目标数量
        const goalContainers = document.querySelectorAll('[id^="target"][id$="-container"]');
        if (goalContainers.length > 0) {
            return goalContainers.length;
        }
        
        // 默认4个
        return 4;
    }

    /**
     * 动态课程目标权重计算
     */
    function calculateTargetWeightsDynamic() {
        const goalCount = getCurrentGoalCount();
        console.log(`[动态计算] 当前课程目标数量: ${goalCount}`);
        
        if (!checkTable1Data()) {
            console.log('[动态计算] 表1数据不完整，跳过权重计算');
            return [];
        }
        
        const targetStrengthValues = [];
        let hasValidData = false;
        
        try {
            // 遍历所有目标
            for (let i = 1; i <= goalCount; i++) {
                let strengthValue = 0;
                let hCount = 0;
                let mCount = 0;
                let lCount = 0;
                
                const tableRows = document.querySelectorAll('table tbody tr[id^="table-row-"]');
                
                // 遍历表1的所有行
                for (let j = 0; j < tableRows.length; j++) {
                    const row = tableRows[j];
                    const cells = row.querySelectorAll('td');
                    
                    // 检查是否有类别列
                    const hasCategory = cells.length > 0 && cells[0].classList.contains('category');
                    let cellIndex = hasCategory ? i + 1 : i;
                    
                    if (cellIndex >= 0 && cells.length > cellIndex) {
                        const cell = cells[cellIndex];
                        const cellValue = getTable1CellValue(cell);

                        if (cellValue.startsWith('H')) {
                            hCount++;
                        } else if (cellValue.startsWith('M')) {
                            mCount++;
                        } else if (cellValue.startsWith('L')) {
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
                console.log('[动态计算] 没有有效的支撑强度数据');
                return [];
            }
        } catch (error) {
            showCalculationNotice('计算支撑强度时出错: ' + error.message, true);
            return [];
        }
        
        const totalStrength = targetStrengthValues.reduce((sum, value) => sum + value, 0);
        
        if (totalStrength <= 0) {
            console.log('[动态计算] 总支撑强度为0');
            return [];
        }
        
        const weights = targetStrengthValues.map(value => totalStrength > 0 ? value / totalStrength : 0);
        
        try {
            // 更新表3的权重值
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
            
            console.log('[动态计算] 权重计算完成:', weights);
        } catch (error) {
            showCalculationNotice('更新权重表格时出错: ' + error.message, true);
        }
        
        return weights;
    }

    /**
     * 动态课程分目标达成度计算
     */
    function calculateTargetAchievementsDynamic() {
        const goalCount = getCurrentGoalCount();
        console.log(`[动态计算] 计算${goalCount}个目标的达成度`);
        
        if (!checkTable2DataDynamic(goalCount) || !checkTable4DataDynamic(goalCount)) {
            console.log('[动态计算] 表2或表4数据不完整，跳过表5计算');
            return [];
        }
        
        const examData = [];
        let hasValidData = false;
        
        try {
            // 获取考核方式数据
            for (let i = 1; i <= 4; i++) { // 假设最多4种考核方式
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
                        avgScore: avgScore
                    });
                }
            }
            
            if (!hasValidData) {
                console.log('[动态计算] 表4没有有效数据');
                return [];
            }
        } catch (error) {
            showCalculationNotice('读取表4数据时出错: ' + error.message, true);
            return [];
        }
        
        const achievements = [];
        
        try {
            // 计算每个课程目标的达成度
            for (let targetIndex = 1; targetIndex <= goalCount; targetIndex++) {
                let achievement = 0;
                
                // 遍历所有考核方式
                for (let examIndex = 0; examIndex < examData.length; examIndex++) {
                    const weightElement = document.getElementById(`weight${examIndex + 1}-${targetIndex}`);
                    if (!weightElement) continue;
                    
                    const weight = parseWeight(weightElement.textContent || weightElement.value || '0');
                    const totalScore = examData[examIndex].totalScore;
                    const avgScore = examData[examIndex].avgScore;
                    
                    if (totalScore > 0 && weight > 0) {
                        achievement += weight * (avgScore / totalScore);
                    }
                }
                
                achievements.push(achievement);
                
                // 更新表5
                const targetAchieveElement = document.getElementById(`targetAchieve${targetIndex}`);
                if (targetAchieveElement) {
                    const achievementValue = achievement.toFixed(3);
                    targetAchieveElement.textContent = achievementValue;
                    
                    // 同步到表6
                    const showAchieveElement = document.getElementById(`showAchieve${targetIndex}`);
                    if (showAchieveElement) {
                        showAchieveElement.textContent = achievementValue;
                    }
                }
            }
            
            console.log('[动态计算] 达成度计算完成:', achievements);
        } catch (error) {
            showCalculationNotice('计算达成度时出错: ' + error.message, true);
        }
        
        return achievements;
    }

    /**
     * 动态总达成度计算
     */
    function calculateTotalAchievementDynamic() {
        const goalCount = getCurrentGoalCount();
        console.log(`[动态计算] 计算${goalCount}个目标的总达成度`);
        
        const weights = [];
        const achievements = [];
        let hasValidData = false;
        
        try {
            for (let i = 1; i <= goalCount; i++) {
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
            
            console.log(`[动态计算] 总达成度计算完成: ${totalAchievement.toFixed(3)}`);
        } catch (error) {
            showCalculationNotice('更新总达成度时出错: ' + error.message, true);
        }
        
        return totalAchievement;
    }

    /**
     * 检查表2数据是否完整（动态版本）
     */
    function checkTable2DataDynamic(goalCount) {
        let hasValidScore = false;
        for (let i = 1; i <= 4; i++) {
            const scoreElement = document.getElementById(`score${i}`);
            if (scoreElement) {
                const score = safeParseFloat(scoreElement.textContent || scoreElement.value || '0');
                if (score > 0) {
                    hasValidScore = true;
                    break;
                }
            }
        }
        return hasValidScore;
    }

    /**
     * 检查表4数据是否完整（动态版本）
     */
    function checkTable4DataDynamic(goalCount) {
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

    /**
     * 智能计算（动态版本）
     */
    function smartCalculateDynamic() {
        const goalCount = getCurrentGoalCount();
        const table1Complete = checkTable1Data();
        const table2Complete = checkTable2DataDynamic(goalCount);
        const table4Complete = checkTable4DataDynamic(goalCount);
        
        console.log(`[动态计算] 数据状态: 目标数=${goalCount}, 表1=${table1Complete}, 表2=${table2Complete}, 表4=${table4Complete}`);
        
        // 表1完成就计算权重
        if (table1Complete) {
            calculateTargetWeightsDynamic();
        }
        
        // 表2和表4完成就计算达成度
        if (table2Complete && table4Complete) {
            calculateTargetAchievementsDynamic();
        }
        
        // 所有表都完成就计算总达成度
        if (table1Complete && table2Complete && table4Complete) {
            calculateTotalAchievementDynamic();
        }
    }

    /**
     * 替换原有计算模块
     */
    function enhanceCalculationModule() {
        console.log('[动态计算] 增强计算模块...');
        
        // 替换全局计算函数
        if (window.calculationModule) {
            const originalModule = window.calculationModule;
            
            window.calculationModule = {
                ...originalModule,
                calculateTargetWeights: calculateTargetWeightsDynamic,
                calculateTargetAchievements: calculateTargetAchievementsDynamic,
                calculateTotalAchievement: calculateTotalAchievementDynamic,
                smartCalculate: smartCalculateDynamic,
                getCurrentGoalCount: getCurrentGoalCount,
                // 保留原有的别名
                calculateWeights: calculateTargetWeightsDynamic,
                calculateAchievements: calculateTargetAchievementsDynamic,
                calculateTotal: calculateTotalAchievementDynamic
            };
            
            console.log('[动态计算] 计算模块已增强，支持动态数量的课程目标');
        } else {
            console.warn('[动态计算] 未找到原计算模块，创建新模块');
            
            window.calculationModule = {
                init: smartCalculateDynamic,
                smartCalculate: smartCalculateDynamic,
                calculateTargetWeights: calculateTargetWeightsDynamic,
                calculateTargetAchievements: calculateTargetAchievementsDynamic,
                calculateTotalAchievement: calculateTotalAchievementDynamic,
                calculateWeights: calculateTargetWeightsDynamic,
                calculateAchievements: calculateTargetAchievementsDynamic,
                calculateTotal: calculateTotalAchievementDynamic,
                getCurrentGoalCount: getCurrentGoalCount,
                checkTable1Data: checkTable1Data,
                checkTable2Data: (count) => checkTable2DataDynamic(count || getCurrentGoalCount()),
                checkTable4Data: (count) => checkTable4DataDynamic(count || getCurrentGoalCount())
            };
        }
    }

    // 等待DOM和其他脚本加载完成后再增强
    function initDynamicCalculation() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(enhanceCalculationModule, 500);
            });
        } else {
            setTimeout(enhanceCalculationModule, 500);
        }
    }

    initDynamicCalculation();

})();
