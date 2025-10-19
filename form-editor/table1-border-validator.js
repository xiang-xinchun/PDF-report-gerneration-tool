/**
 * 表1样式验证脚本
 * 用于验证表1的所有边框样式是否统一
 */

(function() {
    'use strict';

    /**
     * 验证表1样式统一性
     */
    function validateTable1BorderStyle() {
        const table = document.querySelector('#table1-container table');
        if (!table) {
            console.log('表1不存在，跳过验证');
            return;
        }

        const cells = table.querySelectorAll('td, th');
        const borderStyles = new Set();
        const borderColors = new Set();

        cells.forEach(cell => {
            const computedStyle = window.getComputedStyle(cell);
            const borderStyle = computedStyle.borderStyle;
            const borderColor = computedStyle.borderColor;
            
            borderStyles.add(borderStyle);
            borderColors.add(borderColor);
        });

        console.log('=== 表1样式验证报告 ===');
        console.log('边框样式类型数量:', borderStyles.size);
        console.log('边框颜色类型数量:', borderColors.size);
        
        if (borderStyles.size > 1) {
            console.warn('警告：表1中存在不同的边框样式类型:', Array.from(borderStyles));
        }
        
        if (borderColors.size > 2) {
            console.warn('警告：表1中存在过多的边框颜色类型:', Array.from(borderColors));
        }
        
        console.log('表1样式验证完成');
    }

    // 页面加载完成后验证
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(validateTable1BorderStyle, 500);
    });

    // 暴露公共接口
    window.table1BorderValidator = {
        validate: validateTable1BorderStyle
    };
})();