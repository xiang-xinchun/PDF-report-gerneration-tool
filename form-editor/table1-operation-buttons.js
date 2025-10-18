/**
 * 表1操作按钮模块
 * 添加删除指标、删除分行、添加分行和添加指标的功能
 */

(function() {
    'use strict';

    // 初始化表1操作按钮
    function initTable1OperationButtons() {
        console.log('正在初始化表1操作按钮...');
        
        // 添加表1顶部的添加指标按钮
        addTable1AddIndicatorButton();
        
        // 添加各指标删除按钮和行删除按钮
        addIndicatorDeleteButtons();
        
        // 添加分行按钮
        addSubrowButtons();
        
        // 添加打印样式，隐藏操作按钮
        addPrintStyles();
        
        console.log('表1操作按钮初始化完成');
    }

    /**
     * 添加表1顶部的添加指标按钮
     */
    function addTable1AddIndicatorButton() {
        const table1Container = document.getElementById('table1-container');
        if (!table1Container) return;
        
        // 检查是否已经存在添加指标按钮
        if (document.getElementById('table1-add-indicator-btn')) {
            return;
        }
        
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'table1-operation-container';
        buttonContainer.style.cssText = `
            display: flex;
            margin-bottom: 10px;
        `;
        
        // 创建添加指标按钮
        const addButton = document.createElement('button');
        addButton.id = 'table1-add-indicator-btn';
        addButton.textContent = '+ 添加指标';
        addButton.className = 'table1-add-indicator-btn';
        addButton.onclick = addNewIndicator;
        
        // 将按钮添加到容器
        buttonContainer.appendChild(addButton);
        
        // 插入到表格之前
        table1Container.insertBefore(buttonContainer, table1Container.firstChild);
    }

    /**
     * 添加指标删除按钮和行删除按钮
     */
    function addIndicatorDeleteButtons() {
        const table1 = document.querySelector('#table1-container table');
        if (!table1) return;
        
        // 获取所有类别单元格（第一列）
        const categoryCells = table1.querySelectorAll('td.category');
        
        // 为每个类别单元格添加删除按钮
        categoryCells.forEach(cell => {
            // 如果已经有删除按钮，则不再添加
            if (cell.querySelector('.delete-indicator-btn')) return;
            
            // 创建删除指标按钮
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-indicator-btn';
            deleteButton.innerHTML = '×';
            deleteButton.title = '删除该指标及所有分行';
            deleteButton.onclick = function() {
                deleteIndicator(this.closest('tr'));
            };
            
            // 将按钮添加到单元格
            cell.appendChild(deleteButton);
        });
        
        // 为所有行添加删除按钮（不包括表头）
        const rows = table1.querySelectorAll('tbody tr');
        rows.forEach(row => {
            // 如果已经有删除按钮，则不再添加
            if (row.querySelector('.delete-row-btn')) return;
            
            // 获取最后一个单元格
            const lastCell = row.cells[row.cells.length - 1];
            
            // 创建删除行按钮
            const deleteRowButton = document.createElement('button');
            deleteRowButton.className = 'delete-row-btn';
            deleteRowButton.innerHTML = '×';
            deleteRowButton.title = '删除该分行';
            deleteRowButton.onclick = function() {
                deleteRow(this.closest('tr'));
            };
            
            // 将按钮添加到最后一个单元格
            lastCell.appendChild(deleteRowButton);
        });
    }

    /**
     * 添加分行按钮
     */
    function addSubrowButtons() {
        const table1 = document.querySelector('#table1-container table');
        if (!table1) return;
        
        // 获取所有指标单元格（第二列）
        const indicatorCells = table1.querySelectorAll('td .indicator-input');
        
        // 为每个指标单元格的父元素添加添加分行按钮
        indicatorCells.forEach(input => {
            const cell = input.parentElement;
            
            // 如果已经有添加分行按钮，则不再添加
            if (cell.querySelector('.add-subrow-btn')) return;
            
            // 创建添加分行按钮
            const addSubrowButton = document.createElement('button');
            addSubrowButton.className = 'add-subrow-btn';
            addSubrowButton.innerHTML = '+';
            addSubrowButton.title = '添加分行';
            addSubrowButton.onclick = function() {
                addSubrow(this.closest('tr'));
            };
            
            // 将按钮添加到单元格
            cell.appendChild(addSubrowButton);
        });
    }

    /**
     * 添加打印样式，用于隐藏操作按钮
     */
    function addPrintStyles() {
        // 检查是否已添加打印样式
        if (document.getElementById('table1-operation-print-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'table1-operation-print-styles';
        styleElement.textContent = `
            @media print {
                .delete-indicator-btn,
                .delete-row-btn,
                .add-subrow-btn,
                .table1-add-indicator-btn,
                .table1-operation-container {
                    display: none !important;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    /**
     * 添加新指标
     */
    function addNewIndicator() {
        const table1 = document.querySelector('#table1-container table');
        if (!table1) return;
        
        // 获取表体
        const tbody = table1.querySelector('tbody');
        
        // 获取当前最后一个指标的行
        const lastIndicatorRow = tbody.rows[tbody.rows.length - 1];
        
        // 获取当前目标数量
        const goalCount = table1.querySelectorAll('thead .goal-header').length;
        
        // 创建新指标的行
        const newRow = document.createElement('tr');
        newRow.id = `table-row-${tbody.rows.length + 1}-1`;
        
        // 创建指标类别单元格
        const categoryCell = document.createElement('td');
        categoryCell.className = 'table-td category';
        categoryCell.setAttribute('rowspan', '1');
        categoryCell.style.cssText = 'position:relative; vertical-align: middle;';
        categoryCell.textContent = '新指标类别';
        
        // 添加删除指标按钮
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-indicator-btn';
        deleteButton.innerHTML = '×';
        deleteButton.title = '删除该指标及所有分行';
        deleteButton.onclick = function() {
            deleteIndicator(this.closest('tr'));
        };
        categoryCell.appendChild(deleteButton);
        
        // 添加指标类别单元格
        newRow.appendChild(categoryCell);
        
        // 创建指标名称单元格
        const indicatorCell = document.createElement('td');
        indicatorCell.className = 'table-td';
        
        // 添加可编辑的指标名称输入框
        const indicatorInput = document.createElement('div');
        indicatorInput.contentEditable = 'true';
        indicatorInput.className = 'input-box indicator-input';
        indicatorInput.textContent = '新指标';
        indicatorCell.appendChild(indicatorInput);
        
        // 添加添加分行按钮
        const addSubrowButton = document.createElement('button');
        addSubrowButton.className = 'add-subrow-btn';
        addSubrowButton.innerHTML = '+';
        addSubrowButton.title = '添加分行';
        addSubrowButton.onclick = function() {
            addSubrow(this.closest('tr'));
        };
        indicatorCell.appendChild(addSubrowButton);
        
        // 添加指标名称单元格
        newRow.appendChild(indicatorCell);
        
        // 添加课程目标单元格
        for (let i = 0; i < goalCount; i++) {
            const goalCell = document.createElement('td');
            goalCell.className = 'table-td goal-cell';
            
            // 添加HML选择下拉框
            const select = document.createElement('select');
            select.className = 'input-box hml-select';
            select.setAttribute('aria-label', `课程目标${i+1}支撑强度`);
            
            // 添加选项
            const options = ['', 'H', 'M', 'L'];
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
            
            goalCell.appendChild(select);
            newRow.appendChild(goalCell);
        }
        
        // 创建删除行按钮
        const lastCell = newRow.cells[newRow.cells.length - 1];
        const deleteRowButton = document.createElement('button');
        deleteRowButton.className = 'delete-row-btn';
        deleteRowButton.innerHTML = '×';
        deleteRowButton.title = '删除该分行';
        deleteRowButton.onclick = function() {
            deleteRow(this.closest('tr'));
        };
        lastCell.appendChild(deleteRowButton);
        
        // 将新行添加到表格
        tbody.appendChild(newRow);
    }

    /**
     * 删除指标（及所有相关分行）
     * @param {HTMLElement} row 指标行元素
     */
    function deleteIndicator(row) {
        if (!row) return;
        
        // 确认删除
        if (!confirm('确定要删除该指标及其所有分行吗？')) {
            return;
        }
        
        const table = row.closest('table');
        const tbody = table.querySelector('tbody');
        
        // 获取指标类别单元格的rowspan值，表示该指标有多少行
        const categoryCell = row.querySelector('td.category');
        if (!categoryCell) return;
        
        const rowspan = parseInt(categoryCell.getAttribute('rowspan') || '1');
        
        // 当前行索引
        const rowIndex = row.rowIndex;
        
        // 删除该指标的所有行
        for (let i = 0; i < rowspan; i++) {
            // 每次都删除相同索引的行，因为删除一行后，后面的行会自动前移
            tbody.deleteRow(rowIndex - 1); // rowIndex是从1开始的，而deleteRow从0开始
        }
    }

    /**
     * 删除单行
     * @param {HTMLElement} row 行元素
     */
    function deleteRow(row) {
        if (!row) return;
        
        // 确认删除
        if (!confirm('确定要删除该行吗？')) {
            return;
        }
        
        const table = row.closest('table');
        const tbody = table.querySelector('tbody');
        
        // 检查该行是否是指标的第一行（含有类别单元格）
        const categoryCell = row.querySelector('td.category');
        if (categoryCell) {
            // 如果是指标的第一行，检查rowspan
            const rowspan = parseInt(categoryCell.getAttribute('rowspan') || '1');
            
            if (rowspan > 1) {
                // 有多行，将类别单元格移到下一行
                const rowIndex = row.rowIndex;
                const nextRow = tbody.rows[rowIndex - 1 + 1]; // rowIndex从1开始计数
                
                if (nextRow) {
                    // 在下一行的开头插入类别单元格
                    const newCategoryCell = document.createElement('td');
                    newCategoryCell.className = 'table-td category';
                    newCategoryCell.setAttribute('rowspan', (rowspan - 1).toString());
                    newCategoryCell.style.cssText = 'position:relative; vertical-align: middle;';
                    newCategoryCell.textContent = categoryCell.textContent.replace('×', '').trim(); // 复制文本，不包含删除按钮
                    
                    // 添加删除指标按钮
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-indicator-btn';
                    deleteButton.innerHTML = '×';
                    deleteButton.title = '删除该指标及所有分行';
                    deleteButton.onclick = function() {
                        deleteIndicator(this.closest('tr'));
                    };
                    newCategoryCell.appendChild(deleteButton);
                    
                    // 插入到下一行的开头
                    nextRow.insertBefore(newCategoryCell, nextRow.firstChild);
                }
            }
        } else {
            // 如果不是指标的第一行，需要减少相应指标类别单元格的rowspan值
            // 查找该行所属的指标类别单元格
            let prevRow = row;
            while (prevRow) {
                prevRow = prevRow.previousElementSibling;
                if (!prevRow) break;
                
                const categoryCellInPrevRow = prevRow.querySelector('td.category');
                if (categoryCellInPrevRow) {
                    // 找到了指标类别单元格，减少rowspan值
                    const rowspan = parseInt(categoryCellInPrevRow.getAttribute('rowspan') || '1');
                    if (rowspan > 1) {
                        categoryCellInPrevRow.setAttribute('rowspan', (rowspan - 1).toString());
                    }
                    break;
                }
            }
        }
        
        // 删除行
        tbody.deleteRow(row.rowIndex - 1); // rowIndex从1开始，deleteRow从0开始
    }

    /**
     * 添加分行
     * @param {HTMLElement} row 当前行元素
     */
    function addSubrow(row) {
        if (!row) return;
        
        const table = row.closest('table');
        const tbody = table.querySelector('tbody');
        
        // 获取当前行的索引
        const rowIndex = Array.from(tbody.rows).indexOf(row);
        
        // 查找当前行所属的指标类别单元格
        let categoryCell = row.querySelector('td.category');
        let categoryRowIndex = rowIndex;
        
        if (!categoryCell) {
            // 如果当前行不包含类别单元格，向上查找
            let prevRow = row;
            while (!categoryCell && prevRow) {
                prevRow = prevRow.previousElementSibling;
                if (prevRow) {
                    categoryCell = prevRow.querySelector('td.category');
                    if (categoryCell) {
                        categoryRowIndex = Array.from(tbody.rows).indexOf(prevRow);
                    }
                }
            }
        }
        
        if (!categoryCell) return;
        
        // 增加指标类别单元格的rowspan值
        const rowspan = parseInt(categoryCell.getAttribute('rowspan') || '1');
        categoryCell.setAttribute('rowspan', (rowspan + 1).toString());
        
        // 创建新行
        const newRow = document.createElement('tr');
        newRow.id = `table-row-${categoryRowIndex + 1}-${rowspan + 1}`;
        
        // 获取课程目标数量
        const goalCount = table.querySelectorAll('thead .goal-header').length;
        
        // 创建指标名称单元格
        const indicatorCell = document.createElement('td');
        indicatorCell.className = 'table-td';
        
        // 添加可编辑的指标名称输入框
        const indicatorInput = document.createElement('div');
        indicatorInput.contentEditable = 'true';
        indicatorInput.className = 'input-box indicator-input';
        indicatorInput.textContent = '新分行';
        indicatorCell.appendChild(indicatorInput);
        
        // 添加添加分行按钮
        const addSubrowButton = document.createElement('button');
        addSubrowButton.className = 'add-subrow-btn';
        addSubrowButton.innerHTML = '+';
        addSubrowButton.title = '添加分行';
        addSubrowButton.onclick = function() {
            addSubrow(this.closest('tr'));
        };
        indicatorCell.appendChild(addSubrowButton);
        
        // 添加指标名称单元格
        newRow.appendChild(indicatorCell);
        
        // 添加课程目标单元格
        for (let i = 0; i < goalCount; i++) {
            const goalCell = document.createElement('td');
            goalCell.className = 'table-td goal-cell';
            
            // 添加HML选择下拉框
            const select = document.createElement('select');
            select.className = 'input-box hml-select';
            select.setAttribute('aria-label', `课程目标${i+1}支撑强度`);
            
            // 添加选项
            const options = ['', 'H', 'M', 'L'];
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
            
            goalCell.appendChild(select);
            newRow.appendChild(goalCell);
        }
        
        // 创建删除行按钮
        const lastCell = newRow.cells[newRow.cells.length - 1];
        const deleteRowButton = document.createElement('button');
        deleteRowButton.className = 'delete-row-btn';
        deleteRowButton.innerHTML = '×';
        deleteRowButton.title = '删除该分行';
        deleteRowButton.onclick = function() {
            deleteRow(this.closest('tr'));
        };
        lastCell.appendChild(deleteRowButton);
        
        // 确定插入位置：在当前行的后面插入
        const insertBeforeRow = row.nextElementSibling;
        
        if (insertBeforeRow) {
            // 在指定行前插入
            tbody.insertBefore(newRow, insertBeforeRow);
        } else {
            // 在表格末尾添加
            tbody.appendChild(newRow);
        }
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initTable1OperationButtons);
    
    // 如果DOM已经加载完成，立即初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initTable1OperationButtons();
    }
})();