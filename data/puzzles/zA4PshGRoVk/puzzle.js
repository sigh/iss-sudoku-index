// Title: Arrow renban sudoku
// Author: Christounet
// Video: https://www.youtube.com/watch?v=zA4PshGRoVk
// Source: https://sudokupad.app/fphttzusrk

// Normal sudoku rules apply. Standard 9x9 grid, no givens.
//
// Arrows: digits along the arrow sum to the digit in the circle. Two arrows
// (5 and 6 below) share the same circle cell R5C5.
const arrows = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C9', 'R1C8', 'R1C7'],
  ['R3C1', 'R4C2', 'R4C3'],
  ['R3C9', 'R4C8', 'R4C7'],
  ['R5C5', 'R5C6', 'R5C7', 'R6C7'],
  ['R5C5', 'R5C4', 'R5C3', 'R6C3'],
  ['R8C7', 'R7C7', 'R7C8', 'R6C9'],
  ['R7C4', 'R6C5', 'R7C6'],
];

// Renban (purple) lines: each is a set of non-repeating consecutive digits
// in any order.
const renbans = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R3C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7'],
  ['R4C4', 'R4C5', 'R4C6'],
  ['R6C2', 'R5C2', 'R5C1'],
  ['R6C8', 'R5C8', 'R5C9'],
  ['R6C1', 'R7C2', 'R7C3', 'R8C3'],
  ['R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  // Black dot: one digit double the other (Kropki black dot).
  new BlackDot('R1C5', 'R2C5'),
];
