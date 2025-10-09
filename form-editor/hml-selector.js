/**
 * HML选择器功能脚本
 * 处理课程目标对毕业要求指标点的支撑关系表中的H、M、L选择
 */

// 存储选择状态的对象
const hmlSelections = {};

/**
 * 选择HML选项（支持取消选择）
 * @param {HTMLElement} element - 被点击的选项元素
 * @param {string} value - 选项值 (H, M, 或 L)
 */
function selectHML(element, value) {
    const container = element.parentElement;
    const selectorId = container.id;
    
    // 检查当前元素是否已被选中
    const isCurrentlySelected = element.classList.contains('selected');
    
    // 清除同一容器内所有选项的选中状态
    container.querySelectorAll('.hml-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 如果当前元素未被选中，则选中它；如果已选中，则取消选择（不做任何操作）
    if (!isCurrentlySelected) {
        element.classList.add('selected');
        // 存储选择状态
        hmlSelections[selectorId] = value;
        console.log(`已选择 ${value} (选择器ID: ${selectorId})`);
    } else {
        // 取消选择，从存储中删除
        delete hmlSelections[selectorId];
        console.log(`已取消选择 (选择器ID: ${selectorId})`);
    }
    
    // 将选择保存到localStorage
    saveHMLSelectionsToStorage();
    
    // 如果在导出模式，更新显示方式
    if (document.body.classList.contains('is-exporting') || 
        document.body.classList.contains('is-exporting-pdf')) {
        updateExportDisplayMode();
    }
    
    // 触发权重计算更新
    if (typeof window.calculationModule !== 'undefined' && 
        typeof window.calculationModule.calculateWeights === 'function') {
        setTimeout(() => {
            window.calculationModule.calculateWeights();
        }, 50);
    }
}

/**
 * 将HML选择保存到localStorage
 */
function saveHMLSelectionsToStorage() {
    localStorage.setItem('hmlSelections', JSON.stringify(hmlSelections));
}

/**
 * 从localStorage加载HML选择
 */
function loadHMLSelectionsFromStorage() {
    const savedSelections = localStorage.getItem('hmlSelections');
    if (savedSelections) {
        const loadedSelections = JSON.parse(savedSelections);
        
        // 恢复选择状态
        Object.keys(loadedSelections).forEach(selectorId => {
            const value = loadedSelections[selectorId];
            const container = document.getElementById(selectorId);
            
            if (container) {
                // 找到对应值的选项
                let optionElement;
                if (value === 'H') {
                    optionElement = container.querySelector('.h-option');
                } else if (value === 'M') {
                    optionElement = container.querySelector('.m-option');
                } else if (value === 'L') {
                    optionElement = container.querySelector('.l-option');
                }
                
                if (optionElement) {
                    // 手动调用选择函数
                    selectHML(optionElement, value);
                }
            }
        });
        
        // 更新本地存储的对象
        Object.assign(hmlSelections, loadedSelections);
    }
}

/**
 * 更新导出模式下的显示
 */
function updateExportDisplayMode() {
    document.querySelectorAll('.hml-selector').forEach(selector => {
        const selectedOption = selector.querySelector('.selected');
        if (selectedOption) {
            // 在导出模式下只显示选中的值
            selector.querySelectorAll('.hml-option:not(.selected)').forEach(option => {
                option.style.display = 'none';
            });
            
            selectedOption.style.border = 'none';
            selectedOption.style.backgroundColor = 'transparent';
            selectedOption.style.color = '#000';
        }
    });
}

/**
 * 初始化HML选择器功能
 */
function initHMLSelectors() {
    // 从localStorage加载选择
    loadHMLSelectionsFromStorage();
    
    // 添加重置功能监听
    document.addEventListener('reportReset', function() {
        // 清除所有选择
        document.querySelectorAll('.hml-selector .hml-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // 清除存储的选择
        Object.keys(hmlSelections).forEach(key => delete hmlSelections[key]);
        localStorage.removeItem('hmlSelections');
    });
    
    // 监听DOM变化，处理动态添加的选择器
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    // 检查是否为包含选择器的元素
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        (node.classList.contains('subrow') || node.querySelector('.hml-selector'))) {
                        
                        // 为新添加的选择器添加点击事件
                        const newSelectors = node.querySelectorAll('.hml-selector');
                        if (newSelectors.length) {
                            console.log('检测到新添加的HML选择器:', newSelectors.length, '个');
                        }
                    }
                });
            }
        });
    });
    
    // 观察整个表格容器
    const table1Container = document.getElementById('table1-container');
    if (table1Container) {
        observer.observe(table1Container, { 
            childList: true, 
            subtree: true 
        });
    }
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initHMLSelectors);