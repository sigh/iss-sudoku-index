// Title: Semal Tree
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=zIjOY7TFbkU
// Source: https://app.crackingthecryptic.com/sudoku/F8rR6n2pdb

// Normal sudoku rules apply (rows, columns and boxes, enforced by default).
// Digits cannot repeat along the blue diagonal (R1C1..R9C9): Diagonal(-1)
// (direction -1 draws top-left to bottom-right, matching the drawn line).
// Digits along an arrow sum to the digit in that arrow's circle: three
// circles sit on the diagonal (R3C3, R6C6, R9C9) and each is the bulb for
// every arrow rooted there.
// A pink line contains a set of non-repeating consecutive digits, any
// order: Renban.
// Cells separated by a white dot must contain consecutive digits: WhiteDot.

// Each entry is [bulb, ...arm cells], one arrow per drawn ray.
const arrows = [
  // R3C3 circle: one arrow per open direction.
  ['R3C3', 'R2C3', 'R1C3'],
  ['R3C3', 'R3C2', 'R3C1'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6'],
  // R6C6 circle: four two-cell arrows.
  ['R6C6', 'R5C6', 'R4C6'],
  ['R6C6', 'R7C6', 'R8C6'],
  ['R6C6', 'R6C5', 'R6C4'],
  ['R6C6', 'R6C7', 'R6C8'],
  // R9C9 circle (grid corner): only two directions are open.
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R9C9', 'R9C8', 'R9C7', 'R9C6'],
];

const renbanLines = [
  ['R5C2', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4', 'R2C5'],
  ['R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5'],
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  ...arrows.map(cells => new Arrow(...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  new WhiteDot('R3C8', 'R3C9'),
];
