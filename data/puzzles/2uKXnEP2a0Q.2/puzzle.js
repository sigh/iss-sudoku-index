// Title: Slot Killer
// Author: Swaroop Guggilam
// Video: https://www.youtube.com/watch?v=2uKXnEP2a0Q
// Source: https://cracking-the-cryptic.web.app/sudoku/Lr8MHdgq9J

// Rules encoded:
//   Normal sudoku -- 1-9 once per row, column and 3x3 box (the engine baseline;
//   the nine regions drawn on the board are the standard boxes).
//   Killer cages -- the digits of a cage sum to the total printed in its corner.
//
// Omitted: columns 1, 5 and 9 are shaded light grey over all 27 of their cells.
// The source publishes no rules text, so nothing states what the shading means
// and no constraint is placed on it here. Without it the board admits many
// solutions.

// Drawn givens, ten in all.
const givens = [
  ['R1C6', 3],
  ['R3C4', 2],
  ['R3C6', 9],
  ['R4C7', 7],
  ['R5C2', 4],
  ['R5C8', 8],
  ['R6C3', 5],
  ['R7C4', 6],
  ['R7C6', 1],
  ['R9C4', 3],
];

// Drawn cages: printed total, then the cage's cells. One cage per box, each
// wholly inside that box.
const cages = [
  [42, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R3C2', 'R3C3'],
  [21, 'R2C4', 'R2C5', 'R2C6', 'R3C5'],
  [35, 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R3C7', 'R3C8', 'R3C9'],
  [25, 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2'],
  [25, 'R4C4', 'R4C5', 'R4C6', 'R5C5', 'R6C5'],
  [23, 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8'],
  [29, 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  [19, 'R7C5', 'R8C4', 'R8C5', 'R8C6'],
  [34, 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
