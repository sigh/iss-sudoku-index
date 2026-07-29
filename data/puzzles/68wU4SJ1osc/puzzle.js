// Title: Evening Shade
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=68wU4SJ1osc
// Source: https://sudokupad.app/james-sinclair/evening-shade

// Normal Sudoku rules apply. Cells a knight's move apart differ. Blue paths are
// region sum lines: box borders split each path into equal-sum segments. White
// dots join consecutive digits. Each quadruple circle contains its listed digits.
const regionSumLines = [
  ['R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R6C7', 'R5C6'],
  ['R8C6', 'R9C7'],
];

// White-dot pairs from the seven small white dots in the source artwork.
const whiteDots = [
  ['R7C6', 'R7C7'], ['R6C7', 'R7C7'], ['R7C8', 'R7C7'],
  ['R7C7', 'R8C7'], ['R6C2', 'R6C3'], ['R5C8', 'R4C8'],
  ['R2C8', 'R2C9'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  new Quad('R3C3', 6, 7, 8, 9),
  new Quad('R1C1', 1, 6),
];
