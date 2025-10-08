// 添加行功能模块
const addRowFeature = {
    // 初始化行添加和删除功能
    init: function() {
        console.log('添加行功能模块初始化...');
        this.setupAddRowButtons();
        this.extendUndoFunction();
        console.log('添加行功能初始化完成');
    },

    // 设置添加行按钮
    setupAddRowButtons: function() {
        console.log('设置添加行按钮...');
        // 所有添加行按钮已经通过内联HTML添加
        // 这个函数留空，因为按钮已经直接添加到HTML中
        console.log('添加行按钮设置完成');
    },

    // 添加子行
    addSubRow: function(parentRowId) {
        console.log('添加子行，父行ID:', parentRowId);
        
        try {
            // 获取父行元素
            const parentRow = document.getElementById(parentRowId);
            if (!parentRow) {
                console.error('未找到父行元素:', parentRowId);
                return;
            }
            
            // 获取父行的类别单元格
            const categoryCell = parentRow.querySelector('.category');
            if (!categoryCell) {
                console.error('未找到类别单元格');
                return;
            }
            
            // 获取类别名称 - 只获取第一行文本，排除+按钮的文本
            const categoryText = categoryCell.childNodes[0];
            const categoryName = categoryText ? categoryText.textContent.trim() : '';
            console.log('类别名称:', categoryName);
            
            // 创建新行
            const newRow = document.createElement('tr');
            const rowIdCounter = Date.now(); // 使用时间戳作为唯一ID
            const newRowId = `${parentRowId}-sub-${rowIdCounter}`;
            newRow.id = newRowId;
            newRow.className = 'subrow';
            newRow.dataset.parentRow = parentRowId;
            newRow.dataset.categoryName = categoryName; // 保存类别名称，以便删除时使用
            
            // 创建单元格内容
            let html = '';
            // 第一列为子类别
            html += '<td class="table-td sub-category"><div contenteditable="true" class="input-box"></div></td>';
            
            // 添加4列可编辑单元格
            for (let i = 0; i < 4; i++) {
                html += '<td class="table-td"><div contenteditable="true" class="input-box"></div></td>';
            }
            
            // 添加删除按钮单元格
            html += `<td class="table-td delete-cell" style="display:table-cell">
                <button class="row-delete-button" title="删除此行" 
                onclick="addRowFeature.removeSubRow('${newRowId}')" 
                style="display:inline-block; width:22px; height:22px; background-color:#f44336; color:white; border-radius:50%; font-weight:bold; text-align:center; border:none;">×</button>
            </td>`;
            
            newRow.innerHTML = html;
            
            // 更新父行类别单元格的rowspan
            const currentRowspan = parseInt(categoryCell.getAttribute('rowspan') || 1);
            categoryCell.setAttribute('rowspan', currentRowspan + 1);
            
            // 插入新行到父行之后
            const nextRow = parentRow.nextElementSibling;
            if (nextRow && nextRow.classList.contains('subrow') && nextRow.dataset.parentRow === parentRowId) {
                // 如果下一行是同一个父行的子行，则继续找下去，直到找到最后一个子行
                let lastSubRow = nextRow;
                while (lastSubRow.nextElementSibling && 
                       lastSubRow.nextElementSibling.classList.contains('subrow') && 
                       lastSubRow.nextElementSibling.dataset.parentRow === parentRowId) {
                    lastSubRow = lastSubRow.nextElementSibling;
                }
                lastSubRow.parentNode.insertBefore(newRow, lastSubRow.nextElementSibling);
            } else {
                // 如果下一行不是子行，则直接在父行后面插入
                parentRow.parentNode.insertBefore(newRow, nextRow);
            }
            
            // 记录操作到历史记录中，以便撤销
            if (typeof window.recordOperation === 'function') {
                window.recordOperation({
                    type: 'addSubRow',
                    categoryRowId: parentRowId,
                    newRowId: newRowId,
                    rowspan: currentRowspan + 1,
                    categoryName: categoryName
                });
            }
            
            // 显示通知
            if (typeof window.showNotification === 'function') {
                window.showNotification({
                    title: '添加成功',
                    message: '添加成功',
                    type: 'success'
                });
            } else {
                console.log('添加行成功');
            }
            
            console.log('成功添加子行:', newRowId);
        } catch (error) {
            console.error('添加子行时发生错误:', error);
        }
    },

    // 删除子行
    removeSubRow: function(rowId) {
        console.log('删除子行:', rowId);
        
        try {
            const row = document.getElementById(rowId);
            if (!row) {
                console.error('未找到要删除的行:', rowId);
                return;
            }
            
            // 处理原始表格行的情况
            const isOriginalTableRow = rowId.match(/^table-row-\d+$/);
            if (isOriginalTableRow) {
                // 检查这是否是主表格行，如果是，则不允许删除
                const categoryCell = row.querySelector('.category');
                if (categoryCell) {
                    // 获取当前rowspan值
                    const currentRowspan = parseInt(categoryCell.getAttribute('rowspan') || '1');
                    
                    // 如果只有一行，不允许删除
                    if (currentRowspan <= 1) {
                        console.log('这是类别的唯一一行，不允许删除');
                        if (typeof window.showNotification === 'function') {
                            window.showNotification({
                                title: '无法删除',
                                message: '这是类别的唯一一行，不允许删除',
                                type: 'warning'
                            });
                        }
                        return;
                    }
                    
                    // 找到所有子行
                    const allSubRows = [];
                    let nextRow = row.nextElementSibling;
                    let subRowsCount = 0;
                    
                    while (nextRow && subRowsCount < currentRowspan - 1) {
                        if (nextRow.classList.contains('subrow') || 
                            !nextRow.querySelector('.category')) { // 非类别行也可能是子行
                            allSubRows.push(nextRow);
                            subRowsCount++;
                        } else {
                            break;
                        }
                        nextRow = nextRow.nextElementSibling;
                    }
                    
                    if (allSubRows.length > 0) {
                        // 获取第一个子行的内容
                        const firstSubRow = allSubRows[0];
                        const subRowCells = firstSubRow.querySelectorAll('.table-td');
                        const mainRowCells = row.querySelectorAll('.table-td');
                        
                        // 将子行内容复制到主行中
                        for (let i = 0; i < subRowCells.length && i + 1 < mainRowCells.length; i++) {
                            const targetCell = mainRowCells[i + 1]; // 跳过第一个单元格（类别单元格）
                            const sourceCell = subRowCells[i];
                            if (targetCell && sourceCell) {
                                const targetInput = targetCell.querySelector('.input-box');
                                const sourceInput = sourceCell.querySelector('.input-box');
                                if (targetInput && sourceInput) {
                                    targetInput.innerHTML = sourceInput.innerHTML;
                                }
                            }
                        }
                        
                        // 删除第一个子行
                        firstSubRow.remove();
                        
                        // 减少rowspan值
                        categoryCell.setAttribute('rowspan', currentRowspan - 1);
                    }
                }
                
                // 显示通知
                if (typeof window.showNotification === 'function') {
                    window.showNotification({
                        title: '删除成功',
                        message: '已删除该行',
                        type: 'info'
                    });
                }
                return;
            }
            
            // 处理动态添加的子行
            const parentRowId = row.dataset.parentRow;
            if (!parentRowId) {
                console.error('未找到父行ID');
                return;
            }
            
            // 获取父行
            const parentRow = document.getElementById(parentRowId);
            if (!parentRow) {
                console.error('未找到父行:', parentRowId);
                return;
            }
            
            // 获取父行的类别单元格
            const categoryCell = parentRow.querySelector('.category');
            if (!categoryCell) {
                console.error('未找到类别单元格');
                // 如果找不到类别单元格，仍然删除此行
                row.remove();
                return;
            }
            
            // 获取当前rowspan值
            const currentRowspan = parseInt(categoryCell.getAttribute('rowspan') || '1');
            
            // 检查是否只有一行（不允许删除唯一的一行）
            if (currentRowspan <= 1) {
                console.log('这是类别的唯一一行，不允许删除');
                if (typeof window.showNotification === 'function') {
                    window.showNotification({
                        title: '无法删除',
                        message: '这是类别的唯一一行，不允许删除',
                        type: 'warning'
                    });
                }
                return;
            }
            
            // 找到所有子行（包括有数据属性和没有数据属性的）
            const allSubRows = [];
            let currentRow = parentRow.nextElementSibling;
            let count = 0;
            
            // 计算该类别下有多少行
            while (currentRow && count < currentRowspan - 1) {
                if (currentRow.dataset.parentRow === parentRowId || 
                    (!currentRow.querySelector('.category') && 
                    !currentRow.dataset.parentRow)) {
                    allSubRows.push(currentRow);
                    count++;
                } else if (currentRow.querySelector('.category')) {
                    // 如果遇到了新的类别行，停止查找
                    break;
                }
                currentRow = currentRow.nextElementSibling;
            }
            
            // 特殊情况：如果要删除的是第一个子行，且有更多子行
            const isFirstSubRow = allSubRows.length > 0 && allSubRows[0].id === rowId;
            if (isFirstSubRow && allSubRows.length > 1) {
                // 找到第二行
                const secondRow = allSubRows[1];
                
                // 获取当前要删除行的所有输入框内容
                const inputBoxes = row.querySelectorAll('.input-box');
                const secondRowInputBoxes = secondRow.querySelectorAll('.input-box');
                
                // 用第二行的数据替换第一行的数据
                for (let i = 0; i < inputBoxes.length && i < secondRowInputBoxes.length; i++) {
                    inputBoxes[i].innerHTML = secondRowInputBoxes[i].innerHTML;
                }
                
                // 删除第二行
                secondRow.remove();
            } else {
                // 正常情况，直接删除行
                row.remove();
            }
            
            // 减少rowspan值
            if (currentRowspan > 1) {
                categoryCell.setAttribute('rowspan', currentRowspan - 1);
            }
            
            // 记录操作到历史记录中（如果需要）
            if (typeof window.recordOperation === 'function') {
                window.recordOperation({
                    type: 'removeSubRow',
                    rowId: rowId,
                    parentRowId: parentRowId,
                    previousRowspan: currentRowspan
                });
            }
            
            // 显示通知
            if (typeof window.showNotification === 'function') {
                window.showNotification({
                    title: '删除成功',
                    message: '已删除该行',
                    type: 'info'
                });
            } else {
                console.log('已删除子行');
            }
        } catch (error) {
            console.error('删除子行时发生错误:', error);
            // 即使出错也显示通知
            if (typeof window.showNotification === 'function') {
                window.showNotification({
                    title: '操作失败',
                    message: '删除行时发生错误',
                    type: 'error'
                });
            }
        }
    },
    
    // 扩展现有的撤销操作函数，支持撤销添加行操作
    extendUndoFunction: function() {
        // 保存原始函数的引用
        if (typeof window.originalUndoLastOperation === 'undefined' && typeof window.undoLastOperation === 'function') {
            window.originalUndoLastOperation = window.undoLastOperation;
            
            // 重新定义撤销函数
            window.undoLastOperation = function() {
                if (!window.operationHistory || window.operationHistory.length === 0) return;
                
                const lastOperation = window.operationHistory[window.operationHistory.length - 1];
                
                if (lastOperation.type === 'addSubRow') {
                    // 先从历史记录中移除该操作
                    window.operationHistory.pop();
                    
                    // 找到添加的行
                    const addedRow = document.getElementById(lastOperation.newRowId);
                    if (addedRow) {
                        // 找到类别行
                        const categoryRow = document.getElementById(lastOperation.categoryRowId);
                        if (categoryRow) {
                            // 找到类别单元格
                            const categoryCell = categoryRow.querySelector('.category');
                            if (categoryCell) {
                                // 恢复原来的rowspan值
                                categoryCell.setAttribute('rowspan', lastOperation.rowspan - 1);
                            }
                        }
                        // 移除添加的行
                        if (addedRow.parentNode) {
                            addedRow.parentNode.removeChild(addedRow);
                        }
                    }
                    
                    // 更新撤销按钮状态
                    if (typeof window.updateUndoButtonState === 'function') {
                        window.updateUndoButtonState();
                    }
                    return;
                } else if (lastOperation.type === 'removeSubRow') {
                    // 先从历史记录中移除该操作
                    window.operationHistory.pop();
                    
                    // 这里应该有恢复子行的逻辑
                    // 由于子行已被删除，此处需要重新创建子行
                    // 此处略过复杂的重建逻辑
                    
                    // 更新撤销按钮状态
                    if (typeof window.updateUndoButtonState === 'function') {
                        window.updateUndoButtonState();
                    }
                    return;
                }
                
                // 调用原始的撤销操作函数处理其他类型的操作
                window.originalUndoLastOperation();
            };
        }
    },
    
    // 隐藏表格行（接口兼容，实际上应该不需要这个方法）
    hideTableRow: function(rowId) {
        console.log('尝试隐藏行:', rowId);
        const row = document.getElementById(rowId);
        if (row) {
            // 仅隐藏而不删除，保持数据结构完整
            row.style.display = 'none';
            
            // 记录操作到历史记录
            if (typeof window.recordOperation === 'function') {
                window.recordOperation({
                    type: 'hideRow',
                    rowId: rowId,
                    previousDisplay: row.style.display || ''
                });
            }
            
            // 显示通知
            if (typeof window.showNotification === 'function') {
                window.showNotification({
                    title: '隐藏成功',
                    message: '已隐藏该行',
                    type: 'info'
                });
            }
        }
    }
};

