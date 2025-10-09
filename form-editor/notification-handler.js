/* 
 * 统一通知函数 
 * 创建一个全局可用的通知显示功能，使不同组件可以使用一致的样式显示通知
 */

// 定义全局通知函数
(function() {
    // 标准化通知函数
    window.showStandardNotification = function(title, message, type = 'info', duration = 3000) {
        const toast = document.getElementById('notification-toast');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast || !toastTitle || !toastMessage) {
            console.log(`通知: ${title} - ${message}`);
            return;
        }
        
        // 根据类型设置不同的样式
        let backgroundColor = '#fff';
        let titleColor = '#333';
        let borderColor = '#ddd';
        
        switch (type) {
            case 'success':
                backgroundColor = '#e8f5e9';
                titleColor = '#2e7d32';
                borderColor = '#81c784';
                break;
            case 'error':
                backgroundColor = '#ffebee';
                titleColor = '#c62828';
                borderColor = '#ef9a9a';
                break;
            case 'warning':
                backgroundColor = '#fff8e1';
                titleColor = '#f57f17';
                borderColor = '#ffd54f';
                break;
            case 'info':
            default:
                backgroundColor = '#e3f2fd';
                titleColor = '#1565c0';
                borderColor = '#90caf9';
                break;
        }
        
        // 应用样式
        toast.style.backgroundColor = backgroundColor;
        toast.style.borderLeft = `4px solid ${borderColor}`;
        toastTitle.style.color = titleColor;
        
        // 设置内容
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // 显示通知
        toast.style.display = 'block';
        
        // 自动隐藏
        if (window.toastTimeout) {
            clearTimeout(window.toastTimeout);
        }
        
        window.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
                toast.style.opacity = '1';
            }, 300);
        }, duration);
    };
    
    // 覆盖所有已存在的showNotification函数，保持向后兼容
    if (typeof window.showNotification === 'function') {
        const originalShowNotification = window.showNotification;
        
        window.showNotification = function(titleOrOptions, message, type) {
            // 处理不同的调用方式
            if (typeof titleOrOptions === 'object') {
                // 对象形式调用: showNotification({title: '..', message: '..'})
                const options = titleOrOptions;
                window.showStandardNotification(
                    options.title || '通知', 
                    options.message || '', 
                    options.type || 'info',
                    options.duration || 3000
                );
            } else {
                // 参数形式调用: showNotification('标题', '消息')
                window.showStandardNotification(titleOrOptions, message, type, 3000);
            }
        };
    } else {
        window.showNotification = function(titleOrOptions, message, type) {
            if (typeof titleOrOptions === 'object') {
                const options = titleOrOptions;
                window.showStandardNotification(
                    options.title || '通知', 
                    options.message || '', 
                    options.type || 'info',
                    options.duration || 3000
                );
            } else {
                window.showStandardNotification(titleOrOptions, message, type, 3000);
            }
        };
    }
})();