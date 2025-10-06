// 初始化 Excel 上传功能
function initExcelUpload() {
    // 获取页面上的上传按钮
    const excelUploadBtn = document.getElementById('excel-upload-btn');
    if (!excelUploadBtn) {
        console.error('未找到上传按钮元素');
        return;
    }
}

document.getElementById('excel-upload-btn').addEventListener('click', async () => {
    try {
        const result = await window.electronAPI.openExcelFile();
        if (result.canceled) return;
        const filePath = result.filePaths[0];
        if (!filePath) return;
        const parseResult = await window.electronAPI.parseExcelFile(filePath);
        if (!parseResult.success) {
            showNotification({
                title: '解析失败',
                message: parseResult.message,
                type: 'error'
            });
            return;
        }
        const data = parseResult.data;
        fillDataToPage(data);

    } catch (error) {
        console.error('处理Excel文件出错:', error);
        showNotification({
            title: '操作失败',
            message: error.message || '处理Excel时发生错误',
            type: 'error'
        });
    }
});

// 工具函数1：提取有效成绩数据（过滤标题+空行，只保留"总成绩"列）
function extractValidScores(excelData) {
    const validScores = [];
    // 遍历Excel行：跳过前4行标题（成绩表格式：前3行是课程信息，第4行是列名）
    for (let i = 4; i < excelData.length; i++) {
        const row = excelData[i];
        // 过滤空行（行长度<10，或无学号/姓名/总成绩）
        if (!row || row.length < 10) continue;
        const totalScore = Number(row[8]); // 总成绩在第9列（索引8，对应Excel的"I列"）
        // 过滤非数字成绩（有效成绩应为70-100的数字）
        if (!isNaN(totalScore) && totalScore >= 0) {
            validScores.push(totalScore);
        }
    }
    return validScores;
}

function fillDataToPage(data) {
    // 填充班级信息
    document.getElementById('studentCount').textContent = data.studentCount || '0';

    // 填充成绩分析
    const avgTotalScore = Number(data.avgTotalScore) || 0;
    document.getElementById('maxScoreShow').textContent = data.maxScore || '0';
    document.getElementById('minScoreShow').textContent = data.minScore || '0';
    document.getElementById('avgTotalScoreShow').textContent = avgTotalScore.toFixed(2);

    // 填充各分数段人数
    document.getElementById('count1Show').textContent = data.counts?.count1 || '0';
    document.getElementById('count2Show').textContent = data.counts?.count2 || '0';
    document.getElementById('count3Show').textContent = data.counts?.count3 || '0';
    document.getElementById('count4Show').textContent = data.counts?.count4 || '0';
    document.getElementById('count5Show').textContent = data.counts?.count5 || '0';

    // 填充百分比
    document.getElementById('rate1Show').textContent = data.rates?.rate1 || '0%';
    document.getElementById('rate2Show').textContent = data.rates?.rate2 || '0%';
    document.getElementById('rate3Show').textContent = data.rates?.rate3 || '0%';
    document.getElementById('rate4Show').textContent = data.rates?.rate4 || '0%';
    document.getElementById('rate5Show').textContent = data.rates?.rate5 || '0%';
}

// 工具函数2：计算成绩统计指标
function calculateScoreStats(validScores) {
    const totalCount = validScores.length;
    const maxScore = Math.max(...validScores);
    const minScore = Math.min(...validScores);
    const totalSum = validScores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalSum / totalCount;

    // 统计各分数段人数（匹配成绩表的70-79、80-89、90-99分段）
    const scoreRanges = [
        { range: '70-79分', count: validScores.filter(s => s >=70 && s <=79).length },
        { range: '80-89分', count: validScores.filter(s => s >=80 && s <=89).length },
        { range: '90-99分', count: validScores.filter(s => s >=90 && s <=99).length }
    ];

    return {
        totalCount,    // 总人数
        maxScore,      // 最高分
        minScore,      // 最低分
        averageScore,  // 平均分（未四舍五入）
        scoreRanges    // 分数段分布
    };
}

function showNotification(options) {
    const { title, message, type = 'info' } = options;
    if (window.showNotification && window.showNotification !== showNotification) {
        try {
            window.showNotification(options);
            return; 
        } catch (e) {
            console.error('自定义通知调用失败:', e);
        }
    }
    alert(`${title}（${type}）：${message}`);
    console.log(`${title}（${type}）：${message}`);
}

// 当 DOM 内容加载完成后初始化 Excel 上传功能
document.addEventListener('DOMContentLoaded', initExcelUpload);