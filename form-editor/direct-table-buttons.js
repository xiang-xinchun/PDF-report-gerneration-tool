// 直接添加表格行操作按钮脚本
(function() {
    // 立即执行函数
    console.log('直接添加表格操作按钮...');
    
    // 等待DOM加载完成
    function addTableButtons() {
        console.log('开始添加表格按钮');
        
        // 1. 修改CSS，确保删除按钮可见
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .delete-cell { 
                display: table-cell !important; 
                width: 60px;
                text-align: center;
                vertical-align: middle;
            }
            .row-delete-button {
                display: inline-block !important;
                width: 22px;
                height: 22px;
                background-color: #f44336;
                color: white;
                border-radius: 50%;
                font-weight: bold;
                font-size: 16px;
                line-height: 20px;
                text-align: center;
                cursor: pointer;
                border: none;
                visibility: visible;
                opacity: 1;
            }
            .add-row-button {
                display: inline-block !important;
                width: 22px;
                height: 22px;
                background-color: #4CAF50;
                color: white;
                border-radius: 50%;
                font-weight: bold;
                font-size: 16px;
                line-height: 20px;
                text-align: center;
                cursor: pointer;
                border: none;
                position: absolute;
                right: 5px;
                top: 5px;
                z-index: 100;
                visibility: visible;
                opacity: 1;
            }
            .table-td.category {
                position: relative;
            }
        `;
        document.head.appendChild(styleSheet);
        
        // 2. 找到所有类别行并添加按钮
        const categoryRows = document.querySelectorAll('tr[id^="table-row-"]');
        console.log(`找到 ${categoryRows.length} 个类别行`);
        
        categoryRows.forEach((row, index) => {
            const categoryCell = row.querySelector('.category');
            if (!categoryCell) {
                console.log(`行 ${index} 没有类别单元格`);
                return;
            }
            
            // 设置相对定位
            categoryCell.style.position = 'relative';
            
            // 创建添加按钮
            const addButton = document.createElement('button');
            addButton.className = 'add-row-button';
            addButton.title = '添加一行';
            addButton.textContent = '+';
            addButton.style.display = 'inline-block'; 
            
            // 添加点击事件
            addButton.onclick = function(event) {
                event.stopPropagation();
                if (typeof window.addRowFeature !== 'undefined' && 
                    typeof window.addRowFeature.addSubRow === 'function') {
                    window.addRowFeature.addSubRow(row.id);
                } else {
                    console.error('addSubRow函数不可用');
                    alert('添加行功能未正确加载，请刷新页面重试');
                }
            };
            
            // 添加按钮到类别单元格
            categoryCell.appendChild(addButton);
            console.log(`已为行 ${index} 添加添加按钮`);
        });
        
        console.log('表格按钮添加完成');
    }
    
    // 如果DOM已加载完成，直接执行；否则等待DOMContentLoaded事件
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addTableButtons, 100);
        });
    } else {
        setTimeout(addTableButtons, 100);
    }
    
    // 为确保在所有脚本加载后执行，再设置一个延迟执行
    setTimeout(addTableButtons, 1000);
})();