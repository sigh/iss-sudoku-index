// Title: Killer Arrows
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=oUOOUDRzVRc
// Source: https://app.crackingthecryptic.com/sudoku/RmhNHMBJGg

// Normal sudoku rules apply (default row/col/box all-different, standard
// 3x3 boxes). Digits along an arrow sum to the digit in that arrow's
// circle -- the circled cell is included in the arrow's own value and is
// not itself an addend. In cages, digits sum to the small clue at the
// cage's top-left cell, and cage cells are all different (Cage default).

const arrows = [
  ['R3C3', 'R2C2', 'R3C1'],
  ['R2C6', 'R3C6', 'R3C5', 'R2C5'],
  ['R1C7', 'R2C7', 'R3C7'],
  ['R3C9', 'R3C8', 'R2C8'],
  ['R5C4', 'R5C5', 'R5C6', 'R6C6'],
  ['R6C3', 'R5C3', 'R5C2'],
  ['R5C8', 'R5C7', 'R6C7', 'R6C8'],
  ['R7C8', 'R7C7', 'R7C6'],
  ['R8C5', 'R8C6', 'R8C7'],
  ['R8C2', 'R7C1', 'R6C2'],
];

const cages = [
  [12, 'R1C2', 'R1C3'],
  [15, 'R4C2', 'R4C3'],
  [13, 'R7C4', 'R8C4'],
  [15, 'R7C9', 'R8C9'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
