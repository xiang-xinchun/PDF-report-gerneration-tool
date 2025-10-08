const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 创建一个简单的文档图标
function createDocIcon(outputPath, size = 256) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 设置背景色为浅蓝色
  ctx.fillStyle = '#4a86e8';
  ctx.fillRect(0, 0, size, size);
  
  // 创建文档折角效果
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(size * 0.7, 0);
  ctx.lineTo(size, size * 0.3);
  ctx.lineTo(size, size);
  ctx.lineTo(0, size);
  ctx.lineTo(0, 0);
  ctx.lineTo(size * 0.7, 0);
  ctx.fill();
  
  // 画折角
  ctx.fillStyle = '#d9d9d9';
  ctx.beginPath();
  ctx.moveTo(size * 0.7, 0);
  ctx.lineTo(size, size * 0.3);
  ctx.lineTo(size * 0.7, size * 0.3);
  ctx.lineTo(size * 0.7, 0);
  ctx.fill();
  
  // 添加文本线条
  ctx.fillStyle = '#333333';
  for (let i = 1; i <= 5; i++) {
    ctx.fillRect(size * 0.2, size * (0.3 + i * 0.1), size * 0.6, size * 0.03);
  }
  
  // 导出为PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`图标已创建: ${outputPath}`);
}

// 确保目录存在
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 创建图标文件
const pngPath = path.join(iconsDir, '文档.png');
createDocIcon(pngPath);

console.log('图标文件已生成，请使用图标转换工具将PNG转换为ICO格式。');