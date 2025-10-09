/**
 * 表格边框修复器
 * 强制应用统一的表格边框样式
 */

const tableBorderFixer = {
    // 初始化
    init: function() {
        // 立即修复现有表格
        this.fixAllTableBorders();
        
        // 定期检查并修复表格边框
        setInterval(this.fixAllTableBorders.bind(this), 500);
        
        // 在窗口大小调整后修复边框
        window.addEventListener('resize', this.fixAllTableBorders.bind(this));
        
        console.log('表格边框修复器初始化完成');
    },
    
    // 修复所有表格边框
    fixAllTableBorders: function() {
        // 应用到所有表格
        document.querySelectorAll('table').forEach(table => {
            if (!table.style.borderCollapse || table.style.borderCollapse !== 'collapse') {
                table.style.borderCollapse = 'collapse';
            }
            
            if (!table.style.border || table.style.border !== '1px solid #000') {
                table.style.border = '1px solid #000';
            }
        });
        
        // 应用到所有单元格
        document.querySelectorAll('td, th').forEach(cell => {
            if (!cell.style.border || cell.style.border !== '1px solid #000') {
                cell.style.border = '1px solid #000';
            }
        });
        
        // 特别处理子行单元格
        document.querySelectorAll('tr.subrow td').forEach(cell => {
            cell.style.border = '1px solid #000';
            cell.style.borderCollapse = 'collapse';
        });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    tableBorderFixer.init();
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    tableBorderFixer.init();
}