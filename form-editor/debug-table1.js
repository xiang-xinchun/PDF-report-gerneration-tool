/**
 * 表1调试工具
 * 在浏览器控制台中运行这些函数来检查表1的状态
 */

// 检查表1的结构
function debugTable1Structure() {
    const table1 = document.querySelector('#table1-container table');
    if (!table1) {
        console.error('未找到表1');
        return;
    }

    console.log('=== 表1结构调试 ===');

    // 检查表头
    const headerRow = table1.querySelector('thead tr');
    if (headerRow) {
        const allHeaders = headerRow.querySelectorAll('th');
        const goalHeaders = headerRow.querySelectorAll('.goal-header');
        
        console.log(`表头总列数: ${allHeaders.length}`);
        console.log(`课程目标列数: ${goalHeaders.length}`);
        console.log('表头详细:');
        allHeaders.forEach((th, index) => {
            console.log(`  列${index + 1}: ${th.textContent.trim()} (类: ${th.className})`);
        });
    }

    // 检查第一行数据
    const firstRow = table1.querySelector('tbody tr');
    if (firstRow) {
        const allCells = firstRow.querySelectorAll('td');
        const goalCells = firstRow.querySelectorAll('.goal-cell');
        const deleteCells = firstRow.querySelectorAll('.delete-cell');
        
        console.log(`\n第一行总列数: ${allCells.length}`);
        console.log(`课程目标单元格数: ${goalCells.length}`);
        console.log(`操作列数: ${deleteCells.length}`);
        console.log('第一行详细:');
        allCells.forEach((td, index) => {
            const classes = td.className;
            const content = td.textContent.trim().substring(0, 20);
            console.log(`  列${index + 1}: ${content}... (类: ${classes})`);
        });
    }

    // 检查所有行的列数是否一致
    const allRows = table1.querySelectorAll('tbody tr');
    console.log(`\n所有行的列数检查:`);
    allRows.forEach((row, index) => {
        const totalCells = row.querySelectorAll('td').length;
        const goalCells = row.querySelectorAll('.goal-cell').length;
        console.log(`  行${index + 1}: 总列${totalCells}, 目标列${goalCells}`);
    });
}

// 检查是否有空列
function checkEmptyColumns() {
    const table1 = document.querySelector('#table1-container table');
    if (!table1) {
        console.error('未找到表1');
        return;
    }

    console.log('=== 检查空列 ===');

    const headerRow = table1.querySelector('thead tr');
    const headers = headerRow.querySelectorAll('th');
    
    headers.forEach((th, index) => {
        const isEmpty = th.textContent.trim() === '';
        const hasColspan = th.hasAttribute('colspan');
        const colspan = th.getAttribute('colspan');
        
        if (isEmpty && !hasColspan) {
            console.warn(`⚠️ 表头列${index + 1}为空且无colspan`);
        }
        if (hasColspan) {
            console.log(`列${index + 1}: 空表头 (colspan=${colspan})`);
        }
    });
}

// 修复表1结构
function fixTable1Structure() {
    const table1 = document.querySelector('#table1-container table');
    if (!table1) {
        console.error('未找到表1');
        return;
    }

    console.log('=== 开始修复表1结构 ===');

    // 获取当前实际的课程目标数量
    const goalHeaders = table1.querySelectorAll('.goal-header');
    const actualGoalCount = goalHeaders.length;
    console.log(`实际课程目标数量: ${actualGoalCount}`);

    // 检查每一行的列数
    const rows = table1.querySelectorAll('tbody tr');
    rows.forEach((row, rowIndex) => {
        const goalCells = row.querySelectorAll('.goal-cell');
        
        if (goalCells.length !== actualGoalCount) {
            console.warn(`行${rowIndex + 1}的目标列数(${goalCells.length})与表头不匹配(${actualGoalCount})`);
            
            // 如果列数太多,删除多余的
            if (goalCells.length > actualGoalCount) {
                for (let i = actualGoalCount; i < goalCells.length; i++) {
                    console.log(`  删除第${rowIndex + 1}行的多余列${i + 1}`);
                    goalCells[i].remove();
                }
            }
            
            // 如果列数太少,添加缺少的
            if (goalCells.length < actualGoalCount) {
                console.log(`  第${rowIndex + 1}行缺少${actualGoalCount - goalCells.length}列,需要手动添加`);
            }
        }
    });

    console.log('=== 修复完成 ===');
    debugTable1Structure();
}

// 将函数暴露到全局作用域
window.debugTable1 = {
    structure: debugTable1Structure,
    checkEmpty: checkEmptyColumns,
    fix: fixTable1Structure
};

console.log('表1调试工具已加载。使用方法:');
console.log('  debugTable1.structure() - 查看表1结构');
console.log('  debugTable1.checkEmpty() - 检查空列');
console.log('  debugTable1.fix() - 修复表1结构');
