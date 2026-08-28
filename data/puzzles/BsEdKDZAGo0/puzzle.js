// Title: Uramaki
// Author: Pseudonum
// Video: https://www.youtube.com/watch?v=BsEdKDZAGo0
// Source: https://tinyurl.com/uramaki-puzzle

// Normal sudoku (rows, columns, boxes all-different). Killer cages: digits
// distinct and sum to the total printed in the cage's top-left cell. Arrows:
// bulb-cell digit equals the sum of the three arm cells. Both main diagonals
// are all-different. The grey cell must hold an even digit; there is no
// dedicated Even class, so it is encoded as a restricted Given
// (iss-constraints catalog, Givens And Variables).

const cages = [
  ['R1C2', 'R1C3', 8],
  ['R7C1', 'R8C1', 12],
  ['R9C7', 'R9C8', 5],
  ['R2C9', 'R3C9', 10],
  ['R3C1', 'R3C2', 11],
  ['R1C7', 'R2C7', 7],
  ['R7C8', 'R7C9', 10],
  ['R8C3', 'R9C3', 7],
].map(([...cellsAndSum]) => {
  const sum = cellsAndSum.pop();
  return new Cage(sum, ...cellsAndSum);
});

const arrows = [
  ['R3C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R3C7', 'R4C8', 'R5C8', 'R6C8'],
  ['R7C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R7C3', 'R6C2', 'R5C2', 'R4C2'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),

  new Given('R1C6', 6),
  new Given('R5C7', 6),
  new Given('R6C1', 6),
  new Given('R8C9', 6),

  ...cages,
  ...arrows,

  // Both main diagonals, per "either of the main diagonals".
  new Diagonal(1),
  new Diagonal(-1),

  // Grey cell must be even.
  new Given('R6C5', 2, 4, 6, 8),
];
