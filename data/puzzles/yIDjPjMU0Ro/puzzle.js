// Title: Pentomino Islands
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=yIDjPjMU0Ro
// Source: https://sudokupad.app/4tc1g21b3x

// Normal sudoku rules apply. Adjacent digits on any pentomino must differ in
// value by at least 5. Eight pentomino "islands" are marked on the grid; only
// orthogonally adjacent cells within the same island are constrained.

const farApart = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);

// Edges are every orthogonally adjacent cell pair within each marked
// pentomino island (one island has a 2x2 corner, giving it a 5th edge).
const islandEdges = [
  ['R1C1', 'R2C1'], ['R1C1', 'R1C2'], ['R1C2', 'R2C2'],
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'],

  ['R1C5', 'R1C6'], ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'],

  ['R3C5', 'R3C6'], ['R3C6', 'R4C6'], ['R3C6', 'R3C7'], ['R4C6', 'R5C6'],

  ['R3C9', 'R4C9'], ['R4C9', 'R5C9'], ['R5C8', 'R5C9'], ['R5C9', 'R6C9'],

  ['R4C1', 'R4C2'], ['R4C2', 'R4C3'], ['R4C3', 'R5C3'], ['R5C3', 'R5C4'],

  ['R6C1', 'R7C1'], ['R7C1', 'R8C1'], ['R8C1', 'R9C1'], ['R9C1', 'R9C2'],

  ['R7C3', 'R7C4'], ['R7C4', 'R8C4'], ['R8C4', 'R9C4'], ['R9C4', 'R9C5'],

  ['R7C6', 'R7C7'], ['R7C7', 'R8C7'], ['R8C7', 'R8C8'], ['R8C8', 'R9C8'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 4),
  new Given('R2C1', 9),
  new Given('R2C9', 2),
  new Given('R9C1', 3),
  new Given('R9C9', 6),

  ...islandEdges.map(
    ([a, b]) => new Pair(farApart, 'Pentomino island', a, b)),
];
