#!/usr/bin/env node

import { program } from 'commander';
import * as asciichart from 'asciichart';
import chalk from 'chalk';
import { UsageData, CliOptions } from '../types';

// CLI設定
program
  .version('0.1.2')
  .description('Display ccusage JSON output as terminal graphs')
  .option('-t, --type <type>', 'graph type (bar, line)', 'bar')
  .option('-p, --period <period>', 'time period to display (day, week, month)', 'day')
  .option('--no-threshold', 'hide Pro Max threshold lines')
  .parse(process.argv);

const options = program.opts() as CliOptions;

// 標準入力からJSONを読み取る
let inputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const jsonData: UsageData = JSON.parse(inputData);
    displayGraph(jsonData, options);
  } catch (error) {
    console.error(chalk.red('Error parsing JSON input:'), (error as Error).message);
    process.exit(1);
  }
});

process.stdin.on('error', (error) => {
  console.error(chalk.red('Error reading input:'), error.message);
  process.exit(1);
});

// タイムアウト設定（10秒）
setTimeout(() => {
  if (inputData === '') {
    console.error(chalk.yellow('No input received. Usage: ccusage --json | ccusage-graph'));
    process.exit(1);
  }
}, 10000);

// グラフ表示関数
function displayGraph(data: UsageData, options: CliOptions) {
  // ccusageの新しいフォーマット（daily）と旧フォーマット（usage）の両方に対応
  let usageData: Array<{ date: string; cost: number; tokens?: number }> = [];
  
  if (data.daily && data.daily.length > 0) {
    // 新フォーマット
    usageData = data.daily.map(item => ({
      date: item.date,
      cost: item.totalCost,
      tokens: item.totalTokens
    }));
  } else if (data.usage && data.usage.length > 0) {
    // 旧フォーマット（テストデータ用）
    usageData = data.usage.map(item => ({
      date: item.date,
      cost: item.cost,
      tokens: item.tokens
    }));
  } else {
    console.error(chalk.red('No usage data found in JSON'));
    process.exit(1);
  }
  
  // 日付でソート
  usageData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 最高値を見つける
  const maxCost = Math.max(...usageData.map(item => item.cost));
  
  console.log(chalk.bold.cyan('\n📊 Claude Usage Report\n'));
  
  if (options.type === 'line') {
    // 折れ線グラフ表示
    const costs = usageData.map(item => item.cost);
    const chart = asciichart.plot(costs, {
      height: 15,
      padding: '       ',
      format: (x: number) => x.toFixed(2).padStart(8)
    });
    
    console.log(chalk.green(chart));
    
    // X軸ラベル表示
    console.log('\n' + chalk.dim('Dates:'));
    usageData.forEach((item, index) => {
      const date = new Date(item.date);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const label = `${month}/${day}`;
      const crown = item.cost === maxCost ? ' 👑' : '';
      console.log(chalk.dim(`  [${index}] ${label}: $${item.cost.toFixed(2)}${crown}`));
    });
  } else {
    // 棒グラフ表示（ASCII文字で手動実装）
    displayBarChart(usageData, options, maxCost);
  }
  
  // 合計表示
  if (data.total) {
    console.log(chalk.bold.yellow(`\n💰 Total Cost: $${data.total.cost.toFixed(2)}`));
    console.log(chalk.bold.blue(`🔢 Total Tokens: ${data.total.tokens.toLocaleString()}`));
  } else {
    // daily形式の場合は自分で計算
    const totalCost = usageData.reduce((sum, item) => sum + item.cost, 0);
    const totalTokens = usageData.reduce((sum, item) => sum + (item.tokens || 0), 0);
    console.log(chalk.bold.yellow(`\n💰 Total Cost: $${totalCost.toFixed(2)}`));
    if (totalTokens > 0) {
      console.log(chalk.bold.blue(`🔢 Total Tokens: ${totalTokens.toLocaleString()}`));
    }
  }
}

// 棒グラフ表示関数
function displayBarChart(usageData: Array<{ date: string; cost: number }>, options: CliOptions, maxCostValue?: number) {
  const maxCost = maxCostValue || Math.max(...usageData.map(item => item.cost));
  const chartWidth = 50;
  const proMax20 = 20;
  const proMax300 = 300;
  
  // スケールを適切に設定（しきい値が見えるように）
  const scale = Math.max(maxCost, proMax20 * 1.1); // 少なくとも$20ラインが見えるように
  
  usageData.forEach(item => {
    const date = new Date(item.date);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateLabel = `${month}/${day}`;
    const crown = item.cost === maxCost ? ' 👑' : '   ';
    const label = `${dateLabel}${crown}`.padEnd(10);
    const barLength = Math.round((item.cost / scale) * chartWidth);
    
    // しきい値の位置を計算
    const threshold20Pos = Math.round((proMax20 / scale) * chartWidth);
    const threshold300Pos = Math.round((proMax300 / scale) * chartWidth);
    
    // バーを構築（しきい値ラインを含む）
    let displayBar = '';
    for (let i = 0; i < chartWidth; i++) {
      // しきい値ラインをまず確認
      if (options.threshold && i === threshold20Pos && scale >= proMax20) {
        // $20しきい値ライン
        if (i < barLength) {
          // バーと重なる場合は、バーの色に応じた縦線を表示
          if (item.cost >= proMax300) {
            displayBar += chalk.red('┃');
          } else if (item.cost >= proMax20) {
            displayBar += chalk.yellow('┃');
          } else {
            displayBar += chalk.green('┃');
          }
        } else {
          displayBar += chalk.yellow('│');
        }
      } else if (options.threshold && i === threshold300Pos && scale >= proMax300) {
        // $300しきい値ライン
        if (i < barLength) {
          displayBar += chalk.red('┃');
        } else {
          displayBar += chalk.red('│');
        }
      } else if (i < barLength) {
        // バーの部分
        if (item.cost >= proMax300) {
          displayBar += chalk.red('█');
        } else if (item.cost >= proMax20) {
          displayBar += chalk.yellow('█');
        } else {
          displayBar += chalk.green('█');
        }
      } else {
        displayBar += ' ';
      }
    }
    
    console.log(`${chalk.gray(label)} ${displayBar} ${chalk.white(`$${item.cost.toFixed(2)}`)}`);
  });
  
  // しきい値の凡例表示
  if (options.threshold) {
    console.log('\n' + chalk.dim('Legend:'));
    console.log(chalk.green('█') + ' < $20 (Less than Pro plan)');
    if (scale >= proMax20) {
      console.log(chalk.yellow('█') + ' $20-$300 (Exceeds Pro plan) ' + chalk.yellow('│') + ' $20 line');
    }
    if (scale >= proMax300) {
      console.log(chalk.red('█') + ' > $300 (Exceeds Pro Max plan) ' + chalk.red('│') + ' $300 line');
    }
  }
}
