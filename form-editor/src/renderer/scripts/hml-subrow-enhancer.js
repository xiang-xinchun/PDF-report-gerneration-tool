/**
 * HML子行选择器增强脚本
 * 确保动态添加的行中的HML选择器与原始行样式一致
 */

const hmlSubrowEnhancer = {
    /**
     * 初始化增强器
     */
    init: function() {
        console.log('正在初始化HML子行选择器增强器...');
        
        // 应用于现有的子行
        this.enhanceExistingSubrows();
        
        // 设置突变观察器来监听新增的子行
        this.setupMutationObserver();
        
        // 扩展添加行功能，以便在添加新行时立即应用增强
        this.extendAddRowFeature();
        
        console.log('HML子行选择器增强器初始化完成');
    },
    
    /**
     * 应用统一样式到子行的HML选择器
     * @param {HTMLElement} row - 要处理的表格行元素
     */
    enhanceSubrowHML: function(row) {
        if (!row || !row.classList.contains('subrow')) {
            return;
        }
        
        // 获取该行中的所有HML选择器
        const selectors = row.querySelectorAll('.hml-selector');
        if (!selectors.length) {
            return;
        }
        
        selectors.forEach(selector => {
            // 确保选择器具有正确的样式
            selector.style.display = 'flex';
            selector.style.justifyContent = 'center';
            selector.style.alignItems = 'center';
            selector.style.width = '100%';
            selector.style.height = '100%';
            selector.style.gap = '5px';
            
            // 处理选项
            const options = selector.querySelectorAll('.hml-option');
            options.forEach(option => {
                option.style.cursor = 'pointer';
                option.style.width = '26px';  // 与原始样式一致
                option.style.height = '26px'; // 与原始样式一致
                option.style.borderRadius = '50%';
                option.style.display = 'flex';
                option.style.justifyContent = 'center';
                option.style.alignItems = 'center';
                option.style.border = '1px solid #ccc';
                option.style.fontWeight = 'bold';
                option.style.transition = 'all 0.2s';
                option.style.margin = '0 3px';
                option.style.fontSize = '14px';
                
                // 根据类应用特定样式
                if (option.classList.contains('selected')) {
                    option.style.color = 'white';
                    
                    if (option.classList.contains('h-option')) {
                        option.style.backgroundColor = '#2196F3';
                        option.style.borderColor = '#2196F3';
                    } else if (option.classList.contains('m-option')) {
                        option.style.backgroundColor = '#4CAF50';
                        option.style.borderColor = '#4CAF50';
                    } else if (option.classList.contains('l-option')) {
                        option.style.backgroundColor = '#FF9800';
                        option.style.borderColor = '#FF9800';
                    }
                } else {
                    option.style.color = '#333';
                    option.style.backgroundColor = 'transparent';
                }
            });
        });
        
        // 处理包含HML选择器的单元格
        const hmlCells = row.querySelectorAll('.hml-cell');
        hmlCells.forEach(cell => {
            cell.style.textAlign = 'center';
            cell.style.padding = '5px';
            cell.style.verticalAlign = 'middle';
        });
    },
    
    /**
     * 增强现有的所有子行
     */
    enhanceExistingSubrows: function() {
        const subrows = document.querySelectorAll('tr.subrow');
        subrows.forEach(row => this.enhanceSubrowHML(row));
        console.log(`已增强 ${subrows.length} 个现有子行`);
    },
    
    /**
     * 设置DOM突变观察器以监视新添加的子行
     */
    setupMutationObserver: function() {
        // 创建一个观察器实例
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // 检查添加的节点
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        // 检查添加的是否是子行
                        if (node.nodeType === 1 && node.tagName === 'TR' && 
                            node.classList.contains('subrow')) {
                            // 应用增强
                            this.enhanceSubrowHML(node);
                            console.log('已增强新添加的子行:', node.id);
                        }
                    });
                }
            });
        });
        
        // 配置观察选项
        const config = { 
            childList: true,     // 观察目标子节点的变动
            subtree: true        // 观察所有后代节点
        };
        
        // 开始观察
        const tableContainers = document.querySelectorAll('.table-container');
        tableContainers.forEach(container => {
            observer.observe(container, config);
        });
        
        console.log('已设置DOM突变观察器');
    },
    
    /**
     * 扩展添加行功能
     */
    extendAddRowFeature: function() {
        if (typeof window.addRowFeature === 'object' && typeof window.addRowFeature.addSubRow === 'function') {
            // 保存原始添加子行方法的引用
            const originalAddSubRow = window.addRowFeature.addSubRow;
            
            // 重写添加子行方法
            window.addRowFeature.addSubRow = (parentRowId) => {
                // 调用原始方法
                originalAddSubRow(parentRowId);
                
                // 获取最新添加的子行
                const parentRow = document.getElementById(parentRowId);
                if (parentRow) {
                    let lastSubRow = parentRow.nextElementSibling;
                    while (lastSubRow && lastSubRow.classList.contains('subrow') && 
                           lastSubRow.dataset.parentRow === parentRowId) {
                        const nextRow = lastSubRow.nextElementSibling;
                        if (nextRow && nextRow.classList.contains('subrow') && 
                            nextRow.dataset.parentRow === parentRowId) {
                            lastSubRow = nextRow;
                        } else {
                            break;
                        }
                    }
                    
                    // 应用增强
                    if (lastSubRow && lastSubRow.classList.contains('subrow')) {
                        this.enhanceSubrowHML(lastSubRow);
                        console.log('已增强通过addSubRow添加的行:', lastSubRow.id);
                    }
                }
            };
            
            console.log('已扩展添加行功能');
        } else {
            console.warn('未找到addRowFeature.addSubRow方法，无法扩展');
        }
    }
};

// 页面加载完成后初始化增强器
document.addEventListener('DOMContentLoaded', function() {
    hmlSubrowEnhancer.init();
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    hmlSubrowEnhancer.init();
}