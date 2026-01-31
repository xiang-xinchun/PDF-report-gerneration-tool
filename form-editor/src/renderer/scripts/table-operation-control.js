// 表格操作控制脚本
document.addEventListener('DOMContentLoaded', function() {
    // 确保所有表格容器都有正确的ID
    function ensureTableContainersHaveIds() {
        const tableContainers = document.querySelectorAll('.table-container');
        const tableNames = document.querySelectorAll('.table-name');
        
        // 查找所有表格名称，用于确定表格类型
        for (let i = 0; i < tableNames.length; i++) {
            const tableName = tableNames[i];
            const tableText = tableName.textContent || tableName.innerText;
            
            // 查找下一个表格容器
            let tableContainer = tableName.nextElementSibling;
            while (tableContainer && !tableContainer.classList.contains('table-container')) {
                tableContainer = tableContainer.nextElementSibling;
            }
            
            if (tableContainer) {
                // 根据表格名称设置ID
                if (tableText.includes('表1')) {
                    tableContainer.id = 'table1-container';
                } else if (tableText.includes('表2')) {
                    tableContainer.id = 'table2-container';
                } else if (tableText.includes('表3')) {
                    tableContainer.id = 'table3-container';
                } else if (tableText.includes('表4')) {
                    tableContainer.id = 'table4-container';
                } else if (tableText.includes('表5')) {
                    tableContainer.id = 'table5-container';
                } else {
                    tableContainer.id = 'table6-container'; // 其他表格
                }
            }
        }
        
        console.log('已确保所有表格容器有正确的ID');
    }
    
    // 移除所有delete-cell和row-delete-button的内联样式
    function removeInlineStyles() {
        // 获取所有delete-cell单元格
        const deleteCells = document.querySelectorAll('.delete-cell');
        deleteCells.forEach(cell => {
            // 移除内联样式，让CSS规则接管
            cell.removeAttribute('style');
        });

        // 获取所有row-delete-button按钮
        const deleteButtons = document.querySelectorAll('.row-delete-button');
        deleteButtons.forEach(button => {
            // 移除内联样式，让CSS规则接管
            button.removeAttribute('style');
        });

        console.log('已移除表格操作列的内联样式');
    }

    // 初始化表格ID和移除内联样式
    setTimeout(function() {
        ensureTableContainersHaveIds();
        removeInlineStyles();
    }, 500);

    // 监听DOM变化，处理动态添加的元素
    const observer = new MutationObserver(function(mutations) {
        let needUpdate = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && (node.classList.contains('delete-cell') || 
                            node.querySelector('.delete-cell') || 
                            node.querySelector('.row-delete-button'))) {
                            needUpdate = true;
                            break;
                        }
                    }
                }
            }
        });

        if (needUpdate) {
            removeInlineStyles();
        }
    });

    // 开始观察整个document的变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});