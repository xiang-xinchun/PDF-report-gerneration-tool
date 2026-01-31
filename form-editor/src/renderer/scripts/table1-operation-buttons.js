/**
 * 表1操作按钮模块
 * 添加删除指标、删除分行、添加分行和添加指标的功能
 */

(function() {
    'use strict';
    
    // 监听表格变化的MutationObserver
    let tableObserver = null;
    // 指标切换状态：true-完整指标(11个)，false-基本指标(8个)
    let isFullIndicator = true;
    // 基本指标列表（8个常用）
    const basicIndicators = [
        '师德规范', 
        '教育情怀', 
        '知识整合', 
        '教学能力', 
        '班级指导', 
        '综合育人', 
        '反思研究', 
        '交流合作'
    ];

    // 初始化表1操作按钮
    function initTable1OperationButtons() {
        console.log('正在初始化表1操作按钮...');
        
        // 添加表1顶部的添加指标按钮和切换按钮
        addTable1AddIndicatorButton();
        
        // 添加各指标删除按钮和行删除按钮
        addIndicatorDeleteButtons();
        
        // 添加分行按钮
        addSubrowButtons();
        
        // 添加打印样式，隐藏操作按钮
        addPrintStyles();
        
        // 设置表格列变化监听
        setupTableObserver();
        
        console.log('表1操作按钮初始化完成');
    }
    
    /**
     * 设置表格观察器，监听列变化
     */
    function setupTableObserver() {
        const table = document.querySelector('#table1-container table');
        if (!table) return;
        
        // 如果已有观察器，先断开连接
        if (tableObserver) {
            tableObserver.disconnect();
        }
        
        // 创建新的观察器
        tableObserver = new MutationObserver((mutations) => {
            let columnChanged = false;
            
            for (const mutation of mutations) {
                // 检查是否添加或删除了列
                if (mutation.type === 'childList' && 
                    (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                    // 检查添加或删除的是否是列（th或td）
                    const addedTh = Array.from(mutation.addedNodes).some(node => 
                        node.nodeName === 'TH' || node.nodeName === 'TD');
                    const removedTh = Array.from(mutation.removedNodes).some(node => 
                        node.nodeName === 'TH' || node.nodeName === 'TD');
                    
                    if (addedTh || removedTh) {
                        columnChanged = true;
                        break;
                    }
                }
            }
            
            // 如果列发生变化，重新应用删除按钮
            if (columnChanged) {
                console.log('检测到表1列变化，重新应用删除按钮');
                // 先移除所有现有的删除按钮
                removeAllDeleteButtons();
                // 再添加新的删除按钮
                addIndicatorDeleteButtons();
                addSubrowButtons();
            }
        });
        
        // 开始观察表格变化
        tableObserver.observe(table, { 
            childList: true, 
            subtree: true 
        });
        
        console.log('表格观察器已设置');
    }
    
    /**
     * 移除所有删除按钮
     */
    function removeAllDeleteButtons() {
        // 移除所有指标删除按钮
        const indicatorDeleteButtons = document.querySelectorAll('.delete-indicator-btn');
        indicatorDeleteButtons.forEach(button => button.remove());
        
        // 移除所有行删除按钮
        const rowDeleteButtons = document.querySelectorAll('.delete-row-btn');
        rowDeleteButtons.forEach(button => button.remove());
        
        // 移除所有添加分行按钮
        const addSubrowButtons = document.querySelectorAll('.add-subrow-btn');
        addSubrowButtons.forEach(button => button.remove());
    }

    /**
     * 切换指标显示状态（完整/基本）
     */
    function toggleIndicatorMode() {
        isFullIndicator = !isFullIndicator;
        const toggleBtn = document.getElementById('table1-toggle-indicator-btn');
        const table = document.querySelector('#table1-container table');
        const tbody = table.querySelector('tbody');
        const categoryCells = tbody.querySelectorAll('td.category');
        
        // 更新按钮文本
        toggleBtn.textContent = isFullIndicator ? '切换为基本指标' : '切换为完整指标';
        
        // 遍历所有指标类别单元格，控制对应行的显示/隐藏 + 添加打印类
        categoryCells.forEach(cell => {
            const indicatorName = cell.textContent.trim().replace('×', '').trim();
            const rowspan = parseInt(cell.getAttribute('rowspan') || '1');
            const currentRow = cell.closest('tr');
            const rowIndex = Array.from(tbody.rows).indexOf(currentRow);
            
            // 判断是否为基本指标
            const isBasic = basicIndicators.includes(indicatorName);
            
            // 确定是否显示：完整模式显示所有；基本模式只显示基本指标
            const shouldShow = isFullIndicator ? true : isBasic;
            
            // 控制当前指标的所有行显示/隐藏 + 添加/移除打印隐藏类
            for (let i = 0; i < rowspan; i++) {
                const targetRow = tbody.rows[rowIndex + i];
                if (targetRow) {
                    // 屏幕显示控制
                    targetRow.style.display = shouldShow ? '' : 'none';
                    // 添加/移除打印隐藏类（关键：为打印样式提供标识）
                    if (shouldShow) {
                        targetRow.classList.remove('non-basic-indicator');
                    } else {
                        targetRow.classList.add('non-basic-indicator');
                    }
                }
            }
        });
        
        // 重新渲染按钮（确保显示的行有按钮，隐藏的行按钮被移除）
        refreshTable1Buttons();
    }

    /**
     * 添加表1顶部的添加指标按钮和切换按钮
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
            gap: 10px;
            margin-bottom: 10px;
            align-items: center;
        `;
        
        // 创建添加指标按钮
        const addButton = document.createElement('button');
        addButton.id = 'table1-add-indicator-btn';
        addButton.textContent = '+ 添加指标';
        addButton.className = 'table1-add-indicator-btn';
        addButton.onclick = addNewIndicator;
        
        // 创建指标切换按钮
        const toggleButton = document.createElement('button');
        toggleButton.id = 'table1-toggle-indicator-btn';
        toggleButton.textContent = '切换为基本指标';
        toggleButton.className = 'table1-toggle-indicator-btn';
        toggleButton.onclick = toggleIndicatorMode;
        
        // 将按钮添加到容器
        buttonContainer.appendChild(addButton);
        buttonContainer.appendChild(toggleButton);
        
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
        
        // 为每个类别单元格添加删除按钮（仅显示的行）
        categoryCells.forEach(cell => {
            const row = cell.closest('tr');
            // 跳过隐藏的行
            if (row.style.display === 'none') return;
            
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
        
        // 为所有显示的行添加删除按钮（不包括表头）
        const rows = table1.querySelectorAll('tbody tr');
        rows.forEach(row => {
            // 跳过隐藏的行
            if (row.style.display === 'none') return;
            
            // 如果已经有删除按钮，则不再添加
            if (row.querySelector('.delete-row-btn')) return;
            
            // 获取最后一个单元格（确保是课程目标单元格）
            const goalCells = row.querySelectorAll('.goal-cell');
            if (goalCells.length === 0) return;
            
            // 使用最后一个课程目标单元格
            const lastCell = goalCells[goalCells.length - 1];
            
            // 创建删除行按钮
            const deleteRowButton = document.createElement('button');
            deleteRowButton.className = 'delete-row-btn';
            deleteRowButton.innerHTML = '×';
            deleteRowButton.title = '删除该分行';
            deleteRowButton.onclick = function() {
                deleteRow(this.closest('tr'));
            };
            
            // 将按钮添加到最后一个课程目标单元格
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
        
        // 为每个显示的指标单元格的父元素添加添加分行按钮
        indicatorCells.forEach(input => {
            const cell = input.parentElement;
            const row = cell.closest('tr');
            
            // 跳过隐藏的行
            if (row.style.display === 'none') return;
            
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
                .table1-toggle-indicator-btn,
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
        // 新添加的指标默认显示（无论当前是完整/基本模式）
        newRow.style.display = '';
        
        // 创建指标类别单元格
        const categoryCell = document.createElement('td');
        categoryCell.className = 'table-td category';
        categoryCell.setAttribute('rowspan', '1');
        categoryCell.style.cssText = 'position:relative; vertical-align: middle;';
        
        // 创建可编辑的类别名称
        const categoryInput = document.createElement('div');
        categoryInput.contentEditable = 'true';
        categoryInput.className = 'input-box indicator-input';
        categoryInput.style.cssText = 'width: 100%; min-width: 60px;';
        categoryInput.textContent = '';
        categoryCell.appendChild(categoryInput);
        
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
        indicatorInput.textContent = '';
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
        const goalCells = newRow.querySelectorAll('.goal-cell');
        if (goalCells.length > 0) {
            const lastGoalCell = goalCells[goalCells.length - 1];
            const deleteRowButton = document.createElement('button');
            deleteRowButton.className = 'delete-row-btn';
            deleteRowButton.innerHTML = '×';
            deleteRowButton.title = '删除该分行';
            deleteRowButton.onclick = function() {
                deleteRow(this.closest('tr'));
            };
            lastGoalCell.appendChild(deleteRowButton);
        }
        
        // 将新行添加到表格
        tbody.appendChild(newRow);
    }

    /**
     * 删除指标（及所有相关分行）
     * @param {HTMLElement} row 指标行元素
     */
    async function deleteIndicator(row) {
        if (!row) return;
        
        // 确认删除
        const result = await customConfirm(
            '确定要删除该指标及其所有分行吗？',
            '确认删除指标',
            { danger: true, confirmText: '删除', cancelText: '取消' }
        );
        
        if (!result) {
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
        
        // 删除后刷新按钮状态
        refreshTable1Buttons();
    }

    /**
     * 删除单行
     * @param {HTMLElement} row 行元素
     */
    async function deleteRow(row) {
        if (!row) return;
        
        // 确认删除
        const result = await customConfirm(
            '确定要删除该行吗？',
            '确认删除',
            { danger: true, confirmText: '删除', cancelText: '取消' }
        );
        
        if (!result) {
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
                    
                    // 创建可编辑的类别名称
                    const categoryInput = document.createElement('div');
                    categoryInput.contentEditable = 'true';
                    categoryInput.className = 'input-box indicator-input';
                    categoryInput.style.cssText = 'width: 100%; min-width: 60px;';
                    // 从原类别单元格中提取文本内容（去掉删除按钮）
                    const originalText = categoryCell.textContent.replace('×', '').trim();
                    categoryInput.textContent = originalText;
                    newCategoryCell.appendChild(categoryInput);
                    
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
        
        // 删除后刷新按钮状态
        refreshTable1Buttons();
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
        // 新分行继承当前指标行的显示状态
        newRow.style.display = row.style.display;
        
        // 获取课程目标数量
        const goalCount = table.querySelectorAll('thead .goal-header').length;
        
        // 创建指标名称单元格
        const indicatorCell = document.createElement('td');
        indicatorCell.className = 'table-td';
        
        // 添加可编辑的指标名称输入框
        const indicatorInput = document.createElement('div');
        indicatorInput.contentEditable = 'true';
        indicatorInput.className = 'input-box indicator-input';
        indicatorInput.textContent = '';
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
        const goalCells = newRow.querySelectorAll('.goal-cell');
        if (goalCells.length > 0) {
            const lastGoalCell = goalCells[goalCells.length - 1];
            const deleteRowButton = document.createElement('button');
            deleteRowButton.className = 'delete-row-btn';
            deleteRowButton.innerHTML = '×';
            deleteRowButton.title = '删除该分行';
            deleteRowButton.onclick = function() {
                deleteRow(this.closest('tr'));
            };
            lastGoalCell.appendChild(deleteRowButton);
        }
        
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

    /**
     * 重新应用表1按钮
     * 在表格结构变化后调用此函数来重新应用所有按钮
     */
    function refreshTable1Buttons() {
        // 移除所有现有按钮
        removeAllDeleteButtons();
        
        // 重新添加所有按钮（仅显示的行）
        addIndicatorDeleteButtons();
        addSubrowButtons();
        
        // 刷新表1指标分隔线加粗
        if (window.table1DividerBold && window.table1DividerBold.enhance) {
            window.table1DividerBold.enhance();
        }
        
        console.log('表1操作按钮已刷新');
    }
    
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initTable1OperationButtons);
    
    // 如果DOM已经加载完成，立即初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initTable1OperationButtons();
    }
    
    // 暴露公共接口
    window.table1OperationButtons = {
        refresh: refreshTable1Buttons,
        toggleIndicatorMode: toggleIndicatorMode // 暴露切换方法（可选）
    };
})();