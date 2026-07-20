// Title: One Way Road
// Author: BuniaGL
// Video: https://www.youtube.com/watch?v=32p9syjQB4Y
// Source: https://sudokupad.app/vqek0zzqfr

// Standard Sudoku with anti-knight, German whisper, region-sum, renban,
// modular-line, and indicated Kropki-dot rules. There is no negative dot rule.

const greenLine = ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3'];
const blueLines = [
  ['R2C4', 'R3C3', 'R4C2', 'R5C1'],
  ['R6C2', 'R7C3', 'R8C4'],
];
const purpleLines = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R9C6', 'R9C5', 'R9C4'],
  ['R1C3', 'R1C2', 'R1C1'],
  ['R9C3', 'R9C2', 'R9C1'],
  ['R9C7', 'R9C8', 'R9C9'],
];
const mintLine = ['R1C7', 'R1C8', 'R1C9'];
const blackDots = [
  ['R1C7', 'R1C8'],
  ['R1C5', 'R1C6'],
  ['R2C8', 'R2C9'],
  ['R3C3', 'R3C4'],
];
const whiteDots = [
  ['R4C4', 'R5C4'],
  ['R6C5', 'R6C6'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Whisper(5, ...greenLine),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  ...purpleLines.map(cells => new Renban(...cells)),
  new Modular(3, ...mintLine),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
