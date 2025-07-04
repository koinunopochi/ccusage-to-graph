# ccusage-to-graph

Display ccusage JSON output as terminal graphs with Claude Pro/Pro Max threshold indicators.

## Features
- 📊 Bar chart and line chart visualization
- 🎨 Color-coded cost ranges (green/yellow/red)
- 📏 Pro and Pro Max threshold lines ($20 and $300)
- 👑 Crown emoji marks the highest cost day
- 🚀 Lightweight and fast using asciichart
- 📝 TypeScript implementation
- 🔄 Compatible with ccusage JSON output format

## Installation

### Using npx (recommended)
No installation required! Just use with npx:
```bash
npx ccusage@latest --json | npx @koinunopochi/ccusage-to-graph@latest
```

### Global installation
```bash
npm install -g @koinunopochi/ccusage-to-graph
```

### Local development
```bash
git clone https://github.com/koinunopochi/ccusage-to-graph.git
cd ccusage-to-graph
npm install
npm run build
```

## Usage

### With npx (no installation needed)
```bash
# Bar chart (default)
npx ccusage@latest --json | npx @koinunopochi/ccusage-to-graph@latest

# Line chart
npx ccusage@latest --json | npx @koinunopochi/ccusage-to-graph@latest --type line

# Hide threshold lines
npx ccusage@latest --json | npx @koinunopochi/ccusage-to-graph@latest --no-threshold
```

### With global installation
```bash
# After installing globally
ccusage --json | ccusage-graph
```

### Test with sample data
```bash
# Using local build
cat test-data.json | node dist/bin/ccusage-graph.js
cat test-data-threshold.json | node dist/bin/ccusage-graph.js
```

## Options
- `-t, --type <type>`: Graph type (`bar` or `line`, default: `bar`)
- `-p, --period <period>`: Time period to display (future feature)
- `--no-threshold`: Hide Pro and Pro Max threshold lines

## Color Coding
- 🟢 Green: Under $20 (Less than Pro plan)
- 🟡 Yellow: $20-$300 (Exceeds Pro plan)
- 🔴 Red: Over $300 (Exceeds Pro Max plan)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

koinunopochi

## Contributing

Issues and Pull Requests are welcome!

## Links

- [GitHub Repository](https://github.com/koinunopochi/ccusage-to-graph)
- [npm Package](https://www.npmjs.com/package/@koinunopochi/ccusage-to-graph)
- [ccusage](https://www.npmjs.com/package/ccusage)