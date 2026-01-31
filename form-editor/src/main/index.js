/**
 * 应用主入口文件
 * 负责初始化ICU数据和启动主应用
 */

const path = require('path');

console.log('加载应用主入口...');

// 尝试加载ICU辅助工具
let icuHelper;
try {
    icuHelper = require('./icu-helper');
    console.log('已加载ICU辅助工具');
} catch (error) {
    console.error('加载ICU辅助工具时出错:', error);
}

// 检查ICU数据文件
try {
    if (icuHelper) {
        const icuPath = icuHelper.checkICUDataFile();
        if (icuPath) {
            console.log(`使用ICU数据文件: ${icuPath}`);
            // 设置环境变量告诉Chromium引擎ICU数据文件的位置
            process.env.ICU_DATA_DIR = path.dirname(icuPath);
        } else {
            console.warn('未找到ICU数据文件，尝试修复...');
            const fixed = icuHelper.fixICUDataFile();
            if (!fixed) {
                console.error('无法修复ICU数据文件问题，应用可能无法正常工作');
            }
        }
    }
} catch (error) {
    console.error('处理ICU数据文件时出错:', error);
}

// 加载主应用
try {
    require('./main.js');
} catch (error) {
    console.error('加载主应用时出错:', error);
    
    // 检查是否为ICU错误并尝试修复
    if (icuHelper && icuHelper.isICUError(error)) {
        console.log('检测到ICU错误，尝试修复...');
        if (icuHelper.fixICUDataFile()) {
            console.log('ICU数据文件已修复，重新加载应用...');
            try {
                require('./main.js');
            } catch (retryError) {
                console.error('修复后重新加载应用失败:', retryError);
            }
        }
    }
}
