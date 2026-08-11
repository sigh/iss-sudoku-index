// Title: Trisection
// Author: Julien Smith-Roberge
// Video: https://www.youtube.com/watch?v=kBLQBGHqhk4
// Source: https://app.crackingthecryptic.com/sudoku/tGMBFJq8Gp

// Normal sudoku rules apply (default 9x9 row/column/box all-different).
// Every drawn cage (no printed totals) sums to either 7 or 13. Each cage's
// cells lie inside a single box, so a cage's own digits are already forced
// distinct by the box all-different regardless of whether the cage rule
// itself implies distinctness; the rules never say cage digits can't repeat,
// so `Sum` (not `Cage`) is the faithful class.
// Cells joined by a drawn X sum to 10; "not all X's are given" means only
// the drawn edges constrain -- an unmarked adjacent pair is unrestricted.
// The drawn diagonal runs the full anti-diagonal from the top-right corner
// (R1C9) down-left to R9C1 and sums to 47 (Little Killer semantics: values
// along the diagonal add to the given sum, repeats allowed).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cage cell groups, transcribed from the drawn cage outlines (dominoes unless noted).
const cages = [
  ['R1C1', 'R2C1'],
  ['R1C2', 'R1C3'],
  ['R2C2', 'R3C2'],
  ['R2C5', 'R3C5'],
  ['R1C8', 'R1C9'],
  ['R2C9', 'R3C9'],
  ['R2C7', 'R2C8'],
  ['R4C8', 'R4C9'],
  ['R7C8', 'R8C8'],
  ['R8C9', 'R9C9'],
  ['R9C7', 'R9C8'],
  ['R8C4', 'R9C4'],
  ['R8C2', 'R8C3'],
  ['R9C1', 'R9C2'],
  ['R7C1', 'R8C1'],
  ['R6C1', 'R6C2'],
  ['R5C2', 'R5C3'],
  ['R6C4', 'R5C4', 'R5C5'], // 3-cell cage
  ['R6C5', 'R6C6', 'R5C6'], // 3-cell cage
];

// X-marked edges, transcribed from the drawn "X" overlays.
const xEdges = [
  ['R2C1', 'R2C2'],
  ['R3C5', 'R4C5'],
  ['R5C4', 'R5C5'],
  ['R5C7', 'R6C7'],
  ['R1C9', 'R2C9'],
  ['R8C8', 'R8C9'],
  ['R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),

  ...cages.map(cells => new Or([new Sum(7, ...cells), new Sum(13, ...cells)])),

  ...xEdges.map(([a, b]) => new X(a, b)),

  LittleKiller.fromCells(47, graph.ray('R1C9', 1, -1), geometry),
];
