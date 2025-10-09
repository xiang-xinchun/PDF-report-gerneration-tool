/**
 * 表格线统一处理脚本
 * 确保所有表格行和单元格有一致的边框样式
 */

const tableBorderUnifier = {
    // 初始化
    init: function() {
        console.log('初始化表格线统一处理...');
        this.applyUniformBorders();
        this.setupBorderObserver();
        console.log('表格线统一处理初始化完成');
    },

    // 应用统一边框到所有表格和单元格
    applyUniformBorders: function() {
        // 应用到所有表格
        document.querySelectorAll('table').forEach(table => {
            table.style.borderCollapse = 'collapse';
            table.style.border = '1px solid #000';
            
            // 处理表格中的所有行
            table.querySelectorAll('tr').forEach(row => {
                row.style.border = '1px solid #000';
                
                // 处理每一行中的单元格
                row.querySelectorAll('td, th').forEach(cell => {
                    cell.style.border = '1px solid #000';
                    cell.style.padding = '8px';
                    
                    // 如果单元格包含HML选择器，确保垂直居中
                    if (cell.querySelector('.hml-selector')) {
                        cell.style.verticalAlign = 'middle';
                        cell.style.textAlign = 'center';
                    }
                });
            });
        });
        
        // 特别处理子行
        document.querySelectorAll('tr.subrow').forEach(subrow => {
            subrow.style.border = '1px solid #000';
            
            // 处理子行中的所有单元格
            subrow.querySelectorAll('td').forEach(cell => {
                cell.style.border = '1px solid #000';
                cell.style.borderCollapse = 'collapse';
                cell.style.padding = '8px';
            });
        });
    },

    // 设置表格变化观察器
    setupBorderObserver: function() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // 检查是否添加了表格行或单元格
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeName === 'TR') {
                            // 如果添加了行，应用边框样式
                            node.style.border = '1px solid #000';
                            
                            // 处理行中的单元格
                            node.querySelectorAll('td, th').forEach(cell => {
                                cell.style.border = '1px solid #000';
                                cell.style.padding = '8px';
                            });
                        } else if (node.nodeName === 'TD' || node.nodeName === 'TH') {
                            // 如果直接添加了单元格，应用边框样式
                            node.style.border = '1px solid #000';
                            node.style.padding = '8px';
                        } else if (node.nodeType === 1) { // 元素节点
                            // 检查是否包含表格相关元素
                            const rows = node.querySelectorAll('tr');
                            if (rows.length) {
                                rows.forEach(row => {
                                    row.style.border = '1px solid #000';
                                    
                                    row.querySelectorAll('td, th').forEach(cell => {
                                        cell.style.border = '1px solid #000';
                                        cell.style.padding = '8px';
                                    });
                                });
                            }
                        }
                    });
                }
            });
        });
        
        // 配置观察选项
        const config = {
            childList: true,    // 观察目标子节点的变动
            subtree: true,      // 观察所有后代节点
            attributes: true,   // 观察属性变动
            attributeFilter: ['style', 'class'] // 只观察样式和类的变化
        };
        
        // 观察所有表格容器
        document.querySelectorAll('.table-container').forEach(container => {
            observer.observe(container, config);
        });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    tableBorderUnifier.init();
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    tableBorderUnifier.init();
}