// 操作历史记录栈，用于撤销功能
const operationHistory = [];
const MAX_HISTORY = 50; // 最大历史记录数量

// 删除可编辑项的功能
function hideEditableItem(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        // 记录操作到历史记录中，以便撤销
        recordOperation({
            type: 'hideEditableItem',
            containerId: containerId,
            previousDisplay: container.style.display,
            previousContainerHTML: container.outerHTML
        });
        
        // 隐藏元素而不是完全移除，以便于在需要时恢复
        container.style.display = 'none';
        
        // 保存状态到 localStorage
        localStorage.setItem('hidden_' + containerId, 'true');
        
        // 保留元素的内容
        const inputElement = container.querySelector('[contenteditable="true"]');
        if (inputElement && inputElement.id) {
            // 仍然保存内容，以便在恢复时使用
            localStorage.setItem('report_' + inputElement.id, inputElement.textContent);
        }
        
        // 如果是目标项，则重排序后续的目标
        if (containerId.startsWith('target') && containerId.endsWith('-container')) {
            reorderTargets();
        }
    }
}

// 重新排序课程目标
function reorderTargets() {
    // 找出所有目标容器元素
    const targetContainers = Array.from(document.querySelectorAll('[id^="target"][id$="-container"]'));
    
    // 找出所有目标的原始编号和顺序，包括隐藏的
    const allTargetsInfo = targetContainers.map(container => {
        const num = parseInt(container.id.match(/\d+/)[0]);
        const isHidden = container.style.display === 'none' || 
                         localStorage.getItem('hidden_' + container.id) === 'true';
        return {
            element: container,
            number: num,
            isHidden: isHidden
        };
    });
    
    // 过滤出可见的目标容器
    const visibleTargets = allTargetsInfo.filter(info => !info.isHidden);
    
    // 排序可见容器，确保按照原始顺序
    visibleTargets.sort((a, b) => a.number - b.number);
    
    // 记录目标重排映射（老编号 -> 新编号）
    const targetMappings = {};
    
    // 更新目标文本和数据属性
    visibleTargets.forEach((info, index) => {
        const newTargetNumber = index + 1;
        const oldTargetNumber = info.number;
        
        // 记录映射关系
        targetMappings[oldTargetNumber] = newTargetNumber;
        
        const container = info.element;
        
        // 更新目标标题文本
        const textNode = Array.from(container.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) {
            textNode.nodeValue = `目标${newTargetNumber}：`;
        }
    });
    
    // 更新所有表格中的课程目标标题和数据
    updateTableHeaders(targetMappings);
    
    // 更新其他相关元素中的目标编号
    updateOtherTargetReferences(targetMappings);
}

// 更新表格中的标题和列数据
function updateTableHeaders(targetMappings) {
    // 处理所有表格
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        // 获取所有表头行
        const headerRows = table.querySelectorAll('thead tr');
        
        headerRows.forEach(row => {
            // 跳过操作列和前置列（如"指标点"列）
            const headerCells = Array.from(row.querySelectorAll('th')).filter((cell, index) => {
                // 排除第一列和最后一列（通常是标签列和操作列）
                return index > 0 && index < row.querySelectorAll('th').length - 1;
            });
            
            // 只处理包含"课程目标X"的表头
            headerCells.forEach(cell => {
                const match = cell.textContent.match(/课程目标(\d+)/);
                if (match) {
                    const oldTargetNumber = parseInt(match[1]);
                    if (targetMappings[oldTargetNumber]) {
                        cell.textContent = `课程目标${targetMappings[oldTargetNumber]}`;
                    } else {
                        // 如果这个目标被删除了，隐藏这一列
                        const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
                        hideTableColumn(table, columnIndex);
                    }
                }
            });
        });
    });
}

// 隐藏表格中的某一列
function hideTableColumn(table, columnIndex) {
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length > columnIndex) {
            cells[columnIndex].style.display = 'none';
        }
    });
}

