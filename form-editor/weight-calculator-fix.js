/**
 * 表1权重计算脚本
 * 根据公式1自动计算表1中HML选择的权重值，并更新表3
 * 
 * 公式1说明：
 * Vi（单一课程目标得分值） = 该目标下所有关联指标得分之和
 * V总（所有课程目标总得分值） = ∑Vi (i=1 to n，n为目标数量)
 * Wi（单一课程目标权重） = Vi / V总
 * 
 * 计算步骤：
 * 1. 确定指标得分：根据赋值 H=3，M=2，L=1 计算
 * 2. 计算Vi：对每个课程目标，将其下的所有指标得分相加
 * 3. 计算V总：将所有课程目标的Vi相加，得到V总
 * 4. 计算Wi：将每个课程目标的Vi除以V总，得到其权重Wi
 */

const weightCalculator = {
    // 初始化
    init: function() {
        console.log('初始化权重计算脚本...');
        this.setupWeightCalculation();
        this.setupObserver();
        // 在其它DOMContentLoaded处理完成后再计算一次，确保已恢复本地选择
        setTimeout(() => {
            this.calculateWeights();
        }, 0);
        console.log('权重计算脚本初始化完成');
    },

    // 设置权重计算
    setupWeightCalculation: function() {
        // 添加计算按钮的点击事件
        const calculateButton = document.getElementById('calculate-button');
        if (calculateButton) {
            calculateButton.addEventListener('click', this.calculateWeights.bind(this));
        }
        
        // 添加到全局计算函数中
        if (typeof window.calculateTargetWeights === 'function') {
            const originalCalculateTargetWeights = window.calculateTargetWeights;
            window.calculateTargetWeights = () => {
                const result = originalCalculateTargetWeights();
                this.updateTargetWeightTable();
                return result;
            };
        }
    },
    
    // 设置观察器监听HML选择变化
    setupObserver: function() {
        // 监听HML选择事件
        const originalSelectHML = window.selectHML;
        if (originalSelectHML) {
            window.selectHML = (element, value) => {
                // 调用原始选择函数
                originalSelectHML(element, value);
                // 更新权重计算
                setTimeout(() => {
                    this.calculateWeights();
                }, 100);
            };
        }
        
        // 设置DOM观察器以监视新添加的HML选择器
        const observer = new MutationObserver((mutations) => {
            let needsUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && // ELEMENT_NODE
                            (node.classList.contains('hml-selector') || 
                             node.querySelector('.hml-selector'))) {
                            needsUpdate = true;
                        }
                    });
                } else if (mutation.type === 'attributes' && 
                          mutation.target.classList.contains('hml-option') &&
                          mutation.attributeName === 'class') {
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                setTimeout(() => {
                    this.calculateWeights();
                }, 100);
            }
        });
        
        // 配置观察选项
        const config = { 
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        };
        
        // 观察表格容器
        const table1Container = document.getElementById('table1-container');
        if (table1Container) {
            observer.observe(table1Container, config);
        }
    },
    
    // 计算权重 - 根据公式1
    calculateWeights: function() {
        try {
            // 获取表1中所有行的HML选择情况
            const rows = document.querySelectorAll('#table1-container table tbody tr');
            
            // 初始化各目标的权重值Vi和总权重V总
            let targetValues = [0, 0, 0, 0]; // 各课程目标的Vi值
            let totalValue = 0;              // V总值
            let hasSelections = false;       // 标记是否有选择
            
            rows.forEach(row => {
                // 跳过没有选择器的行
                if (!row.querySelectorAll('.hml-selector').length) return;
                
                // 获取每个目标的选择值，计算Vi
                for (let i = 1; i <= 4; i++) {
                    const selector = row.querySelector(`[id^="target${i}-selector"]`);
                    if (!selector) continue;
                    
                    const selectedOption = selector.querySelector('.hml-option.selected');
                    if (!selectedOption) continue;
                    
                    // 找到了选择，标记为true
                    hasSelections = true;
                    
                    // 根据H=3，M=2，L=1的赋值计算权重值
                    let value = 0;
                    if (selectedOption.classList.contains('h-option')) {
                        value = 3;  // H值
                    } else if (selectedOption.classList.contains('m-option')) {
                        value = 2;  // M值
                    } else if (selectedOption.classList.contains('l-option')) {
                        value = 1;  // L值
                    }
                    
                    // 累加到对应课程目标的Vi值
                    targetValues[i-1] += value;
                }
            });
            
            // 如果没有选择，清空权重表格并返回
            if (!hasSelections) {
                this.clearWeightTable();
                return;
            }
            
            // 计算V总 = V1 + V2 + V3 + V4
            totalValue = targetValues.reduce((sum, value) => sum + value, 0);
            
            // 计算权重比例Wi = Vi / V总
            let weightRatios = targetValues.map(value => 
                totalValue > 0 ? value / totalValue : 0.25
            );
            
            // 更新权重表格
            this.updateTargetWeightTable(targetValues, totalValue, weightRatios);
            
            console.log('权重计算完成：', {
                '各目标Vi值': targetValues,
                '总值V总': totalValue,
                '权重比例Wi': weightRatios
            });
        } catch (error) {
            console.error('计算权重时出错:', error);
        }
    },
    
    // 更新权重表格显示
    updateTargetWeightTable: function(targetValues = [0, 0, 0, 0], totalValue = 0, weightRatios = [0.25, 0.25, 0.25, 0.25]) {
        try {
            // 直接更新四个显示权重的元素（更可靠）
            for (let i = 0; i < 4; i++) {
                const targetWeightElement = document.getElementById(`targetWeight${i+1}`);
                if (targetWeightElement) {
                    const weightRatio = (totalValue > 0 ? weightRatios[i] : 0).toFixed(3);
                    targetWeightElement.textContent = totalValue > 0 ? weightRatio : '';
                }
            }

            // 尝试同步单元格文本（如果需要，不依赖节点个数）
            const row = document.getElementById('weight-value-row');
            if (row) {
                const cells = row.querySelectorAll('td');
                // cells[0] 是“权重值”标题，1..4是四个权重，最后是操作列
                for (let i = 1; i <= 4; i++) {
                    const div = cells[i] && cells[i].querySelector('div');
                    if (div) {
                        const weightRatio = (totalValue > 0 ? weightRatios[i-1] : 0).toFixed(3);
                        div.textContent = totalValue > 0 ? weightRatio : '';
                    }
                }
            }

            // 更新总权重值显示
            const totalWeightElement = document.getElementById('totalWeight');
            if (totalWeightElement) {
                totalWeightElement.textContent = totalValue > 0 ? totalValue.toString() : '';
            }

            // 显示表格行
            const weightRow = document.getElementById('weight-value-row');
            if (weightRow) {
                weightRow.style.display = '';
            }
        } catch (error) {
            console.error('更新权重表格时出错:', error);
        }
    },
    
    // 清空权重表格
    clearWeightTable: function() {
        try {
            // 清空表3的权重值
            const weightElements = document.querySelectorAll('table[id^="weight-table"] td:not(:first-child)');
            if (weightElements.length === 4) {
                for (let i = 0; i < 4; i++) {
                    const targetWeightElement = document.getElementById(`targetWeight${i+1}`);
                    if (targetWeightElement) {
                        targetWeightElement.textContent = '';
                        weightElements[i].textContent = '';
                    }
                }
            }
            
            // 清空总权重值显示
            const totalWeightElement = document.getElementById('totalWeight');
            if (totalWeightElement) {
                totalWeightElement.textContent = '';
            }
        } catch (error) {
            console.error('清空权重表格时出错:', error);
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    weightCalculator.init();
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    weightCalculator.init();
}

// 将计算模块暴露给全局
window.calculationModule = {
    calculateWeights: function() {
        weightCalculator.calculateWeights();
    },
    clearWeights: function() {
        weightCalculator.clearWeightTable();
    }
};
