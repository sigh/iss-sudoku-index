// Title: Knightmare on Mount Pleasant Avenue
// Author: HalfBakedLunatic (aka David Workman)
// Video: https://www.youtube.com/watch?v=RQiQJV4Fxhw
// Source: https://sudokupad.app/e65gt211wt

// Normal Sudoku rules apply. Each listed cage has a distinct-digit total.
// White dots join consecutive digits; black dots join digits in a 1:2 ratio.
// A knight's move may not join digits whose sum is 5 or 15.
const cages = [
  [5, 'R1C3', 'R2C3'], [5, 'R1C6', 'R2C6'],
  [5, 'R8C4', 'R9C4'], [5, 'R8C7', 'R9C7'],
  [15, 'R3C8', 'R3C9'], [15, 'R6C8', 'R6C9'],
  [15, 'R4C1', 'R4C2'], [15, 'R7C1', 'R7C2'],
  [25, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  [5, 'R8C1', 'R9C1'], [15, 'R9C8', 'R9C9'],
  [15, 'R1C1', 'R1C2'], [5, 'R1C9', 'R2C9'],
];

// Cage coordinates are transcribed from the drawn cage outlines and totals.
const whiteDots = [
  ['R5C8', 'R5C9'], ['R5C6', 'R5C7'], ['R5C3', 'R5C4'],
  ['R5C1', 'R5C2'], ['R6C5', 'R7C5'], ['R3C5', 'R4C5'],
  ['R1C5', 'R2C5'], ['R8C5', 'R9C5'],
];
const blackDots = [['R7C3', 'R7C4'], ['R7C4', 'R8C4']];

const graph = cellGraph('9x9');
const knightmareKey = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 15, 9);
// Four knight offsets, stamped where their template remains within the grid.
const knightmare = [
  graph.makeReplicate(new Pair(knightmareKey, 'Knightmare', 'R1C1', 'R2C3'), graph.block('R1C1', 8, 7)),
  graph.makeReplicate(new Pair(knightmareKey, 'Knightmare', 'R1C1', 'R3C2'), graph.block('R1C1', 7, 8)),
  graph.makeReplicate(new Pair(knightmareKey, 'Knightmare', 'R1C3', 'R2C1'), graph.block('R1C1', 8, 7)),
  graph.makeReplicate(new Pair(knightmareKey, 'Knightmare', 'R1C2', 'R3C1'), graph.block('R1C1', 7, 8)),
];

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...knightmare,
];
