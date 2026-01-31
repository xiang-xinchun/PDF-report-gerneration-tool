/**
 * 课程目标动态管理模块
 * 功能：动态增删课程目标，同步更新相关表格
 */

(function() {
    'use strict';

    // 全局变量：当前课程目标数量
    let currentGoalCount = 4; // 默认4个目标

    /**
     * 初始化课程目标管理器
     */
    function initGoalManager() {
        console.log('========================================');
        console.log('课程目标管理器初始化开始...');
        console.log('当前document.readyState:', document.readyState);
        
        // 检查DOM是否已加载
        const h2Elements = document.querySelectorAll('h2');
        console.log(`找到 ${h2Elements.length} 个 h2 元素`);
        
    // 添加增删按钮到第二部分
    addGoalControlButtons();

    // 确保表1的课程目标单元格具备统一类名
    normalizeTable1GoalCells();

    // 初始化时统计当前目标数量
        currentGoalCount = countCurrentGoals();
        
        console.log(`当前课程目标数量: ${currentGoalCount}`);
        
        // 更新按钮上的数量显示
        updateGoalCountLabel();
        
        console.log('课程目标管理器初始化完成!');
        console.log('========================================');
    }

    /**
     * 统计当前课程目标数量
     */
    function countCurrentGoals() {
        const goalContainers = document.querySelectorAll('[id^="target"][id$="-container"]');
        return goalContainers.length;
    }

    /**
     * 规范化表1中课程目标单元格的类名
     */
    function normalizeTable1GoalCells() {
        const table1 = document.querySelector('#table1-container table');
        if (!table1) {
            return;
        }

        let patchedCells = 0;
        const bodyCells = table1.querySelectorAll('tbody td');
        bodyCells.forEach(cell => {
            if (cell.querySelector && cell.querySelector('.hml-select')) {
                if (!cell.classList.contains('goal-cell')) {
                    cell.classList.add('goal-cell');
                    patchedCells++;
                }
                if (!cell.classList.contains('table-td')) {
                    cell.classList.add('table-td');
                }
            }
        });

        if (patchedCells > 0) {
            console.log(`[表1校正] 已为 ${patchedCells} 个单元格补充 goal-cell 类名`);
        }
    }

    /**
     * 添加增删按钮到第二部分
     */
    function addGoalControlButtons() {
        // 查找所有h2标签,找到包含"二、课程目标"的那个
        const h2Elements = document.querySelectorAll('h2');
        let section = null;
        
        for (let h2 of h2Elements) {
            if (h2.textContent.includes('二、课程目标')) {
                section = h2;
                break;
            }
        }
        
        if (!section) {
            console.error('未找到"二、课程目标"部分');
            return;
        }

        // 检查是否已经添加过按钮
        if (document.getElementById('goal-control-buttons')) {
            console.log('控制按钮已存在,跳过创建');
            return;
        }

        console.log('找到"二、课程目标"部分,准备添加控制按钮...');

        // 创建按钮容器 - 简洁样式
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'goal-control-buttons';
        buttonContainer.style.cssText = `
            margin: 10px 0;
            padding: 8px 0;
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        // 添加课程目标按钮 - 简洁样式
        const addButton = document.createElement('button');
        addButton.id = 'add-goal-button';
        addButton.textContent = '+ 添加课程目标';
        addButton.title = '添加一个新的课程目标';
        addButton.style.cssText = `
            padding: 6px 12px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
        `;
        addButton.onclick = addGoal;

        // 删除课程目标按钮 - 简洁样式
        const removeButton = document.createElement('button');
        removeButton.id = 'remove-goal-button';
        removeButton.textContent = '- 删除课程目标';
        removeButton.title = '删除最后一个课程目标';
        removeButton.style.cssText = `
            padding: 6px 12px;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
        `;
        removeButton.onclick = removeGoal;

        // 显示当前目标数量 - 简洁样式
        const countLabel = document.createElement('span');
        countLabel.id = 'goal-count-label';
        countLabel.textContent = `当前目标数量: ${currentGoalCount}`;
        countLabel.style.cssText = `
            margin-left: 10px;
            font-size: 13px;
            color: #666;
        `;

        buttonContainer.appendChild(addButton);
        buttonContainer.appendChild(removeButton);
        buttonContainer.appendChild(countLabel);

        // 插入到第二部分标题后面的段落之后
        const paragraph = section.nextElementSibling;
        if (paragraph && paragraph.classList.contains('paragraph')) {
            paragraph.parentNode.insertBefore(buttonContainer, paragraph.nextSibling);
            console.log('控制按钮已添加到页面');
        } else {
            section.parentNode.insertBefore(buttonContainer, section.nextSibling);
            console.log('控制按钮已添加到页面(直接在h2后)');
        }
    }

    /**
     * 更新目标数量显示
     */
    function updateGoalCountLabel() {
        const countLabel = document.getElementById('goal-count-label');
        if (countLabel) {
            countLabel.textContent = `当前目标数量: ${currentGoalCount}`;
        }
    }

    /**
     * 添加课程目标
     */
    function addGoal() {
        const newGoalNumber = currentGoalCount + 1;
        
        // 1. 在第二部分添加新目标
        addGoalToSection2(newGoalNumber);
        
        // 2. 在表1添加新列
        addGoalColumnToTable1(newGoalNumber);
        
        // 3. 在表2添加新列
        addGoalColumnToTable2(newGoalNumber);
        
        // 4. 在表3添加新列
        addGoalColumnToTable3(newGoalNumber);
        
        // 5. 在表5添加新列
        addGoalColumnToTable5(newGoalNumber);
        
        // 6. 在表6添加新行
        addGoalRowToTable6(newGoalNumber);
        
        // 更新目标计数
        currentGoalCount = newGoalNumber;
        updateGoalCountLabel();
        
        // 触发重新计算
        if (window.calculationModule && window.calculationModule.smartCalculate) {
            setTimeout(() => {
                window.calculationModule.smartCalculate();
            }, 100);
        }
        
        // 刷新表1操作按钮
        if (window.table1OperationButtons && window.table1OperationButtons.refresh) {
            setTimeout(() => {
                window.table1OperationButtons.refresh();
            }, 200);
        }
        
        console.log(`已添加课程目标${newGoalNumber}`);
        showNotice(`成功添加课程目标${newGoalNumber}`);
    }

    /**
     * 删除课程目标
     */
    async function removeGoal() {
        if (currentGoalCount <= 1) {
            showNotice('至少需要保留一个课程目标！', 'warning');
            return;
        }

        const goalToRemove = currentGoalCount;
        
        const result = await customConfirm(
            `确定要删除课程目标${goalToRemove}吗？这将同时删除所有相关表格中的对应列/行。`,
            '确认删除课程目标',
            { danger: true, confirmText: '删除', cancelText: '取消' }
        );
        
        if (!result) {
            return;
        }
        
        // 1. 从第二部分删除目标
        removeGoalFromSection2(goalToRemove);
        
        // 2. 从表1删除列
        removeGoalColumnFromTable1(goalToRemove);
        
        // 3. 从表2删除列
        removeGoalColumnFromTable2(goalToRemove);
        
        // 4. 从表3删除列
        removeGoalColumnFromTable3(goalToRemove);
        
        // 5. 从表5删除列
        removeGoalColumnFromTable5(goalToRemove);
        
        // 6. 从表6删除行
        removeGoalRowFromTable6(goalToRemove);
        
        // 更新目标计数
        currentGoalCount = goalToRemove - 1;
        updateGoalCountLabel();
        
        // 触发重新计算
        if (window.calculationModule && window.calculationModule.smartCalculate) {
            setTimeout(() => {
                window.calculationModule.smartCalculate();
            }, 100);
        }
        
        // 刷新表1操作按钮
        if (window.table1OperationButtons && window.table1OperationButtons.refresh) {
            setTimeout(() => {
                window.table1OperationButtons.refresh();
            }, 200);
        }
        
        console.log(`已删除课程目标${goalToRemove}`);
        showNotice(`成功删除课程目标${goalToRemove}`);
        
        // 删除完成后，确保输入框可交互
        if (window._forceInputsInteractive) {
            setTimeout(window._forceInputsInteractive, 100);
            setTimeout(window._forceInputsInteractive, 300);
        }
    }

    /**
     * 在第二部分添加新目标
     */
    function addGoalToSection2(goalNumber) {
        const lastGoalContainer = document.getElementById(`target${goalNumber - 1}-container`);
        if (!lastGoalContainer) {
            console.error(`未找到目标${goalNumber - 1}容器`);
            return;
        }

        const newGoalContainer = document.createElement('div');
        newGoalContainer.className = 'paragraph target-item';
        newGoalContainer.id = `target${goalNumber}-container`;
        
        const goalLabel = document.createElement('span');
        goalLabel.className = 'goal-label';
        goalLabel.textContent = `目标${goalNumber}：`;
        
        const goalText = document.createElement('div');
        goalText.contentEditable = 'true';
        goalText.className = 'editable-text goal-text';
        goalText.id = `target${goalNumber}`;
        goalText.setAttribute('data-placeholder', `请填写目标${goalNumber}`);
        
        newGoalContainer.appendChild(goalLabel);
        newGoalContainer.appendChild(goalText);
        
        lastGoalContainer.parentNode.insertBefore(newGoalContainer, lastGoalContainer.nextSibling);
    }

    /**
     * 从第二部分删除目标
     */
    function removeGoalFromSection2(goalNumber) {
        const goalContainer = document.getElementById(`target${goalNumber}-container`);
        if (goalContainer) {
            goalContainer.remove();
        }
    }

    /**
     * 在表1添加新列
     */
    function addGoalColumnToTable1(goalNumber) {
        normalizeTable1GoalCells();
        const table1 = document.querySelector('#table1-container table');
        if (!table1) return;

        console.log(`向表1添加课程目标${goalNumber}列`);

        // 在表头添加列
        const headerRow = table1.querySelector('thead tr');
        if (headerRow) {
            const newHeader = document.createElement('th');
            newHeader.className = 'table-th goal-header';
            newHeader.innerHTML = `<span class="goal-header-text">课程目标${goalNumber}</span>`;
            
            // 插入到"操作"列之前
            const deleteHeader = headerRow.querySelector('.delete-cell');
            if (deleteHeader) {
                headerRow.insertBefore(newHeader, deleteHeader);
            } else {
                headerRow.appendChild(newHeader);
            }
        }

        // 在每一行添加单元格(包括主行和子行)
        const bodyRows = table1.querySelectorAll('tbody tr');
        bodyRows.forEach(row => {
            const newCell = document.createElement('td');
            newCell.className = 'table-td goal-cell';
            
            const select = document.createElement('select');
            select.className = 'input-box hml-select';
            select.setAttribute('aria-label', `课程目标${goalNumber}支撑强度`);
            
            const options = ['', 'H', 'M', 'L'];
            options.forEach(optValue => {
                const option = document.createElement('option');
                option.value = optValue;
                option.textContent = optValue;
                select.appendChild(option);
            });
            
            newCell.appendChild(select);
            
            // 插入到"操作"列之前
            const deleteCell = row.querySelector('.delete-cell');
            if (deleteCell) {
                row.insertBefore(newCell, deleteCell);
            } else {
                row.appendChild(newCell);
            }
        });

        console.log(`表1添加课程目标${goalNumber}列完成`);
    }

    /**
     * 从表1删除列,并重新编号剩余列
     */
    function removeGoalColumnFromTable1(goalNumber) {
        normalizeTable1GoalCells();
        const table1 = document.querySelector('#table1-container table');
        if (!table1) {
            console.error('未找到表1');
            return;
        }

        console.log(`[表1删除] 删除课程目标${goalNumber}列`);

        // 删除表头列 - 删除最后一个goal-header
        const headerRow = table1.querySelector('thead tr');
        if (headerRow) {
            const headers = headerRow.querySelectorAll('.goal-header');
            console.log(`[表1删除] 当前表头有${headers.length}个目标列`);
            
            if (headers.length > 0) {
                // 删除最后一个目标列
                const lastHeader = headers[headers.length - 1];
                console.log(`[表1删除] 删除表头: ${lastHeader.textContent}`);
                lastHeader.remove();
                
                // 重新编号剩余的列
                const remainingHeaders = headerRow.querySelectorAll('.goal-header');
                console.log(`[表1删除] 删除后剩余${remainingHeaders.length}个目标列`);
                remainingHeaders.forEach((header, index) => {
                    const span = header.querySelector('.goal-header-text');
                    if (span) {
                        span.textContent = `课程目标${index + 1}`;
                    }
                });
            }
        }

        // 删除每一行的最后一个goal-cell
        const bodyRows = table1.querySelectorAll('tbody tr');
        console.log(`[表1删除] 处理${bodyRows.length}个数据行`);
        
        bodyRows.forEach((row, rowIndex) => {
            const goalCells = row.querySelectorAll('.goal-cell');
            console.log(`[表1删除] 第${rowIndex + 1}行有${goalCells.length}个目标单元格`);
            
            if (goalCells.length > 0) {
                // 删除最后一个目标单元格
                const lastCell = goalCells[goalCells.length - 1];
                lastCell.remove();
                
                // 更新剩余单元格的aria-label
                const remainingCells = row.querySelectorAll('.goal-cell');
                remainingCells.forEach((cell, index) => {
                    const select = cell.querySelector('select');
                    if (select) {
                        select.setAttribute('aria-label', `课程目标${index + 1}支撑强度`);
                    }
                });
            }
        });

        console.log('[表1删除] 列删除完成,已重新编号');
    }

    /**
     * 在表2添加新列
     */
    function addGoalColumnToTable2(goalNumber) {
        const table2 = document.querySelector('#table2-container table');
        if (!table2) {
            console.error('未找到表2');
            return;
        }

        console.log(`在表2添加课程目标${goalNumber}列`);

        // 在表头第二行添加列
        const headerRows = table2.querySelectorAll('thead tr');
        if (headerRows.length >= 2) {
            const secondHeaderRow = headerRows[1];
            const newHeader = document.createElement('th');
            newHeader.textContent = `课程目标${goalNumber}`;
            
            // 插入到"操作"列之前(如果有)
            const deleteHeader = secondHeaderRow.querySelector('.delete-cell');
            if (deleteHeader) {
                secondHeaderRow.insertBefore(newHeader, deleteHeader);
            } else {
                secondHeaderRow.appendChild(newHeader);
            }
            
            // 更新第一行的colspan
            const firstHeaderRow = headerRows[0];
            const colspanHeaders = firstHeaderRow.querySelectorAll('th[colspan]');
            // 找到"权重"那一列的colspan
            colspanHeaders.forEach(header => {
                if (header.textContent.includes('权重') || header.cellIndex > 1) {
                    const currentColspan = parseInt(header.getAttribute('colspan')) || 0;
                    header.setAttribute('colspan', currentColspan + 1);
                    console.log(`更新colspan: ${currentColspan} -> ${currentColspan + 1}`);
                }
            });
        }

        // 在每一行添加单元格
        const bodyRows = table2.querySelectorAll('tbody tr');
        bodyRows.forEach((row, index) => {
            const newCell = document.createElement('td');
            const inputDiv = document.createElement('div');
            inputDiv.contentEditable = 'true';
            inputDiv.className = 'input-box';
            inputDiv.id = `weight${index + 1}-${goalNumber}`;
            newCell.appendChild(inputDiv);
            
            // 插入到"操作"列之前
            const deleteCell = row.querySelector('.delete-cell');
            if (deleteCell) {
                row.insertBefore(newCell, deleteCell);
            } else {
                row.appendChild(newCell);
            }
        });

        console.log('表2列添加完成');
    }

    /**
     * 从表2删除列,并重新编号剩余列
     */
    function removeGoalColumnFromTable2(goalNumber) {
        const table2 = document.querySelector('#table2-container table');
        if (!table2) {
            console.error('未找到表2');
            return;
        }

        console.log(`从表2删除课程目标${goalNumber}列`);

        // 删除表头第二行的指定目标列
        const headerRows = table2.querySelectorAll('thead tr');
        if (headerRows.length >= 2) {
            const secondHeaderRow = headerRows[1];
            const headers = Array.from(secondHeaderRow.querySelectorAll('th'));
            
            // 找到所有课程目标列(不包括操作列和前两列)
            const goalHeaders = headers.filter(th => 
                !th.classList.contains('delete-cell') && 
                th.textContent.includes('课程目标')
            );
            
            if (goalHeaders.length >= goalNumber) {
                // 删除指定编号的目标列
                goalHeaders[goalNumber - 1].remove();
                console.log(`删除表头第${goalNumber}列`);
                
                // 重新编号剩余的目标列
                const remainingHeaders = secondHeaderRow.querySelectorAll('th');
                const remainingGoalHeaders = Array.from(remainingHeaders).filter(th => 
                    th.textContent.includes('课程目标')
                );
                remainingGoalHeaders.forEach((header, index) => {
                    header.textContent = `课程目标${index + 1}`;
                });
            }
            
            // 更新第一行的colspan
            const firstHeaderRow = headerRows[0];
            const colspanHeaders = firstHeaderRow.querySelectorAll('th[colspan]');
            colspanHeaders.forEach(header => {
                if (header.textContent.includes('权重') || header.cellIndex > 1) {
                    const currentColspan = parseInt(header.getAttribute('colspan')) || 0;
                    if (currentColspan > 1) {
                        header.setAttribute('colspan', currentColspan - 1);
                        console.log(`更新colspan: ${currentColspan} -> ${currentColspan - 1}`);
                    }
                }
            });
        }

        // 删除每一行的指定权重单元格
        const bodyRows = table2.querySelectorAll('tbody tr');
        bodyRows.forEach((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('td'));
            
            // 找到所有数据单元格(不包括操作列)
            const dataCells = cells.filter(td => !td.classList.contains('delete-cell'));
            
            // 删除指定位置的权重单元格 (前两列是考核方式和满分,所以是index 2+goalNumber-1)
            if (dataCells.length >= 2 + goalNumber) {
                const targetCell = dataCells[1 + goalNumber]; // 1(满分列) + goalNumber
                targetCell.remove();
                
                // 重新设置剩余权重单元格的id
                const remainingDataCells = Array.from(row.querySelectorAll('td'))
                    .filter(td => !td.classList.contains('delete-cell'));
                
                // 跳过前两列(考核方式和满分),重新编号权重列
                for (let i = 2; i < remainingDataCells.length; i++) {
                    const inputDiv = remainingDataCells[i].querySelector('.input-box');
                    if (inputDiv) {
                        inputDiv.id = `weight${rowIndex + 1}-${i - 1}`;
                    }
                }
            }
        });

        console.log('表2列删除完成,已重新编号');
    }

    /**
     * 在表3添加新列
     */
    function addGoalColumnToTable3(goalNumber) {
        const table3 = document.querySelector('#table3-container table');
        if (!table3) return;

        // 在表头添加列
        const headerRow = table3.querySelector('thead tr');
        if (headerRow) {
            const newHeader = document.createElement('th');
            newHeader.textContent = `课程目标${goalNumber}`;
            
            // 插入到"操作"列之前
            const deleteHeader = headerRow.querySelector('.delete-cell');
            if (deleteHeader) {
                headerRow.insertBefore(newHeader, deleteHeader);
            } else {
                headerRow.appendChild(newHeader);
            }
        }

        // 在数据行添加单元格
        const bodyRow = table3.querySelector('tbody tr#weight-value-row');
        if (bodyRow) {
            const newCell = document.createElement('td');
            const valueDiv = document.createElement('div');
            valueDiv.id = `targetWeight${goalNumber}`;
            newCell.appendChild(valueDiv);
            
            // 插入到"操作"列之前
            const deleteCell = bodyRow.querySelector('.delete-cell');
            if (deleteCell) {
                bodyRow.insertBefore(newCell, deleteCell);
            } else {
                bodyRow.appendChild(newCell);
            }
        }
    }

    /**
     * 从表3删除列,并重新编号剩余列
     */
    function removeGoalColumnFromTable3(goalNumber) {
        const table3 = document.querySelector('#table3-container table');
        if (!table3) {
            console.error('未找到表3');
            return;
        }

        console.log(`从表3删除课程目标${goalNumber}列`);

        // 删除表头的指定目标列
        const headerRow = table3.querySelector('thead tr');
        if (headerRow) {
            const headers = Array.from(headerRow.querySelectorAll('th'));
            const goalHeaders = headers.filter(th => 
                !th.classList.contains('delete-cell') && 
                th.textContent.includes('课程目标')
            );
            
            if (goalHeaders.length >= goalNumber) {
                // 删除指定编号的目标列
                goalHeaders[goalNumber - 1].remove();
                console.log(`删除表头第${goalNumber}列`);
                
                // 重新编号剩余的目标列
                const remainingHeaders = Array.from(headerRow.querySelectorAll('th'));
                const remainingGoalHeaders = remainingHeaders.filter(th => 
                    th.textContent.includes('课程目标')
                );
                remainingGoalHeaders.forEach((header, index) => {
                    header.textContent = `课程目标${index + 1}`;
                });
            }
        }

        // 删除数据行的指定目标单元格
        const bodyRow = table3.querySelector('tbody tr#weight-value-row');
        if (bodyRow) {
            const cells = Array.from(bodyRow.querySelectorAll('td'));
            const dataCells = cells.filter(td => !td.classList.contains('delete-cell'));
            
            // 删除指定位置的单元格 (第一列是"权重值"标签,所以是index goalNumber)
            if (dataCells.length > goalNumber) {
                dataCells[goalNumber].remove();
                
                // 重新设置剩余单元格的id
                const remainingDataCells = Array.from(bodyRow.querySelectorAll('td'))
                    .filter(td => !td.classList.contains('delete-cell'));
                
                // 跳过第一列标签,重新编号权重列
                for (let i = 1; i < remainingDataCells.length; i++) {
                    const inputDiv = remainingDataCells[i].querySelector('.input-box');
                    if (inputDiv) {
                        inputDiv.id = `targetWeight${i}`;
                    }
                }
            }
        }

        console.log('表3列删除完成,已重新编号');
    }

    /**
     * 在表5添加新列
     */
    function addGoalColumnToTable5(goalNumber) {
        const table5 = document.querySelector('#table5-container table');
        if (!table5) return;

        // 在表头添加列
        const headerRow = table5.querySelector('thead tr');
        if (headerRow) {
            const newHeader = document.createElement('th');
            newHeader.textContent = `课程目标${goalNumber}`;
            
            // 插入到"操作"列之前
            const deleteHeader = headerRow.querySelector('.delete-cell');
            if (deleteHeader) {
                headerRow.insertBefore(newHeader, deleteHeader);
            } else {
                headerRow.appendChild(newHeader);
            }
        }

        // 在数据行添加单元格
        const bodyRow = table5.querySelector('tbody tr#achievement-row');
        if (bodyRow) {
            const newCell = document.createElement('td');
            const valueDiv = document.createElement('div');
            valueDiv.id = `targetAchieve${goalNumber}`;
            newCell.appendChild(valueDiv);
            
            // 插入到"操作"列之前
            const deleteCell = bodyRow.querySelector('.delete-cell');
            if (deleteCell) {
                bodyRow.insertBefore(newCell, deleteCell);
            } else {
                bodyRow.appendChild(newCell);
            }
        }
    }

    /**
     * 从表5删除列,并重新编号剩余列
     */
    function removeGoalColumnFromTable5(goalNumber) {
        const table5 = document.querySelector('#table5-container table');
        if (!table5) {
            console.error('未找到表5');
            return;
        }

        console.log(`从表5删除课程目标${goalNumber}列`);

        // 删除表头的指定目标列
        const headerRow = table5.querySelector('thead tr');
        if (headerRow) {
            const headers = Array.from(headerRow.querySelectorAll('th'));
            const goalHeaders = headers.filter(th => 
                !th.classList.contains('delete-cell') && 
                th.textContent.includes('课程目标')
            );
            
            if (goalHeaders.length >= goalNumber) {
                // 删除指定编号的目标列
                goalHeaders[goalNumber - 1].remove();
                console.log(`删除表头第${goalNumber}列`);
                
                // 重新编号剩余的目标列
                const remainingHeaders = Array.from(headerRow.querySelectorAll('th'));
                const remainingGoalHeaders = remainingHeaders.filter(th => 
                    th.textContent.includes('课程目标')
                );
                remainingGoalHeaders.forEach((header, index) => {
                    header.textContent = `课程目标${index + 1}`;
                });
            }
        }

        // 删除数据行的指定目标单元格
        const bodyRow = table5.querySelector('tbody tr#achievement-row');
        if (bodyRow) {
            const cells = Array.from(bodyRow.querySelectorAll('td'));
            const dataCells = cells.filter(td => !td.classList.contains('delete-cell'));
            
            // 删除指定位置的单元格 (第一列是"达成度"标签,所以是index goalNumber)
            if (dataCells.length > goalNumber) {
                dataCells[goalNumber].remove();
                
                // 重新设置剩余单元格的id
                const remainingDataCells = Array.from(bodyRow.querySelectorAll('td'))
                    .filter(td => !td.classList.contains('delete-cell'));
                
                // 跳过第一列标签,重新编号达成度列
                for (let i = 1; i < remainingDataCells.length; i++) {
                    const inputDiv = remainingDataCells[i].querySelector('.input-box');
                    if (inputDiv) {
                        inputDiv.id = `achievement${i}`;
                    }
                }
            }
        }

        console.log('表5列删除完成,已重新编号');
    }

    /**
     * 在表6添加新行
     */
    function addGoalRowToTable6(goalNumber) {
        const table6 = document.querySelector('#table6-container table tbody');
        if (!table6) return;

        // 找到最后一个目标行
        const lastRow = table6.querySelector(`tr:nth-child(${goalNumber - 1})`);
        if (!lastRow) return;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>课程目标${goalNumber}</td>
            <td><div id="showWeight${goalNumber}"></div></td>
            <td><div id="showAchieve${goalNumber}"></div></td>
            <td class="delete-cell"><button class="row-delete-button" title="删除此行" onclick="hideTableRow('goal-row-${goalNumber}')">×</button></td>
        `;

        // 插入新行
        lastRow.parentNode.insertBefore(newRow, lastRow.nextSibling);
        
        // 更新rowspan
        const firstRow = table6.querySelector('tr:first-child');
        if (firstRow) {
            const rowspanCell = firstRow.querySelector('td[rowspan]');
            if (rowspanCell) {
                const currentRowspan = parseInt(rowspanCell.getAttribute('rowspan')) || 4;
                rowspanCell.setAttribute('rowspan', currentRowspan + 1);
            }
        }
    }

    /**
     * 从表6删除行,并重新编号剩余行
     */
    function removeGoalRowFromTable6(goalNumber) {
        const table6 = document.querySelector('#table6-container table tbody');
        if (!table6) {
            console.error('未找到表6');
            return;
        }

        console.log(`从表6删除课程目标${goalNumber}行`);

        // 查找所有行
        const allRows = Array.from(table6.querySelectorAll('tr'));
        
        // 找到包含对应目标的行
        const targetRow = allRows.find(row => {
            const firstCell = row.querySelector('td:first-child');
            return firstCell && firstCell.textContent.includes(`课程目标${goalNumber}`);
        });
        
        if (targetRow) {
            console.log(`删除行: ${targetRow.querySelector('td:first-child').textContent}`);
            targetRow.remove();
            
            // 重新编号剩余的课程目标行
            const remainingRows = Array.from(table6.querySelectorAll('tr'));
            let goalIndex = 1;
            remainingRows.forEach(row => {
                const firstCell = row.querySelector('td:first-child');
                if (firstCell && firstCell.textContent.includes('课程目标')) {
                    firstCell.textContent = `课程目标${goalIndex}`;
                    
                    // 更新对应的input id
                    const inputDiv = row.querySelector('.input-box');
                    if (inputDiv) {
                        inputDiv.id = `totalAchievement${goalIndex}`;
                    }
                    
                    goalIndex++;
                }
            });
        } else {
            console.error(`未找到课程目标${goalNumber}对应的行`);
        }

        // 更新rowspan
        const firstRow = table6.querySelector('tr:first-child');
        if (firstRow) {
            const rowspanCell = firstRow.querySelector('td[rowspan]');
            if (rowspanCell) {
                const currentRowspan = parseInt(rowspanCell.getAttribute('rowspan')) || 4;
                rowspanCell.setAttribute('rowspan', Math.max(1, currentRowspan - 1));
                console.log(`更新rowspan: ${currentRowspan} -> ${currentRowspan - 1}`);
            }
        }

        console.log('表6行删除完成,已重新编号');
    }

    /**
     * 显示通知
     */
    function showNotice(message, type = 'success') {
        if (window.showNotification) {
            window.showNotification({
                title: type === 'success' ? '成功' : type === 'warning' ? '警告' : '提示',
                message: message,
                type: type
            });
        } else {
            // 使用自定义对话框代替alert
            customAlert(message, type === 'success' ? '成功' : type === 'warning' ? '警告' : '提示');
        }
    }

    // 导出到全局
    window.goalManager = {
        init: initGoalManager,
        addGoal: addGoal,
        removeGoal: removeGoal,
        getGoalCount: () => currentGoalCount
    };

    // DOM加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 延迟500ms确保所有内容加载完成
            setTimeout(initGoalManager, 500);
        });
    } else {
        // 如果已经加载完成,延迟初始化
        setTimeout(initGoalManager, 500);
    }

})();
