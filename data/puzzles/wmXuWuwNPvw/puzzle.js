// Title: Diagonal Drift
// Author: DhrAbel
// Video: https://www.youtube.com/watch?v=wmXuWuwNPvw
// Source: https://sudokupad.app/dugglgpue7

// Normal sudoku rules apply. Nine arrows: the digit in each circle equals the
// sum of the digits along its arrow's shaft (Arrow's first cell is the
// circle, the rest are the shaft). In every 3x3 box the two diagonals have
// equal sum (e.g. R1C1+R2C2+R3C3 = R1C3+R2C2+R3C1); computed per box below
// rather than hand-listing all 18 diagonals.

const givens = [
  new Given('R1C1', 8),
  new Given('R2C2', 3),
];

// Arrow cell lists transcribed directly from the payload's `arrow[].lines`
// entries, each of which already starts with the circle cell.
const arrows = [
  new Arrow('R6C4', 'R6C3', 'R5C2', 'R4C1'),
  new Arrow('R6C6', 'R6C7', 'R5C8', 'R4C9'),
  new Arrow('R4C4', 'R4C5', 'R5C4', 'R6C5'),
  new Arrow('R2C7', 'R1C7', 'R2C8', 'R3C9'),
  new Arrow('R3C4', 'R2C4', 'R1C5', 'R1C6'),
  new Arrow('R9C6', 'R9C5', 'R8C4', 'R7C4'),
  new Arrow('R8C9', 'R9C9', 'R8C8', 'R7C7'),
  new Arrow('R8C6', 'R7C7'),
  new Arrow('R7C2', 'R7C1', 'R8C2', 'R9C1'),
];

// Box-diagonal equal-sum: for each of the 9 boxes, the main diagonal
// (top-left to bottom-right) must sum to the same value as the anti-diagonal
// (top-right to bottom-left). graph.boxes() lists each box's 9 cells in
// row-major order, so indices 0,4,8 are the main diagonal and 2,4,6 the
// anti-diagonal.
const graph = cellGraph('9x9');
const boxDiagonals = graph.boxes().map(box => new EqualSum(
  [box[0], box[4], box[8]],
  [box[2], box[4], box[6]],
));

return [
  new Shape('9x9'),
  ...givens,
  ...arrows,
  ...boxDiagonals,
];
