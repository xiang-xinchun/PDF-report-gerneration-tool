/**
 * 自定义对话框 - 替代原生confirm/alert
 * 避免浏览器原生对话框导致的输入框失焦问题
 */

(function() {
    'use strict';

    // 创建对话框容器（只创建一次）
    function createDialogContainer() {
        if (document.getElementById('custom-dialog-overlay')) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'custom-dialog-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(2px);
        `;

        const dialog = document.createElement('div');
        dialog.id = 'custom-dialog-box';
        dialog.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            padding: 0;
            min-width: 300px;
            max-width: 500px;
            animation: dialogFadeIn 0.2s ease;
        `;

        const header = document.createElement('div');
        header.id = 'custom-dialog-header';
        header.style.cssText = `
            padding: 16px 20px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
        `;

        const content = document.createElement('div');
        content.id = 'custom-dialog-content';
        content.style.cssText = `
            padding: 20px;
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            max-height: 400px;
            overflow-y: auto;
        `;

        const footer = document.createElement('div');
        footer.id = 'custom-dialog-footer';
        footer.style.cssText = `
            padding: 12px 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        `;

        dialog.appendChild(header);
        dialog.appendChild(content);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dialogFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            #custom-dialog-box button {
                padding: 8px 20px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }
            #custom-dialog-box button:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            #custom-dialog-box button:active {
                transform: translateY(0);
            }
            #custom-dialog-box .btn-primary {
                background: #2196F3;
                color: white;
            }
            #custom-dialog-box .btn-primary:hover {
                background: #1976D2;
            }
            #custom-dialog-box .btn-secondary {
                background: #f5f5f5;
                color: #666;
            }
            #custom-dialog-box .btn-secondary:hover {
                background: #e0e0e0;
            }
            #custom-dialog-box .btn-danger {
                background: #f44336;
                color: white;
            }
            #custom-dialog-box .btn-danger:hover {
                background: #d32f2f;
            }
        `;
        document.head.appendChild(style);
    }

    // 显示对话框
    function showDialog(options) {
        return new Promise((resolve) => {
            createDialogContainer();
            
            const overlay = document.getElementById('custom-dialog-overlay');
            const header = document.getElementById('custom-dialog-header');
            const content = document.getElementById('custom-dialog-content');
            const footer = document.getElementById('custom-dialog-footer');

            // 设置标题和内容
            header.textContent = options.title || '提示';
            content.textContent = options.message || '';

            // 清空并创建按钮
            footer.innerHTML = '';

            if (options.type === 'confirm') {
                // 确认对话框：取消 + 确定
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = options.cancelText || '取消';
                cancelBtn.className = 'btn-secondary';
                cancelBtn.onclick = () => {
                    hideDialog();
                    resolve(false);
                };

                const confirmBtn = document.createElement('button');
                confirmBtn.textContent = options.confirmText || '确定';
                confirmBtn.className = options.danger ? 'btn-danger' : 'btn-primary';
                confirmBtn.onclick = () => {
                    hideDialog();
                    resolve(true);
                };

                footer.appendChild(cancelBtn);
                footer.appendChild(confirmBtn);

                // 默认焦点在取消按钮（安全）
                setTimeout(() => cancelBtn.focus(), 100);
            } else {
                // 警告对话框：只有确定
                const okBtn = document.createElement('button');
                okBtn.textContent = options.okText || '确定';
                okBtn.className = 'btn-primary';
                okBtn.onclick = () => {
                    hideDialog();
                    resolve(true);
                };

                footer.appendChild(okBtn);

                // 默认焦点在确定按钮
                setTimeout(() => okBtn.focus(), 100);
            }

            // 显示对话框
            overlay.style.display = 'flex';

            // ESC键关闭
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    hideDialog();
                    resolve(false);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);

            // 点击遮罩层关闭（可选）
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    hideDialog();
                    resolve(false);
                }
            };

            // 防止对话框内部点击冒泡
            document.getElementById('custom-dialog-box').onclick = (e) => {
                e.stopPropagation();
            };
        });
    }

    // 隐藏对话框
    function hideDialog() {
        const overlay = document.getElementById('custom-dialog-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // 自定义confirm函数
    window.customConfirm = function(message, title = '确认', options = {}) {
        return showDialog({
            type: 'confirm',
            title: title,
            message: message,
            confirmText: options.confirmText,
            cancelText: options.cancelText,
            danger: options.danger
        });
    };

    // 自定义alert函数
    window.customAlert = function(message, title = '提示', options = {}) {
        return showDialog({
            type: 'alert',
            title: title,
            message: message,
            okText: options.okText
        });
    };

    console.log('[自定义对话框] 初始化完成，使用 customConfirm() 和 customAlert()');
})();
