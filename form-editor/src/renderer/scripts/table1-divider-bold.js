/**
 * 表1指标分隔线加粗处理脚本
 * 动态为指标分隔线添加加粗样式
 */

(function() {
    'use strict';

    /**
     * 为表1指标分隔线添加加粗样式
     */
    function enhanceTable1DividerBold() {
        const table = document.querySelector('#table1-container table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        // 遍历所有行
        const rows = Array.from(tbody.rows);
        for (let i = 0; i < rows.length; i++) {
            const currentRow = rows[i];
            const cells = currentRow.cells;

            // 检查当前行是否包含category单元格
            const categoryCell = Array.from(cells).find(cell => cell.classList.contains('category'));

            if (categoryCell) {
                // 当前行是指标的第一行
                const rowspan = parseInt(categoryCell.getAttribute('rowspan') || '1');

                // 为该指标的最后一行底部添加加粗边框
                if (rowspan > 0 && i + rowspan - 1 < rows.length) {
                    const lastRow = rows[i + rowspan - 1];
                    if (lastRow) {
                        Array.from(lastRow.cells).forEach(cell => {
                            cell.style.borderBottom = '1.5px solid #bbb';
                        });
                    }
                }

                // 为category单元格的左右边框加粗
                categoryCell.style.borderLeft = '1.5px solid #bbb';
                categoryCell.style.borderRight = '1.5px solid #bbb';
            }
        }

        // 为最后一行底部加粗
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
            Array.from(lastRow.cells).forEach(cell => {
                cell.style.borderBottom = '1.5px solid #bbb';
            });
        }

        console.log('表1指标分隔线已调整');
    }

    /**
     * 设置表1变化观察器
     */
    function setupTable1Observer() {
        const table = document.querySelector('#table1-container table');
        if (!table) return;

        const observer = new MutationObserver(() => {
            // 延迟执行，确保DOM更新完成
            setTimeout(enhanceTable1DividerBold, 100);
        });

        observer.observe(table, {
            childList: true,
            subtree: true
        });

        console.log('表1变化观察器已设置');
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        enhanceTable1DividerBold();
        setupTable1Observer();
    });

    // 如果DOM已经加载完成，立即初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        enhanceTable1DividerBold();
        setupTable1Observer();
    }

    // 暴露公共接口
    window.table1DividerBold = {
        enhance: enhanceTable1DividerBold
    };
})();