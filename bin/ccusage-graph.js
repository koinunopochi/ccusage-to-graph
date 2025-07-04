#!/usr/bin/env node

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const { program } = require('commander');

// CLI設定
program
  .version('0.1.0')
  .description('Display ccusage JSON output as terminal graphs')
  .option('-t, --type <type>', 'graph type (bar, line)', 'bar')
  .option('-p, --period <period>', 'time period to display (day, week, month)', 'day')
  .option('--no-threshold', 'hide Pro Max threshold lines')
  .parse(process.argv);

const options = program.opts();

// 標準入力からJSONを読み取る
let inputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const jsonData = JSON.parse(inputData);
    displayGraph(jsonData, options);
  } catch (error) {
    console.error('Error parsing JSON input:', error.message);
    process.exit(1);
  }
});

process.stdin.on('error', (error) => {
  console.error('Error reading input:', error.message);
  process.exit(1);
});

// タイムアウト設定（10秒）
setTimeout(() => {
  if (inputData === '') {
    console.error('No input received. Usage: ccusage --json | ccusage-graph');
    process.exit(1);
  }
}, 10000);

// グラフ表示関数
function displayGraph(data, options) {
  // blessed画面の作成
  const screen = blessed.screen({
    smartCSR: true,
    title: 'ccusage Graph'
  });

  // グリッドレイアウトの作成
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  // データの処理（仮実装 - ccusageの実際のJSON構造に合わせて調整が必要）
  const processedData = processData(data, options);

  // グラフの作成
  let chart;
  
  if (options.type === 'bar') {
    chart = grid.set(0, 0, 12, 12, contrib.bar, {
      label: 'Claude Usage',
      barWidth: 4,
      barSpacing: 6,
      xOffset: 0,
      maxHeight: 9,
      height: '100%',
      width: '100%',
      barBgColor: 'blue',
      labelColor: 'white'
    });
    
    chart.setData(processedData);
  } else if (options.type === 'line') {
    chart = grid.set(0, 0, 12, 12, contrib.line, {
      style: {
        line: "yellow",
        text: "green",
        baseline: "black"
      },
      xLabelPadding: 3,
      xPadding: 5,
      showLegend: true,
      wholeNumbersOnly: false,
      label: 'Claude Usage'
    });
    
    chart.setData(processedData.series);
  }

  // Pro Maxしきい値ラインの追加（オプション）
  if (options.threshold && options.type === 'bar') {
    // TODO: しきい値ラインの実装
    // blessed-contribではカスタムラインの追加が制限されているため、
    // 別の方法（カスタムウィジェットやオーバーレイ）を検討する必要があります
  }

  // キー操作の設定
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  // 画面のレンダリング
  screen.render();
}

// データ処理関数
function processData(rawData, options) {
  // usage配列が存在するか確認
  const usageData = rawData.usage || [];
  
  if (usageData.length === 0) {
    console.error('No usage data found in JSON');
    process.exit(1);
  }
  
  // 日付でソート
  usageData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (options.type === 'bar') {
    // 棒グラフ用のデータ形式
    const titles = usageData.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const data = usageData.map(item => item.cost || 0);
    
    return {
      titles: titles,
      data: data
    };
  } else if (options.type === 'line') {
    // 折れ線グラフ用のデータ形式
    const x = usageData.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const y = usageData.map(item => item.cost || 0);
    
    return {
      series: [{
        title: 'Cost (USD)',
        x: x,
        y: y,
        style: {
          line: 'yellow'
        }
      }]
    };
  }
}