// 记录操作到历史记录栈中
function recordOperation(operation) {
    // 限制历史记录大小
    if (operationHistory.length >= MAX_HISTORY) {
        operationHistory.shift(); // 移除最旧的记录
    }
    
    // 添加时间戳
    operation.timestamp = new Date().getTime();
    
    // 添加到历史记录
    operationHistory.push(operation);
    
    // 更新撤销按钮状态
    updateUndoButtonState();
}

// 更新其他涉及课程目标的引用
function updateOtherTargetReferences(targetMappings = {}) {
    // 找出所有包含"课程目标X"或"目标X"文本的元素
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
        // 跳过我们已经处理过的目标容器和表格标题
        if (element.id && (element.id.startsWith('target') || element.tagName === 'TH')) {
            return;
        }
        
        // 检查元素中是否有课程目标相关的文本
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.nodeValue;
                
                // 匹配"课程目标X"或"目标X"的格式
                const courseTargetMatch = text.match(/课程目标(\d+)/g);
                const targetMatch = text.match(/目标(\d+)/g);
                
                if (courseTargetMatch || targetMatch) {
                    let newText = text;
                    
                    // 处理"课程目标X"格式
                    if (courseTargetMatch) {
                        courseTargetMatch.forEach(match => {
                            const num = parseInt(match.match(/\d+/)[0]);
                            if (targetMappings[num]) {
                                newText = newText.replace(
                                    new RegExp(`课程目标${num}`, 'g'), 
                                    `课程目标${targetMappings[num]}`
                                );
                            }
                        });
                    }
                    
                    // 处理"目标X"格式（不是目标容器内部）
                    if (targetMatch && !element.closest('[id^="target"][id$="-container"]')) {
                        targetMatch.forEach(match => {
                            const num = parseInt(match.match(/\d+/)[0]);
                            if (targetMappings[num]) {
                                newText = newText.replace(
                                    new RegExp(`目标${num}(?!-)`, 'g'), 
                                    `目标${targetMappings[num]}`
                                );
                            }
                        });
                    }
                    
                    // 如果有更改，更新文本
                    if (newText !== text) {
                        node.nodeValue = newText;
                    }
                }
            }
        }
    });
    
    // 更新data-placeholder属性中的目标编号
    document.querySelectorAll('[data-placeholder^="请填写目标"]').forEach(element => {
        const placeholder = element.getAttribute('data-placeholder');
        const match = placeholder.match(/请填写目标(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            if (targetMappings[num]) {
                element.setAttribute('data-placeholder', `请填写目标${targetMappings[num]}`);
            }
        }
    });
}

// 计算当前可见的目标数量
function countVisibleTargets() {
    const targetContainers = Array.from(document.querySelectorAll('[id^="target"][id$="-container"]'));
    return targetContainers.filter(container => {
        return container.style.display !== 'none' && 
               localStorage.getItem('hidden_' + container.id) !== 'true';
    }).length;
}

// 撤销上一次操作
function undoLastOperation() {
    if (operationHistory.length === 0) {
        // 没有可撤销的操作
        showNotification('提示', '没有可撤销的操作');
        return;
    }
    
    const lastOperation = operationHistory.pop();
    
    // 根据操作类型执行相应的撤销
    switch (lastOperation.type) {
        case 'hideEditableItem':
            // 恢复被隐藏的可编辑项
            const container = document.getElementById(lastOperation.containerId);
            if (container) {
                container.style.display = lastOperation.previousDisplay || '';
                localStorage.removeItem('hidden_' + lastOperation.containerId);
                
                // 如果是目标项，需要重排序
                if (lastOperation.containerId.startsWith('target') && lastOperation.containerId.endsWith('-container')) {
                    reorderTargets();
                }
            }
            break;
            
        case 'hideTableRow':
            // 恢复被隐藏的表格行
            const row = document.getElementById(lastOperation.rowId);
            if (row) {
                row.style.display = lastOperation.previousDisplay || '';
                localStorage.removeItem('hidden_row_' + lastOperation.rowId);
            }
            break;
            
        default:
            console.warn('未知的操作类型:', lastOperation.type);
    }
    
    // 更新撤销按钮状态
    updateUndoButtonState();
    
    // 显示撤销成功通知
    showNotification('成功', '已撤销上一次操作');
}

