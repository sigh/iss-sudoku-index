// Title: Sauron's Demise
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=ieOaya1Vt9A
// Source: https://tinyurl.com/chebzxy8

// Rules: normal sudoku, plus 9 arrows (digits along the arrow sum to the
// bulb's digit) and 2 little killer sums (digits along the indicated
// diagonal, read from the off-grid marker inward, sum to the given total).
// No given digits.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Arrow(bulb, ...armCells): bulb cell first (the sum target), then the
// arrow's path cells in drawn order.
const arrows = [
  ['R2C2', 'R3C3', 'R3C4', 'R3C5'],
  ['R2C8', 'R3C9', 'R4C9', 'R5C9'],
  ['R7C2', 'R6C3', 'R5C3', 'R4C3'],
  ['R8C7', 'R9C6', 'R9C5', 'R9C4'],
  ['R9C9', 'R8C8', 'R7C8', 'R7C7'],
  ['R3C6', 'R2C7', 'R1C8'],
  ['R9C3', 'R8C2', 'R8C1'],
  ['R9C7', 'R8C6', 'R7C6', 'R6C7'],
  ['R4C8', 'R5C7', 'R5C6', 'R4C5'],
].map(cells => new Arrow(...cells));

return [
  ...arrows,

  // Diagonal from the off-grid marker above column 8, reading down-left.
  LittleKiller.fromCells(37, graph.ray('R1C7', 1, -1), geometry),
  // Diagonal from the off-grid marker left of row 6, reading up-right.
  LittleKiller.fromCells(29, graph.ray('R5C1', -1, 1), geometry),
];
