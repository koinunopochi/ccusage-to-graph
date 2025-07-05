#!/usr/bin/env node

import { program } from 'commander';
import * as asciichart from 'asciichart';
import chalk from 'chalk';
import { UsageData, CliOptions } from '../types';

// CLI設定
program
  .version('0.2.1')
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
  const proMax200 = 200;
  
  // スケールを適切に設定
  // スケールを固定値（例：$50, $100, $500）に設定することで、しきい値の位置を一定に保つ
  let scale: number;
  if (maxCost <= 50) {
    scale = 50;
  } else if (maxCost <= 100) {
    scale = 100;
  } else if (maxCost <= 200) {
    scale = 200;
  } else if (maxCost <= 500) {
    scale = 500;
  } else {
    scale = Math.ceil(maxCost / 100) * 100; // 100単位で切り上げ
  }
  
  usageData.forEach(item => {
    const date = new Date(item.date);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateLabel = `${month}/${day}`;
    const crown = item.cost === maxCost ? ' 👑' : '   ';
    const label = `${dateLabel}${crown}`.padEnd(10);
    // バーの長さは切り上げて、わずかでも超えた場合は次の文字を表示
    const barLength = Math.ceil((item.cost / scale) * chartWidth);
    
    // バーを構築
    let displayBar = '';
    
    // $20と$200のマーカー位置を計算（こちらは切り捨てて、確実に超えた時のみマーカーを移動）
    const marker20Pos = Math.floor((proMax20 / scale) * chartWidth);
    const marker200Pos = Math.floor((proMax200 / scale) * chartWidth);
    
    for (let i = 0; i < chartWidth; i++) {
      if (i < barLength) {
        // バーの部分
        if (item.cost >= proMax200) {
          displayBar += chalk.red('█');
        } else if (item.cost >= proMax20) {
          displayBar += chalk.yellow('█');
        } else {
          displayBar += chalk.green('█');
        }
      } else if (options.threshold && i === marker20Pos && scale >= proMax20) {
        displayBar += chalk.dim.yellow('|');
      } else if (options.threshold && i === marker200Pos && scale >= proMax200) {
        displayBar += chalk.dim.red('|');
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
      console.log(chalk.yellow('█') + ' $20-$200 (Exceeds Pro plan) ' + chalk.dim.yellow('|') + ' $20 threshold');
    }
    if (scale >= proMax200) {
      console.log(chalk.red('█') + ' > $200 (Exceeds Pro Max plan) ' + chalk.dim.red('|') + ' $200 threshold');
    }
    console.log(chalk.dim(`Scale: $0 - $${scale}`));
  }
}
