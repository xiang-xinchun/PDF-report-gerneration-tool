(function() {
    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        .custom-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease;
        }

        .custom-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .custom-modal-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            width: 400px;
            max-width: 90%;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .custom-modal-overlay.active .custom-modal-container {
            transform: translateY(0);
        }

        .custom-modal-header {
            padding: 15px 20px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .custom-modal-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0;
        }

        .custom-modal-body {
            padding: 20px;
            font-size: 16px;
            color: #555;
            line-height: 1.5;
        }

        .custom-modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #e9ecef;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .custom-modal-btn {
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }

        .custom-modal-btn-cancel {
            background-color: #e9ecef;
            color: #495057;
        }
        .custom-modal-btn-cancel:hover {
            background-color: #dee2e6;
        }

        .custom-modal-btn-confirm {
            background-color: #4285f4;
            color: white;
        }
        .custom-modal-btn-confirm:hover {
            background-color: #3367d6;
        }
        
        .custom-modal-btn-danger {
            background-color: #dc3545;
            color: white;
        }
        .custom-modal-btn-danger:hover {
            background-color: #c82333;
        }
    `;
    document.head.appendChild(style);

    // 创建模态框DOM
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'custom-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="custom-modal-container">
            <div class="custom-modal-header">
                <h3 class="custom-modal-title">提示</h3>
            </div>
            <div class="custom-modal-body" id="custom-modal-message"></div>
            <div class="custom-modal-footer">
                <button class="custom-modal-btn custom-modal-btn-cancel" id="custom-modal-cancel">取消</button>
                <button class="custom-modal-btn custom-modal-btn-confirm" id="custom-modal-confirm">确定</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    const messageEl = document.getElementById('custom-modal-message');
    const cancelBtn = document.getElementById('custom-modal-cancel');
    const confirmBtn = document.getElementById('custom-modal-confirm');
    const titleEl = modalOverlay.querySelector('.custom-modal-title');

    let currentResolve = null;

    // 关闭模态框
    function closeModal() {
        modalOverlay.classList.remove('active');
        // 恢复焦点到文档主体，防止焦点丢失
        setTimeout(() => {
            document.body.focus(); 
        }, 100);
    }

    // 绑定事件
    cancelBtn.addEventListener('click', () => {
        closeModal();
        if (currentResolve) currentResolve(false);
    });

    confirmBtn.addEventListener('click', () => {
        closeModal();
        if (currentResolve) currentResolve(true);
    });

    // 暴露为全局方法
    window.customConfirm = function(message, title = '确认操作', isDanger = false) {
        return new Promise((resolve) => {
            currentResolve = resolve;
            messageEl.textContent = message;
            titleEl.textContent = title;
            
            // 设置按钮样式
            if (isDanger) {
                confirmBtn.className = 'custom-modal-btn custom-modal-btn-danger';
            } else {
                confirmBtn.className = 'custom-modal-btn custom-modal-btn-confirm';
            }
            
            // 显示取消按钮
            cancelBtn.style.display = 'block';
            confirmBtn.textContent = '确定';
            
            modalOverlay.classList.add('active');
            confirmBtn.focus();
        });
    };

    window.customAlert = function(message, title = '提示') {
        return new Promise((resolve) => {
            currentResolve = resolve;
            messageEl.textContent = message;
            titleEl.textContent = title;
            
            confirmBtn.className = 'custom-modal-btn custom-modal-btn-confirm';
            // 隐藏取消按钮
            cancelBtn.style.display = 'none';
            confirmBtn.textContent = '我知道了';
            
            modalOverlay.classList.add('active');
            confirmBtn.focus();
        });
    };

    console.log('Custom Modal System Initialized');
})();
