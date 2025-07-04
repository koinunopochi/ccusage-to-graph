const blessed = require('blessed');
const contrib = require('blessed-contrib');

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Test Graph'
});

// Create grid
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

// Create bar chart
const bar = grid.set(0, 0, 12, 12, contrib.bar, {
  label: 'Test Bar Chart',
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  maxHeight: 9,
  height: '100%',
  width: '100%',
  barBgColor: 'blue'
});

// Set data
bar.setData({
  titles: ['1/1', '1/2', '1/3', '1/4', '1/5'],
  data: [2.5, 5.0, 7.5, 4.0, 6.0]
});

// Key handling
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Render
screen.render();