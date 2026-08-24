// Title: Arrow Sudoku
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=g5GH6oGCY2g
// Source: https://app.crackingthecryptic.com/sudoku/h26fRp8fQP
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in the arrow's circled bulb cell,
// and digits may repeat on an arrow -> one Arrow(bulb, ...arm) per arrow,
// which permits repeats on the arm by default.
//
// Arrow cells (bulb first) were read off the drawn geometry: each arrow is
// a straight-segmented line starting at the edge of a circled cell and
// running through the remaining cells the line passes through.
const arrows = [
  ['R2C1', 'R3C2', 'R3C3', 'R3C4'],
  ['R3C1', 'R2C2', 'R2C3', 'R2C4'],
  ['R1C8', 'R2C9', 'R3C8', 'R2C7', 'R1C6'],
  ['R3C7', 'R4C8', 'R5C9'],
  ['R4C4', 'R5C3', 'R6C3'],
  ['R7C1', 'R6C2', 'R5C2'],
  ['R7C3', 'R7C4', 'R7C5', 'R6C6', 'R5C6'],
  ['R8C9', 'R9C9', 'R8C8'],
  ['R7C7', 'R8C6', 'R9C6'],
  ['R8C2', 'R9C3', 'R9C4'],
  ['R9C2', 'R8C3', 'R8C4'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
