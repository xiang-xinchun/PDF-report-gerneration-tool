/**
 * 表1指标分隔线加粗处理脚本
 * 动态为指标分隔线添加加粗样式
 */

(function() {
    'use strict';

    /**
     * 为表1指标分隔线添加加粗样式
     * 注：样式现在由CSS处理，此函数为兼容性保留
     */
    function enhanceTable1DividerBold() {
        const table = document.querySelector('#table1-container table');
        if (!table) return;

        console.log('表1指标分隔线样式已由CSS统一处理');
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