// 更新撤销按钮状态
function updateUndoButtonState() {
    const undoButton = document.getElementById('undo-button');
    if (undoButton) {
        undoButton.disabled = operationHistory.length === 0;
    }
}

// 显示通知
function showNotification(title, message) {
    // 如果页面中有Toast组件，使用它
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toast = document.getElementById('notification-toast');
    
    if (toastTitle && toastMessage && toast) {
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // 显示自定义Toast通知
        toast.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    } else {
        // 否则使用简单的alert
        console.log(`${title}: ${message}`);
    }
}

// 恢复之前隐藏的可编辑项和表格行
function restoreHiddenItems() {
    // 查找所有具有ID并以-container结尾的元素
    const containerElements = document.querySelectorAll('[id$="-container"]');
    
    containerElements.forEach(container => {
        const containerId = container.id;
        // 检查该元素是否已被隐藏
        const isHidden = localStorage.getItem('hidden_' + containerId) === 'true';
        
        if (isHidden) {
            // 如果元素之前被隐藏，则隐藏它
            container.style.display = 'none';
        }
    });
    
    // 恢复所有已隐藏的表格行
    const allTableRows = document.querySelectorAll('tr[id]');
    allTableRows.forEach(row => {
        const rowId = row.id;
        if (rowId) {
            const isHidden = localStorage.getItem('hidden_row_' + rowId) === 'true';
            
            if (isHidden) {
                row.style.display = 'none';
            }
        }
    });
}

// 重置所有内容到最初状态（恢复所有隐藏的项目）
function resetAllContent() {
    // 清除所有隐藏状态
    const keys = [];
    
    // 收集所有与隐藏状态相关的localStorage键
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('hidden_')) {
            keys.push(key);
        }
    }
    
    // 删除所有隐藏状态
    keys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // 显示所有目标容器
    document.querySelectorAll('[id^="target"][id$="-container"]').forEach(container => {
        container.style.display = '';
    });
    
    // 显示所有表格行
    document.querySelectorAll('tr[id]').forEach(row => {
        row.style.display = '';
    });
    
    // 显示所有表格列
    document.querySelectorAll('th, td').forEach(cell => {
        cell.style.display = '';
    });
    
    // 清空操作历史
    while(operationHistory.length > 0) {
        operationHistory.pop();
    }
    
    // 更新撤销按钮状态
    updateUndoButtonState();
    
    // 显示通知
    showNotification('成功', '已恢复所有内容到初始状态');
}

// 表格行删除功能
function hideTableRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        // 记录操作到历史记录中，以便撤销
        recordOperation({
            type: 'hideTableRow',
            rowId: rowId,
            previousDisplay: row.style.display
        });
        
        // 隐藏表格行
        row.style.display = 'none';
        
        // 保存状态到 localStorage
        localStorage.setItem('hidden_row_' + rowId, 'true');
        
        // 保留表格行的内容
        const editableElements = row.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(element => {
            if (element.id) {
                localStorage.setItem('report_' + element.id, element.textContent);
            }
        });
    }
}

