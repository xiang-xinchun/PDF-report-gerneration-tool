/**
 * 课程目标动态管理功能测试脚本
 * 用于验证增删功能和计算逻辑
 */

(function() {
    'use strict';

    console.log('=== 课程目标动态管理功能测试 ===');

    // 等待DOM加载完成
    function runTests() {
        setTimeout(() => {
            console.log('\n开始测试...\n');

            // 测试1: 检查初始状态
            test1_checkInitialState();

            // 测试2: 测试添加目标
            setTimeout(() => test2_addGoal(), 1000);

            // 测试3: 测试删除目标
            setTimeout(() => test3_removeGoal(), 2000);

            // 测试4: 测试计算功能
            setTimeout(() => test4_calculation(), 3000);

            // 测试5: 测试边界条件
            setTimeout(() => test5_boundaryConditions(), 4000);

            console.log('\n所有测试已排队执行\n');
        }, 2000); // 等待所有模块加载完成
    }

    /**
     * 测试1: 检查初始状态
     */
    function test1_checkInitialState() {
        console.log('测试1: 检查初始状态');
        
        try {
            // 检查目标管理器是否加载
            if (!window.goalManager) {
                throw new Error('目标管理器未加载');
            }
            console.log('✓ 目标管理器已加载');

            // 检查计算模块是否加载
            if (!window.calculationModule) {
                throw new Error('计算模块未加载');
            }
            console.log('✓ 计算模块已加载');

            // 检查getCurrentGoalCount函数
            if (typeof window.calculationModule.getCurrentGoalCount !== 'function') {
                throw new Error('getCurrentGoalCount函数不存在');
            }
            console.log('✓ getCurrentGoalCount函数存在');

            // 获取初始目标数量
            const goalCount = window.calculationModule.getCurrentGoalCount();
            console.log(`✓ 初始目标数量: ${goalCount}`);

            // 检查控制按钮是否存在
            const addButton = document.getElementById('add-goal-button');
            const removeButton = document.getElementById('remove-goal-button');
            const countLabel = document.getElementById('goal-count-label');

            if (!addButton || !removeButton || !countLabel) {
                throw new Error('控制按钮未正确创建');
            }
            console.log('✓ 控制按钮已创建');

            console.log('测试1: 通过 ✓\n');
        } catch (error) {
            console.error('测试1: 失败 ✗');
            console.error('错误:', error.message);
        }
    }

    /**
     * 测试2: 测试添加目标
     */
    function test2_addGoal() {
        console.log('测试2: 测试添加目标');

        try {
            const initialCount = window.calculationModule.getCurrentGoalCount();
            console.log(`初始目标数量: ${initialCount}`);

            // 添加一个目标
            window.goalManager.addGoal();
            
            setTimeout(() => {
                const newCount = window.calculationModule.getCurrentGoalCount();
                console.log(`添加后目标数量: ${newCount}`);

                if (newCount !== initialCount + 1) {
                    throw new Error(`目标数量不正确: 期望 ${initialCount + 1}, 实际 ${newCount}`);
                }

                // 检查新目标是否在第二部分创建
                const newGoalContainer = document.getElementById(`target${newCount}-container`);
                if (!newGoalContainer) {
                    throw new Error(`新目标容器未创建`);
                }
                console.log('✓ 新目标容器已创建');

                // 检查表1是否添加了新列
                const table1Headers = document.querySelectorAll('#table1-container table thead .goal-header');
                if (table1Headers.length !== newCount) {
                    throw new Error(`表1列数不正确: 期望 ${newCount}, 实际 ${table1Headers.length}`);
                }
                console.log('✓ 表1已添加新列');

                // 检查表3是否添加了新列
                const table3Headers = document.querySelectorAll('#table3-container table thead th');
                // 表3有一个空的第一列和一个操作列
                const expectedHeaders = newCount + 2;
                if (table3Headers.length !== expectedHeaders) {
                    console.warn(`表3列数: 期望 ${expectedHeaders}, 实际 ${table3Headers.length}`);
                }

                console.log('测试2: 通过 ✓\n');
            }, 500);
        } catch (error) {
            console.error('测试2: 失败 ✗');
            console.error('错误:', error.message);
        }
    }

    /**
     * 测试3: 测试删除目标
     */
    function test3_removeGoal() {
        console.log('测试3: 测试删除目标');

        try {
            const initialCount = window.calculationModule.getCurrentGoalCount();
            console.log(`初始目标数量: ${initialCount}`);

            if (initialCount <= 1) {
                console.log('⚠ 只有1个目标，跳过删除测试');
                return;
            }

            // 模拟确认对话框
            const originalConfirm = window.confirm;
            window.confirm = () => true;

            // 删除一个目标
            window.goalManager.removeGoal();

            // 恢复confirm
            window.confirm = originalConfirm;

            setTimeout(() => {
                const newCount = window.calculationModule.getCurrentGoalCount();
                console.log(`删除后目标数量: ${newCount}`);

                if (newCount !== initialCount - 1) {
                    throw new Error(`目标数量不正确: 期望 ${initialCount - 1}, 实际 ${newCount}`);
                }

                // 检查旧目标是否被删除
                const deletedGoalContainer = document.getElementById(`target${initialCount}-container`);
                if (deletedGoalContainer) {
                    throw new Error(`旧目标容器未删除`);
                }
                console.log('✓ 旧目标容器已删除');

                // 检查表1是否删除了列
                const table1Headers = document.querySelectorAll('#table1-container table thead .goal-header');
                if (table1Headers.length !== newCount) {
                    throw new Error(`表1列数不正确: 期望 ${newCount}, 实际 ${table1Headers.length}`);
                }
                console.log('✓ 表1已删除列');

                console.log('测试3: 通过 ✓\n');
            }, 500);
        } catch (error) {
            console.error('测试3: 失败 ✗');
            console.error('错误:', error.message);
        }
    }

    /**
     * 测试4: 测试计算功能
     */
    function test4_calculation() {
        console.log('测试4: 测试计算功能');

        try {
            const goalCount = window.calculationModule.getCurrentGoalCount();
            console.log(`当前目标数量: ${goalCount}`);

            // 填充一些测试数据到表1
            const table1Rows = document.querySelectorAll('#table1-container table tbody tr');
            if (table1Rows.length > 0) {
                const firstRow = table1Rows[0];
                const cells = firstRow.querySelectorAll('.goal-cell');
                
                // 为每个目标设置H/M/L值
                cells.forEach((cell, index) => {
                    if (index < goalCount) {
                        const select = cell.querySelector('select');
                        if (select) {
                            select.value = index % 3 === 0 ? 'H' : index % 3 === 1 ? 'M' : 'L';
                        }
                    }
                });

                console.log('✓ 已填充表1测试数据');
            }

            // 触发计算
            if (window.calculationModule.smartCalculate) {
                window.calculationModule.smartCalculate();
                console.log('✓ 触发智能计算');
            }

            // 检查权重是否计算
            setTimeout(() => {
                let hasWeights = false;
                for (let i = 1; i <= goalCount; i++) {
                    const weightElement = document.getElementById(`targetWeight${i}`);
                    if (weightElement && weightElement.textContent) {
                        hasWeights = true;
                        console.log(`目标${i}权重: ${weightElement.textContent}`);
                    }
                }

                if (hasWeights) {
                    console.log('✓ 权重计算成功');
                } else {
                    console.warn('⚠ 权重未计算或数据不足');
                }

                console.log('测试4: 完成\n');
            }, 500);
        } catch (error) {
            console.error('测试4: 失败 ✗');
            console.error('错误:', error.message);
        }
    }

    /**
     * 测试5: 测试边界条件
     */
    function test5_boundaryConditions() {
        console.log('测试5: 测试边界条件');

        try {
            // 测试删除到只剩1个目标时是否阻止
            const currentCount = window.calculationModule.getCurrentGoalCount();
            
            if (currentCount === 1) {
                console.log('当前只有1个目标，测试删除保护');
                
                // 模拟确认对话框
                const originalConfirm = window.confirm;
                window.confirm = () => true;
                
                const originalAlert = window.alert;
                let alertCalled = false;
                window.alert = (msg) => {
                    alertCalled = true;
                    console.log(`Alert: ${msg}`);
                };
                
                // 尝试删除
                window.goalManager.removeGoal();
                
                // 恢复
                window.confirm = originalConfirm;
                window.alert = originalAlert;
                
                setTimeout(() => {
                    const newCount = window.calculationModule.getCurrentGoalCount();
                    if (newCount === 1) {
                        console.log('✓ 删除保护生效，仍有1个目标');
                    } else {
                        console.error('✗ 删除保护失败');
                    }
                }, 300);
            } else {
                console.log('⚠ 当前有多个目标，跳过删除保护测试');
            }

            console.log('测试5: 完成\n');
            console.log('=== 所有测试执行完毕 ===\n');
        } catch (error) {
            console.error('测试5: 失败 ✗');
            console.error('错误:', error.message);
        }
    }

    // 开始测试
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runTests);
    } else {
        runTests();
    }

})();
