/**
 * ICU数据处理辅助工具
 * 用于检测和修复ICU数据文件问题
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// 可能的ICU数据文件位置
const possibleICUPaths = [
    // 应用根目录
    path.join(app.getAppPath(), 'icudtl.dat'),
    // Electron资源目录
    path.join(process.resourcesPath, 'icudtl.dat'),
    // 额外资源目录
    path.join(process.resourcesPath, 'app.asar.unpacked', 'icudtl.dat'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'electron', 'dist', 'icudtl.dat'),
    // 开发环境
    path.join(app.getAppPath(), 'node_modules', 'electron', 'dist', 'icudtl.dat')
];

// 常见的ICU错误消息
const ICU_ERROR_PATTERNS = [
    'Invalid file descriptor to ICU data received',
    'Failed to load ICU data file',
    'Error: Error loading ICU',
    'icudtl.dat'
];

/**
 * 检查是否存在ICU数据文件
 * @returns {string|null} 找到的ICU文件路径，如果没有找到则返回null
 */
function checkICUDataFile() {
    for (const icuPath of possibleICUPaths) {
        try {
            if (fs.existsSync(icuPath)) {
                console.log(`找到ICU数据文件: ${icuPath}`);
                return icuPath;
            }
        } catch (error) {
            console.error(`检查ICU文件路径时出错 ${icuPath}:`, error);
        }
    }
    console.warn('未找到ICU数据文件');
    return null;
}

/**
 * 尝试修复ICU数据文件问题
 * @returns {boolean} 是否成功修复
 */
function fixICUDataFile() {
    // 找到一个有效的源文件
    const sourceFile = checkICUDataFile();
    if (!sourceFile) {
        console.error('无法找到有效的ICU数据文件源');
        return false;
    }

    // 确定目标位置
    const targetLocations = [
        path.join(app.getAppPath(), 'icudtl.dat'),
        path.join(process.resourcesPath, 'icudtl.dat')
    ];

    let success = false;
    // 复制到所有目标位置
    for (const targetPath of targetLocations) {
        try {
            const targetDir = path.dirname(targetPath);
            
            // 确保目标目录存在
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // 复制文件
            fs.copyFileSync(sourceFile, targetPath);
            console.log(`已将ICU数据文件复制到: ${targetPath}`);
            success = true;
        } catch (error) {
            console.error(`复制ICU文件到 ${targetPath} 时出错:`, error);
        }
    }

    return success;
}

/**
 * 检查错误是否与ICU数据文件相关
 * @param {Error} error 错误对象
 * @returns {boolean} 是否是ICU相关错误
 */
function isICUError(error) {
    if (!error || !error.message) return false;
    
    return ICU_ERROR_PATTERNS.some(pattern => 
        error.message.includes(pattern) || 
        (error.stack && error.stack.includes(pattern))
    );
}

module.exports = {
    checkICUDataFile,
    fixICUDataFile,
    isICUError
};