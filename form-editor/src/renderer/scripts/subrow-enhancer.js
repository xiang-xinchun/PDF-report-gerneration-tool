/**
 * 表格子行样式修复脚本
 * 确保子行有正确的边框和内容对齐
 */

document.addEventListener('DOMContentLoaded', function() {
    // 查找并修复已有的子行
    fixExistingSubrows();
    
    // 监听DOM变化，实时修复新添加的子行
    observeTableChanges();
});

/**
 * 修复已有的子行样式
 */
function fixExistingSubrows() {
    document.querySelectorAll('tr.subrow').forEach(applySubrowFixes);
}

/**
 * 应用子行样式修复
 * @param {HTMLElement} subrow - 子行元素
 */
function applySubrowFixes(subrow) {
    // 确保子行有明确的边框
    subrow.style.borderTop = '1px solid #000';
    subrow.style.borderBottom = '1px solid #000';
    
    // 设置所有单元格的边框
    subrow.querySelectorAll('td').forEach(cell => {
        cell.style.border = '1px solid #000';
        cell.style.padding = '8px';
        cell.style.verticalAlign = 'middle';
    });
    
    // 让子类别单元格的内容居中
    const subcategoryCell = subrow.querySelector('.sub-category');
    if (subcategoryCell) {
        const inputBox = subcategoryCell.querySelector('.input-box');
        if (inputBox) {
            inputBox.style.textAlign = 'center';
            inputBox.style.margin = '0 auto';
            inputBox.style.width = '100%';
            inputBox.style.display = 'block';
        }
    }
}

/**
 * 监听表格变化，及时修复新添加的子行
 */
function observeTableChanges() {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    // 检查是否是子行
                    if (node.nodeType === 1 && node.classList.contains('subrow')) {
                        applySubrowFixes(node);
                    }
                    
                    // 检查子节点中的子行
                    if (node.nodeType === 1) {
                        node.querySelectorAll('tr.subrow').forEach(applySubrowFixes);
                    }
                });
            }
        });
    });
    
    // 观察所有表格容器
    document.querySelectorAll('.table-container').forEach(container => {
        observer.observe(container, { childList: true, subtree: true });
    });
}