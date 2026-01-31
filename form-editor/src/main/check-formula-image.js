// 检查公式图片文件
const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');

function checkFormulaImage() {
    const formulaImagePath = path.join(__dirname, '../../assets/images', '公式1.jpg');
    
    // 检查图片文件是否存在
    if (!fs.existsSync(formulaImagePath)) {
        dialog.showMessageBox({
            type: 'warning',
            title: '缺少公式图片文件',
            message: '公式1.jpg 文件不存在',
            detail: '请将 公式1.jpg 文件放置在 images 文件夹中，否则公式将无法正确显示。\n路径: ' + formulaImagePath,
            buttons: ['确定']
        });
        console.warn('警告: 缺少公式图片文件:', formulaImagePath);
        return false;
    }
    
    console.log('公式图片文件检查通过:', formulaImagePath);
    return true;
}

module.exports = {
    checkFormulaImage
};