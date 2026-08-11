// Title: If 6 Was 9
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=3Ata-5AsKj0
// Source: https://app.crackingthecryptic.com/sudoku/DPnP3BnNng

// Normal sudoku on the 9x9 grid, plus two givens.
//
// 16 drawn cages (no printed totals) form 8 pairs related by a 180-degree
// rotation of the grid: each cage's rotated image is another drawn cage.
// Each cage sums to 6 or 9. Rotating the grid turns 6 into 9, so a
// rotated pair of cages must carry different sums -- one is 6, the other 9.
// Every cage here is confined to a single row or column, so ordinary
// sudoku already forbids repeats within it; Cage is used because the
// source's own payload calls these clues "cages".
//
// Ten white dots (drawn edge marks) mark consecutive pairs. The rules say
// "not all possible dots are given", which licenses no negative -- an
// unmarked adjacent pair carries no information and is left unconstrained.

const givens = [
  new Given('R1C1', 6),
  new Given('R9C9', 9),
];

// Cage cell groups, transcribed from the drawn cage geometry. Paired by the
// 180-degree rotation (row,col) -> (8-row, 8-col) on the 0-indexed grid,
// verified to map each cage's cell set onto another cage's cell set exactly.
const cagePairs = [
  [['R1C2', 'R1C3', 'R1C4'], ['R9C6', 'R9C7', 'R9C8']],
  [['R1C5', 'R1C6'], ['R9C4', 'R9C5']],
  [['R2C8', 'R2C9'], ['R8C1', 'R8C2']],
  [['R3C7', 'R4C7'], ['R6C3', 'R7C3']],
  [['R5C8', 'R5C9'], ['R5C1', 'R5C2']],
  [['R6C7', 'R6C8'], ['R4C2', 'R4C3']],
  [['R6C9', 'R7C9', 'R8C9'], ['R2C1', 'R3C1', 'R4C1']],
  [['R8C6', 'R8C7'], ['R2C3', 'R2C4']],
];

// Each pair's two cages take opposite sums from {6, 9}.
const cageConstraints = cagePairs.map(([a, b]) => new Or([
  new And([new Cage(6, ...a), new Cage(9, ...b)]),
  new And([new Cage(9, ...a), new Cage(6, ...b)]),
]));

// White dot edges, transcribed from the drawn edge-mark overlays.
const whiteDotPairs = [
  ['R1C4', 'R2C4'], ['R2C4', 'R3C4'],
  ['R2C5', 'R2C6'], ['R3C5', 'R3C6'],
  ['R1C7', 'R1C8'],
  ['R7C4', 'R7C5'], ['R8C4', 'R8C5'],
  ['R7C6', 'R8C6'], ['R8C6', 'R9C6'],
  ['R9C2', 'R9C3'],
];
const whiteDots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...cageConstraints,
  ...whiteDots,
];
