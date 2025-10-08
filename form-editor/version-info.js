/**
 * 版本信息辅助工具
 * 提供应用版本和构建信息
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// 从package.json读取版本信息
let packageInfo = { version: '未知版本', description: '课程目标达成情况评价报告生成工具' };
try {
    const packagePath = path.join(app.getAppPath(), 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageJson = require(packagePath);
        packageInfo = {
            version: packageJson.version || '未知版本',
            description: packageJson.description || '课程目标达成情况评价报告生成工具'
        };
    }
} catch (error) {
    console.error('读取版本信息失败:', error);
}

/**
 * 获取应用版本信息
 */
function getVersionInfo() {
    return {
        version: packageInfo.version,
        description: packageInfo.description,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        platform: process.platform,
        arch: process.arch,
        buildTime: new Date().toISOString()
    };
}

/**
 * 生成版本信息字符串
 */
function getVersionString() {
    const info = getVersionInfo();
    return `${info.description} v${info.version}\n` +
           `运行环境: Electron v${info.electronVersion}, Node.js ${info.nodeVersion}\n` +
           `平台: ${info.platform}-${info.arch}`;
}

/**
 * 显示版本信息
 */
function logVersionInfo() {
    console.log('\n=================================');
    console.log(getVersionString());
    console.log('=================================\n');
}

module.exports = {
    getVersionInfo,
    getVersionString,
    logVersionInfo
};