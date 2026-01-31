/**
 * 输入框调试工具
 * 用于诊断弹窗后输入框失效的问题
 */

(function() {
    console.log('[输入框调试] 调试工具已加载');
    
    // 检查输入框状态
    window.checkInputsState = function() {
        const elements = document.querySelectorAll('input, textarea, select, [contenteditable], [contenteditable="true"]');
        console.log(`=== 输入框状态检查 (共${elements.length}个) ===`);
        
        let blocked = 0;
        elements.forEach((el, index) => {
            const computed = window.getComputedStyle(el);
            const pointerEvents = computed.pointerEvents;
            const userSelect = computed.userSelect;
            const display = computed.display;
            const visibility = computed.visibility;
            const disabled = el.disabled;
            const readonly = el.readOnly;
            const contenteditable = el.getAttribute('contenteditable');
            
            if (pointerEvents === 'none' || userSelect === 'none' || display === 'none' || 
                visibility === 'hidden' || disabled || readonly || contenteditable === 'false') {
                console.warn(`[${index}] 元素被阻止:`, {
                    element: el,
                    pointerEvents,
                    userSelect,
                    display,
                    visibility,
                    disabled,
                    readonly,
                    contenteditable,
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className
                });
                blocked++;
            }
        });
        
        console.log(`检查完成: ${blocked} 个元素被阻止, ${elements.length - blocked} 个正常`);
        return { total: elements.length, blocked, normal: elements.length - blocked };
    };
    
    // 监控样式变化
    window.monitorInputChanges = function(duration = 5000) {
        console.log(`[输入框监控] 开始监控 ${duration}ms`);
        
        const elements = document.querySelectorAll('input, textarea, select, [contenteditable], [contenteditable="true"]');
        const observers = [];
        
        elements.forEach((el, index) => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                        console.warn(`[输入框监控] 元素${index}的${mutation.attributeName}属性被修改:`, {
                            element: el,
                            tagName: el.tagName,
                            id: el.id,
                            oldValue: mutation.oldValue,
                            newValue: el.getAttribute(mutation.attributeName)
                        });
                    }
                });
            });
            
            observer.observe(el, {
                attributes: true,
                attributeOldValue: true,
                attributeFilter: ['style', 'contenteditable', 'disabled', 'readonly']
            });
            
            observers.push(observer);
        });
        
        setTimeout(() => {
            observers.forEach(obs => obs.disconnect());
            console.log('[输入框监控] 监控结束');
        }, duration);
    };
    
    // 强制修复所有输入框
    window.fixAllInputs = function() {
        console.log('[输入框修复] 开始修复所有输入框');
        const elements = document.querySelectorAll('input, textarea, select, [contenteditable], [contenteditable="true"]');
        
        elements.forEach(el => {
            // 清除所有内联样式
            el.style.removeProperty('pointer-events');
            el.style.removeProperty('user-select');
            el.style.removeProperty('-webkit-user-select');
            
            // 设置正确的属性
            el.style.setProperty('pointer-events', 'auto', 'important');
            el.style.setProperty('user-select', 'text', 'important');
            el.style.setProperty('-webkit-user-select', 'text', 'important');
            
            if (el.hasAttribute('contenteditable')) {
                el.setAttribute('contenteditable', 'true');
            }
            
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                el.disabled = false;
                el.readOnly = false;
            }
        });
        
        console.log('[输入框修复] 修复完成');
        window.checkInputsState();
    };
    
    // 添加快捷键：按Ctrl+Shift+D检查状态
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            console.log('=== 快捷键触发检查 ===');
            window.checkInputsState();
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            console.log('=== 快捷键触发修复 ===');
            window.fixAllInputs();
        }
    });
    
    console.log('[输入框调试] 快捷键: Ctrl+Shift+D=检查状态, Ctrl+Shift+F=强制修复');
})();