// 在文档加载完成后延迟初始化，避免阻塞UI渲染
document.addEventListener('DOMContentLoaded', function() {
    // 标记初始化开始
    const initStart = performance.now();
    console.log('文档加载完成，准备初始化添加行功能模块...');
    
    // 立即暴露核心功能，延迟初始化完整功能
    window.addRowFeature = addRowFeature;
    
    // 使用requestIdleCallback在浏览器空闲时初始化（如果支持）
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            addRowFeature.init();
            console.log('添加行功能模块初始化完成，用时:', (performance.now() - initStart).toFixed(2), 'ms');
            // 更新加载进度（如果函数存在）
            if (typeof updateLoadingProgress === 'function') {
                updateLoadingProgress('表格功能初始化完成');
            }
        }, { timeout: 2000 }); // 最多等待2秒
    } else {
        // 降级方案：使用setTimeout
        setTimeout(() => {
            addRowFeature.init();
            console.log('添加行功能模块初始化完成，用时:', (performance.now() - initStart).toFixed(2), 'ms');
            // 更新加载进度（如果函数存在）
            if (typeof updateLoadingProgress === 'function') {
                updateLoadingProgress('表格功能初始化完成');
            }
        }, 800); // 延迟800毫秒，让UI先渲染
    }
});

// 暴露给全局，以便内联onclick事件可以调用
window.addRowFeature = addRowFeature;

// 为了兼容性保留旧的全局函数
function removeSubRow(rowId) {
    return addRowFeature.removeSubRow(rowId);
}

function hideTableRow(rowId) {
    // 获取行元素
    const row = document.getElementById(rowId);
    if (!row) return;
    
    // 设置该行的父行ID属性
    row.dataset.parentRow = rowId;
    
    // 调用removeSubRow进行处理
    return addRowFeature.removeSubRow(rowId);
}
