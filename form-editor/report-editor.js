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
            
            // 添加导出类以应用特殊样式
            document.body.classList.add('is-exporting');
            
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
});