// 页面加载后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const exportBtn = document.getElementById('exportBtn');
    const steps = document.querySelectorAll('.step');
    
    // 初始化撤销按钮状态
    updateUndoButtonState();

    // 全局变量
    let currentStep = 0;
    
    // 加载MathJax脚本
    loadMathJax();
    
    // 步骤导航
    prevBtn.addEventListener('click', function() {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    });

    nextBtn.addEventListener('click', function() {
        if (currentStep < steps.length - 1) {
            showStep(currentStep + 1);
        }
    });

    // 初始化内容同步
    setupContentSync();
    
    // 恢复之前隐藏的元素
    restoreHiddenItems();
    
    // 重排序课程目标
    reorderTargets();
    
    // 导出PDF按钮点击事件
    exportBtn.addEventListener('click', function() {
        // 在导出前准备报告内容
        prepareForExport();
        exportPDF();
    });
    
    // 准备导出，处理所有可编辑区域，确保内容正确显示
    function prepareForExport() {
        try {
            console.log('正在准备导出报告...');
            
            // 添加导出类以应用特殊标志
            document.body.classList.add('is-exporting');
            
            // 隐藏所有删除按钮
            document.querySelectorAll('.delete-button, .row-delete-button, .delete-cell').forEach(button => {
                button.style.display = 'none';
            });
            
            // 处理隐藏的元素，在PDF中完全移除
            document.querySelectorAll('[id$="-container"]').forEach(container => {
                if (container.style.display === 'none') {
                    // 临时添加类以便在PDF中完全移除
                    container.classList.add('pdf-hidden');
                }
            });
            
            // 处理隐藏的表格行
            document.querySelectorAll('tr[id]').forEach(row => {
                if (row.style.display === 'none') {
                    // 临时添加类以便在PDF中完全移除
                    row.classList.add('pdf-hidden');
                }
            });
            
            // 添加样式规则以隐藏这些元素
            let style = document.createElement('style');
            style.id = 'pdf-export-styles';
            style.textContent = '.pdf-hidden { display: none !important; }';
            document.head.appendChild(style);
            
            // 填充可编辑内容的基本操作
            // 处理所有可编辑区域，确保内容被保留
            document.querySelectorAll('[contenteditable="true"]').forEach(element => {
                // 如果元素为空，使用占位符内容或添加空格
                if (element.textContent.trim() === '') {
                    const placeholder = element.getAttribute('data-placeholder');
                    if (placeholder) {
                        element.textContent = placeholder;
                    } else {
                        element.textContent = ' ';
                    }
                }
            });
            
            // 处理所有输入框
            document.querySelectorAll('input.input-field').forEach(element => {
                if (element.value.trim() === '') {
                    const placeholder = element.getAttribute('placeholder');
                    if (placeholder) {
                        element.value = placeholder;
                    } else {
                        element.value = ' ';
                    }
                }
            });
            
            console.log('报告准备完成，准备导出PDF');
        } catch (error) {
            console.error('准备导出报告时出错:', error);
        }
    }

    // 显示特定步骤
    function showStep(stepIndex) {
        // 隐藏所有步骤
        steps.forEach(step => step.classList.remove('active'));
        
        // 显示当前步骤
        steps[stepIndex].classList.add('active');
        
        // 更新当前步骤索引
        currentStep = stepIndex;
        
        // 更新按钮状态
        prevBtn.disabled = currentStep === 0;
        nextBtn.disabled = currentStep === steps.length - 1;
    }
    
    // 设置内容同步
    function setupContentSync() {
        // 课程名称同步
        const courseName = document.getElementById('courseName');
        const courseNameShows = [
            document.getElementById('courseNameShow1'),
            document.getElementById('courseNameShow2'),
            document.getElementById('courseNameShow3'),
            document.getElementById('courseNameShow4'),
            document.getElementById('courseNameShow5')
        ];
        if (courseName) {
            courseName.addEventListener('input', function() {
                const value = this.textContent;
                courseNameShows.forEach(element => {
                    if(element) element.textContent = value;
                });
            });
        }

        const maxScore = document.getElementById('maxScore');
        const maxScoreShow = document.getElementById('maxScoreShow');
        if(maxScore){
            maxScore.addEventListener('input', function() {
                const value = this.textContent;
                maxScoreShow.textContent = value;
            });
        }
        const minScore = document.getElementById('minScore');
        const minScoreShow = document.getElementById('minScoreShow');
        if(minScore){
            minScore.addEventListener('input', function() {
                const value = this.textContent;
                minScoreShow.textContent = value;
            });
        }
        const avgTotalScore = document.getElementById('avgTotalScore');
        const avgTotalScoreShow = document.getElementById('avgTotalScoreShow');
        if(avgTotalScore){
            avgTotalScore.addEventListener('input', function() {
                const value = this.textContent;
                avgTotalScoreShow.textContent = value;
            });
        }
        const countIds = ['count1', 'count2', 'count3', 'count4', 'count5'];
        const rateIds = ['rate1', 'rate2', 'rate3', 'rate4', 'rate5'];
        const countShowIds = ['count1Show', 'count2Show', 'count3Show', 'count4Show', 'count5Show'];
        const rateShowIds = ['rate1Show', 'rate2Show', 'rate3Show', 'rate4Show', 'rate5Show'];
        countIds.forEach((id, index) => {
            const countElement = document.getElementById(id);
            const countShowElement = document.getElementById(countShowIds[index]);
            if (countElement && countShowElement) {
                countElement.addEventListener('input', function() {
                    countShowElement.textContent = this.textContent;
                });
                countShowElement.textContent = countElement.textContent;
            }
        });
        rateIds.forEach((id, index) => { 
            const rateElement = document.getElementById(id);
            const rateShowElement = document.getElementById(rateShowIds[index]);
            if (rateElement && rateShowElement) {
                rateElement.addEventListener('input', function() {
                    rateShowElement.textContent = this.textContent;
                });
                rateShowElement.textContent = rateElement.textContent;
            }
        });
        
        // 确保所有可编辑元素都可以进行编辑
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.userSelect = 'text';
            el.style.cursor = 'text';
            
            // 修复空的contenteditable元素
            if (!el.textContent.trim() && !el.innerHTML.trim()) {
                el.innerHTML = ''; // 确保内容为空，而不是只包含空格或换行符
            }
        });
        
        // 其他输入元素的自动保存到localStorage
        const inputElements = document.querySelectorAll('[contenteditable="true"], input');
        inputElements.forEach(element => {
            const id = element.id;
            if (id) {
                // 从localStorage加载数据
                const savedValue = localStorage.getItem('report_' + id);
                if (savedValue) {
                    if (element.hasAttribute('contenteditable')) {
                        element.textContent = savedValue;
                    } else {
                        element.value = savedValue;
                    }
                }
                
                // 保存输入数据到localStorage
                element.addEventListener('input', function() {
                    const value = element.hasAttribute('contenteditable') ? 
                                 element.textContent : element.value;
                    localStorage.setItem('report_' + id, value);
                });
            }
        });
    }
    
    // 加载MathJax脚本
    function loadMathJax() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
        script.async = true;
        document.head.appendChild(script);
    }
    
    // 导出PDF功能
    function exportPDF() {
        try {
            window.showDebug('准备导出PDF...');
            
            // 通知主进程开始生成PDF
            window.electronAPI.exportPDF()
                .then(result => {
                    try {
                        // 导出完成后，恢复页面状态
                        document.body.classList.remove('is-exporting');
                        
                        // 删除临时添加的样式
                        const tempStyle = document.getElementById('pdf-export-styles');
                        if (tempStyle) {
                            tempStyle.remove();
                        }
                        
                        // 恢复删除按钮的显示
                        document.querySelectorAll('.delete-button, .row-delete-button, .delete-cell').forEach(button => {
                            button.style.display = '';
                        });
                        
                        // 移除临时标记类
                        document.querySelectorAll('.pdf-hidden').forEach(element => {
                            element.classList.remove('pdf-hidden');
                        });
                        
                        // 恢复步骤显示状态 - 基本恢复
                        steps.forEach((step, index) => {
                            if (index !== currentStep) {
                                step.style.display = 'none';
                            } else {
                                step.style.display = 'block';
                            }
                        });
                        
                        if (result.success) {
                            window.showDebug('PDF导出成功：' + result.filePath);
                        } else {
                            window.showDebug('PDF导出失败：' + (result.message || '未知错误'));
                        }
                    } catch (cleanupErr) {
                        console.error('导出后清理错误:', cleanupErr);
                        window.showDebug('PDF导出后清理出现问题，但PDF可能已成功生成');
                    }
                })
                .catch(err => {
                    document.body.classList.remove('is-exporting');
                    window.showDebug('PDF导出错误：' + err.message);
                    
                    // 确保恢复基本显示状态
                    try {
                        steps.forEach((step, index) => {
                            if (index !== currentStep) {
                                step.style.display = 'none';
                            } else {
                                step.style.display = 'block';
                            }
                        });
                    } catch (displayErr) {
                        console.error('恢复显示状态出错:', displayErr);
                    }
                });
        } catch (error) {
            console.error('exportPDF函数执行出错:', error);
            window.showDebug('PDF导出初始化错误：' + error.message);
        }
    }
    
    // 初始化显示第一步
    showStep(0);
});