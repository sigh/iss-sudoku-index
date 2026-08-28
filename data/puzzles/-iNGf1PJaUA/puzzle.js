// Title: One Of THE Great Sudoku Puzzles
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-iNGf1PJaUA
// Source: https://cracking-the-cryptic.web.app/sudoku/jfn8GP4LBQ

// Normal sudoku with 9 irregular 9-cell regions replacing the boxes
// (NoBoxes + one AllDifferent per region). Region I is scattered across the
// grid rather than contiguous -- its cells are exactly the puzzle's
// grey-shaded cells.
//
// "Each digit must see one or more identical digits by a chess knight's
// single move": for every cell, some knight-move-away cell holds the same
// value. Encoded per cell as `Or(SameValues(2, cell, neighbour) for each
// knight neighbour)` -- any one matching neighbour satisfies the
// disjunction.

const graph = cellGraph('9x9');

// Regions A-H are eight contiguous 9-cell shapes drawn on the grid. Region I
// is the complement of A-H (its cells are the ones shaded grey rather than
// outlined).
const REGIONS = [
  // A
  ['R1C1', 'R2C1', 'R2C2', 'R3C2', 'R3C3', 'R4C3', 'R4C4', 'R3C4', 'R2C4'],
  // B
  ['R1C2', 'R1C3', 'R2C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R2C6', 'R1C6'],
  // C
  ['R1C8', 'R2C9', 'R2C8', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R3C6', 'R4C6'],
  // D
  ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C9', 'R6C9', 'R6C8', 'R7C9', 'R8C9'],
  // E
  ['R4C1', 'R4C2', 'R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R7C2'],
  // F
  ['R5C3', 'R5C4', 'R4C5', 'R5C5', 'R5C6', 'R6C5', 'R7C5', 'R8C5', 'R8C4'],
  // G
  ['R6C4', 'R6C3', 'R7C3', 'R8C3', 'R9C3', 'R9C1', 'R9C2', 'R9C4', 'R9C5'],
  // H
  ['R6C6', 'R7C6', 'R7C7', 'R7C8', 'R8C8', 'R8C7', 'R9C8', 'R9C7', 'R9C6'],
  // I (scattered; complement of A-H, matches the puzzle's shaded cells)
  ['R1C7', 'R1C9', 'R3C1', 'R5C8', 'R6C2', 'R6C7', 'R7C4', 'R8C6', 'R9C9'],
];

// Givens (payload cells[][].value).
const givens = [
  new Given('R2C1', 3),
  new Given('R2C8', 8),
  new Given('R3C3', 4),
  new Given('R5C1', 2),
  new Given('R5C5', 9),
  new Given('R5C9', 7),
  new Given('R7C7', 5),
  new Given('R8C2', 1),
  new Given('R8C9', 6),
];

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const knightRule = graph.cells().map(cell => {
  const neighbours = KNIGHT_OFFSETS
    .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
    .filter(n => n !== null);
  return new Or([
    ...neighbours.map(n => new SameValues(2, cell, n)),
  ]);
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...REGIONS.map(region => new AllDifferent(...region)),
  ...givens,
  ...knightRule,
];
