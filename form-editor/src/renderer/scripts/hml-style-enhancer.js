/**
 * HML选择器样式增强脚本
 * 确保所有HML选择器（包括新添加行的选择器）样式一致
 */

const hmlStyleEnhancer = {
    // 初始化
    init: function() {
        console.log('初始化HML选择器样式增强...');
        this.enhanceAllSelectors();
        this.setupObserver();
        console.log('HML选择器样式增强初始化完成');
    },
    
    // 增强所有选择器
    enhanceAllSelectors: function() {
        // 获取所有HML选择器
        const selectors = document.querySelectorAll('.hml-selector');
        
        selectors.forEach(selector => {
            // 设置基本样式
            this.applyBasicStyles(selector);
            
            // 处理所有选项
            const options = selector.querySelectorAll('.hml-option');
            options.forEach(option => {
                this.applyOptionStyles(option);
            });
        });
        
        console.log(`已增强 ${selectors.length} 个HML选择器`);
    },
    
    // 应用基本样式到选择器
    applyBasicStyles: function(selector) {
        if (!selector) return;
        
        selector.style.display = 'flex';
        selector.style.justifyContent = 'center';
        selector.style.alignItems = 'center';
        selector.style.gap = '5px';
        selector.style.width = '100%';
        selector.style.height = '100%';
        selector.style.padding = '2px';
        selector.style.margin = '0 auto';
    },
    
    // 应用样式到选项
    applyOptionStyles: function(option) {
        if (!option) return;
        
        option.style.cursor = 'pointer';
        option.style.width = '26px';
        option.style.height = '26px';
        option.style.borderRadius = '50%';
        option.style.display = 'flex';
        option.style.justifyContent = 'center';
        option.style.alignItems = 'center';
        option.style.border = '1px solid #ccc';
        option.style.fontWeight = 'bold';
        option.style.margin = '0 3px';
        option.style.fontSize = '14px';
        
        // 根据选择状态设置样式
        if (option.classList.contains('selected')) {
            option.style.color = 'white';
            
            if (option.classList.contains('h-option')) {
                option.style.backgroundColor = '#2196F3';
                option.style.borderColor = '#2196F3';
            } else if (option.classList.contains('m-option')) {
                option.style.backgroundColor = '#4CAF50';
                option.style.borderColor = '#4CAF50';
            } else if (option.classList.contains('l-option')) {
                option.style.backgroundColor = '#FF9800';
                option.style.borderColor = '#FF9800';
            }
        } else {
            option.style.color = '#333';
            option.style.backgroundColor = 'transparent';
        }
    },
    
    // 设置观察器监听DOM变化
    setupObserver: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // 检查添加的节点
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        // 检查是否是元素节点
                        if (node.nodeType !== 1) return;
                        
                        // 如果是HML选择器，直接增强
                        if (node.classList && node.classList.contains('hml-selector')) {
                            this.applyBasicStyles(node);
                            const options = node.querySelectorAll('.hml-option');
                            options.forEach(option => this.applyOptionStyles(option));
                        }
                        
                        // 如果包含HML选择器，查找并增强它们
                        const selectors = node.querySelectorAll('.hml-selector');
                        if (selectors.length) {
                            selectors.forEach(selector => {
                                this.applyBasicStyles(selector);
                                const options = selector.querySelectorAll('.hml-option');
                                options.forEach(option => this.applyOptionStyles(option));
                            });
                        }
                    });
                }
                
                // 检查属性变化（如添加/删除selected类）
                if (mutation.type === 'attributes' && 
                    mutation.target.classList && 
                    mutation.target.classList.contains('hml-option') && 
                    mutation.attributeName === 'class') {
                    this.applyOptionStyles(mutation.target);
                }
            });
        });
        
        // 配置观察选项
        const config = { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        };
        
        // 开始观察
        observer.observe(document.body, config);
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    hmlStyleEnhancer.init();
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    hmlStyleEnhancer.init();
}