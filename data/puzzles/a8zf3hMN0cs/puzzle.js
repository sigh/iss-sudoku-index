// Title: A Very Odd Killer
// Author: Niverio
// Video: https://www.youtube.com/watch?v=a8zf3hMN0cs
// Source: https://app.crackingthecryptic.com/sudoku/dm2DT4MNQM
//
// Rules encoded: normal sudoku (standard boxes); the grey-circle cell must be
// odd; every cage (all 30 have no printed total) must have digits summing to
// an odd number, in addition to the usual killer-cage all-different; six
// diagonals give an outside little-killer total; the remaining twelve drawn
// diagonals are unclued but must also sum to an odd number.
//
// Shared machine for "sum of these cells is odd": track the running parity
// (XOR of each value's parity) and accept only if it ends up 1. Order does not
// matter since XOR is commutative, so the same spec is reused for cages
// (unordered cell sets) and for arrow rays (cell order is the ray direction,
// but irrelevant to the parity check).
const oddSumSpec = NFA.encodeSpec({
  startState: 0,
  transition: (parity, value) => parity ^ (value % 2),
  accept: (parity) => parity === 1,
}, 9);

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cage cell groups, transcribed from the puzzle's drawn cage geometry
// (excluding metadata-stub entries for title/author/rules that carry no
// cells).
const CAGES = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R1C4', 'R2C4'],
  ['R1C6', 'R2C6'],
  ['R1C7', 'R2C7'],
  ['R3C6', 'R4C6'],
  ['R3C4', 'R4C4'],
  ['R4C3', 'R4C2'],
  ['R4C1', 'R5C1'],
  ['R5C2', 'R6C2'],
  ['R6C1', 'R7C1'],
  ['R8C3', 'R9C3'],
  ['R7C3', 'R7C2'],
  ['R5C3', 'R6C3'],
  ['R5C4', 'R6C4'],
  ['R7C4', 'R7C5'],
  ['R8C4', 'R8C5'],
  ['R9C5', 'R9C6'],
  ['R6C6', 'R7C6'],
  ['R9C7', 'R9C8'],
  ['R9C9', 'R8C9'],
  ['R8C8', 'R8C7'],
  ['R7C8', 'R7C9'],
  ['R7C7', 'R6C7'],
  ['R5C9', 'R6C9', 'R6C8'],
  ['R4C8', 'R4C7', 'R5C7'],
  ['R3C9', 'R4C9'],
  ['R3C8', 'R3C7'],
  ['R2C8', 'R2C9'],
  ['R1C8', 'R1C9'],
];

// Little-killer diagonals with a printed outside total: (origin, dR, dC,
// total). Each arrow's origin/direction/total is read from the outside-clue
// badge nearest that arrow's drawn position (an unambiguous pairing).
const CLUED_DIAGONALS = [
  ['R6C1', 1, 1, 27],
  ['R9C4', -1, 1, 25],
  ['R9C8', -1, 1, 15],
  ['R1C3', 1, -1, 15],
  ['R1C6', 1, -1, 19],
  ['R4C9', -1, -1, 31],
];

// Remaining drawn diagonals with no printed total: (origin, dR, dC). Each
// still must sum to an odd number per the rules text's final sentence.
const UNCLUED_DIAGONALS = [
  ['R1C1', 1, -1],
  ['R1C1', 1, 1],
  ['R3C1', 1, 1],
  ['R5C1', 1, 1],
  ['R7C1', 1, 1],
  ['R9C1', -1, 1],
  ['R9C3', -1, 1],
  ['R9C5', -1, 1],
  ['R9C7', -1, 1],
  ['R1C4', 1, -1],
  ['R1C5', 1, -1],
  ['R2C9', -1, -1],
];

const cages = CAGES.flatMap(cells => [
  new AllDifferent(...cells),
  new NFA(oddSumSpec, 'CageOddSum', ...cells),
]);

const cluedDiagonals = CLUED_DIAGONALS.map(([origin, dr, dc, total]) =>
  LittleKiller.fromCells(total, graph.ray(origin, dr, dc), geometry)
);

const uncluedDiagonals = UNCLUED_DIAGONALS.map(([origin, dr, dc]) =>
  new NFA(oddSumSpec, 'DiagonalOddSum', ...graph.ray(origin, dr, dc))
);

return [
  new Shape('9x9'),
  // Grey circle: candidate restriction to odd digits (no dedicated
  // Odd/Even class in ISS).
  new Given('R5C5', 1, 3, 5, 7, 9),
  ...cages,
  ...cluedDiagonals,
  ...uncluedDiagonals,
];
