// 删除可编辑项的功能
function hideEditableItem(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
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

// 表格行删除功能
function hideTableRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
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