// 说明：这是一个简单的SVG公式图片
const fs = require('fs');
const path = require('path');

// 创建公式1的SVG内容
const formula1SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80" viewBox="0 0 300 80">
  <style>
    text { font-family: "Times New Roman", serif; }
    .math { font-style: italic; }
    .sub { font-size: 0.7em; }
    .limit { font-size: 0.7em; }
  </style>
  <text x="50" y="45" class="math" font-size="24">
    w<tspan class="sub" dy="5">i</tspan> = 
    <tspan dx="10">v<tspan class="sub" dy="5">i</tspan></tspan>
    <tspan dx="5">/</tspan>
    <tspan dx="5">∑</tspan>
    <tspan class="limit" dx="2" dy="10">n</tspan>
    <tspan class="limit" dx="-10" dy="-20">i=0</tspan>
    <tspan dx="15">v<tspan class="sub" dy="5">i</tspan></tspan>
    <tspan dx="10">,</tspan>
    <tspan dx="10">(i=1, 2, 3, ..., n)</tspan>
  </text>
</svg>`;

// 保存SVG到文件
const svgPath = path.join(__dirname, '../../assets/images', 'formula1.svg');
fs.mkdirSync(path.dirname(svgPath), { recursive: true });
fs.writeFileSync(svgPath, formula1SVG, 'utf8');

console.log('SVG公式图片已创建在：' + svgPath);

// 对于一些平台可能需要PNG格式，这里提供说明
console.log('注意：如果需要PNG格式，可以使用外部工具将SVG转换为PNG，或者使用Node.js的svg-to-png等库进行转换。');