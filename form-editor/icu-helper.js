/**
 * ICU数据处理辅助工具
 * 用于检测和修复ICU数据文件问题
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// 尝试加载electron-log，如果不可用则使用控制台
let log;
try {
    log = require('electron-log');
} catch (e) {
    log = console;
}

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
    path.join(app.getAppPath(), 'node_modules', 'electron', 'dist', 'icudtl.dat'),
    // 其他可能的位置
    path.join(app.getPath('exe'), '..', 'icudtl.dat'),
    path.join(process.cwd(), 'icudtl.dat')
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
    log.info('检查 ICU 数据文件...');
    log.info(`应用路径: ${app.getAppPath()}`);
    log.info(`资源路径: ${process.resourcesPath || '未定义'}`);

    // 检查所有可能路径并记录
    const pathStatus = {};
    let sourceFile = null;

    for (const icuPath of possibleICUPaths) {
        try {
            const exists = fs.existsSync(icuPath);
            log.info(`检查 ICU 路径: ${icuPath} - ${exists ? '存在' : '不存在'}`);
            
            pathStatus[icuPath] = exists;
            
            // 记录第一个找到的文件作为源文件
            if (exists && !sourceFile) {
                sourceFile = icuPath;
                log.info(`找到ICU数据文件: ${sourceFile}`);
            }
        } catch (error) {
            log.error(`检查ICU文件路径时出错 ${icuPath}:`, error);
        }
    }

    if (!sourceFile) {
        log.warn('未找到ICU数据文件');
    }

    return sourceFile;
}

/**
 * 尝试修复ICU数据文件问题
 * @returns {boolean} 是否成功修复
 */
function fixICUDataFile() {
    log.info('尝试修复ICU数据文件...');
    
    // 找到一个有效的源文件
    const sourceFile = checkICUDataFile();
    if (!sourceFile) {
        log.error('无法找到有效的ICU数据文件源');
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
            // 跳过源文件和目标文件相同的情况
            if (targetPath === sourceFile) {
                log.info(`跳过复制到相同位置: ${targetPath}`);
                success = true;
                continue;
            }
            
            const targetDir = path.dirname(targetPath);
            
            // 确保目标目录存在
            if (!fs.existsSync(targetDir)) {
                log.info(`创建目标目录: ${targetDir}`);
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // 复制文件
            log.info(`将ICU数据文件从 ${sourceFile} 复制到 ${targetPath}`);
            fs.copyFileSync(sourceFile, targetPath);
            log.info(`成功复制ICU数据文件到: ${targetPath}`);
            success = true;
        } catch (error) {
            log.error(`复制ICU文件到 ${targetPath} 时出错:`, error);
        }
    }

    // 设置环境变量
    if (success) {
        process.env.ICU_DATA_DIR = path.dirname(sourceFile);
        log.info(`设置 ICU_DATA_DIR=${process.env.ICU_DATA_DIR}`);
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
    
    const errorMessage = error.message.toString();
    const errorStack = error.stack ? error.stack.toString() : '';
    
    return ICU_ERROR_PATTERNS.some(pattern => 
        errorMessage.includes(pattern) || 
        errorStack.includes(pattern)
    );
}

/**
 * 获取ICU数据文件状态
 * @returns {Object} ICU文件检查状态
 */
function getICUStatus() {
    const sourceFile = checkICUDataFile();
    
    return {
        hasValidICUFile: !!sourceFile,
        icuFilePath: sourceFile,
        icuDataDir: sourceFile ? path.dirname(sourceFile) : null
    };
}

module.exports = {
    checkICUDataFile,
    fixICUDataFile,
    isICUError,
    getICUStatus
};