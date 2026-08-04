// Title: Arrow Sudoku
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=30Qpm8APXl0
// Source: https://app.crackingthecryptic.com/sudoku/qDFjTTFG2h
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in the corresponding circle ->
// one Arrow(circle, ...arm) per arrow. Four circles (R4C1, R6C4) anchor
// more than one arrow each; every anchored arrow is encoded as its own
// Arrow constraint.
//
// Arrow cells were read off the drawn geometry: each arrow starts at the
// circled cell and runs, straight or bent, through the remaining cells
// drawn along its line.
const arrows = [
  ['R1C2', 'R2C3', 'R3C4'],
  ['R3C6', 'R2C6', 'R1C6'],
  ['R2C9', 'R2C8', 'R1C8'],
  ['R4C9', 'R3C8', 'R2C7'],
  ['R4C9', 'R4C8', 'R4C7'],
  ['R2C1', 'R2C2', 'R3C2', 'R3C1'],
  ['R4C1', 'R4C2', 'R3C3'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R4C1', 'R5C2', 'R6C2'],
  ['R6C4', 'R5C4', 'R4C4'],
  ['R6C4', 'R5C5', 'R4C5'],
  ['R6C4', 'R6C5', 'R7C6'],
  ['R6C4', 'R7C3', 'R8C3', 'R9C3'],
  ['R9C5', 'R8C5', 'R7C5'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R8C8', 'R9C8', 'R9C7'],
  ['R9C9', 'R8C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
