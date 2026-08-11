// Title: Isolation
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=K-PNrQjoWGM
// Source: https://app.crackingthecryptic.com/sudoku/QpMDNMDFQq

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// The four grey "window" regions each hold 1-9 once (Cage with an empty sum
// is an all-different region, no printed total).
// Cells a knight's move apart cannot repeat a digit (global anti-knight).
// Each arrow's arm cells sum to the digit in its circled bulb cell.

const windows = [
  new Cage('', 'R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'),
  new Cage('', 'R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'),
  new Cage('', 'R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'),
  new Cage('', 'R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'),
];

// Arrow(circleCell, ...armCells): first cell is the sum target.
const arrows = [
  new Arrow('R2C2', 'R3C2', 'R4C2', 'R4C3'),
  new Arrow('R2C8', 'R3C8', 'R4C8', 'R4C7'),
  new Arrow('R8C8', 'R7C7', 'R7C8', 'R6C8'),
  new Arrow('R8C2', 'R8C3', 'R8C4', 'R7C4'),
];

return [
  new Shape('9x9'),
  ...windows,
  ...arrows,
  new AntiKnight(),
];
