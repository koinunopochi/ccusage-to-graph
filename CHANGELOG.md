# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-01-04

### Fixed
- Fixed bar length calculation using Math.ceil() to ensure values just above thresholds display correctly
- Fixed threshold marker positions using Math.floor() for more accurate placement
- Fixed issue where $22 appeared as only 2 characters instead of 3 in $500 scale

## [0.2.0] - 2025-01-04

### Changed
- Completely redesigned threshold display system
- Scale now uses fixed increments ($50, $100, $200, $500) for clearer visualization
- Threshold markers appear as subtle lines in the empty space after bars
- Removed overlapping threshold lines on bars for cleaner look

### Fixed
- Fixed issue where bars exceeding thresholds appeared before threshold markers
- Fixed scale calculation to ensure threshold positions are always accurate

### Added
- Scale information in legend showing the current scale range

## [0.1.2] - 2025-01-04

### Fixed
- Fixed threshold line visibility - now shows on top of bars when they overlap
- Threshold lines use different characters when overlapping with bars (┃) vs empty space (│)

## [0.1.1] - 2025-01-04

### Fixed
- Fixed date formatting to use consistent MM/DD format
- Fixed bar chart alignment issues when date strings have different lengths

## [0.1.0] - 2025-01-04

### Added
- Initial release
- Bar chart visualization for ccusage JSON output
- Line chart visualization option (`--type line`)
- Color-coded cost ranges:
  - Green: Under $20 (Less than Pro plan)
  - Yellow: $20-$300 (Exceeds Pro plan)
  - Red: Over $300 (Exceeds Pro Max plan)
- Pro and Pro Max threshold lines ($20 and $300)
- Crown emoji (👑) marks the highest cost day
- Support for both ccusage daily format and legacy format
- TypeScript implementation with type safety
- Commander.js for CLI options
- Chalk for colored terminal output
- ASCII chart rendering with asciichart library

### Features
- Pipe-friendly design for use with ccusage
- Responsive chart width
- Automatic date sorting
- Total cost and tokens summary
- Optional threshold lines (`--no-threshold`)

### Usage
```bash
npx ccusage@latest --json | npx @koinunopochi/ccusage-to-graph@latest
```