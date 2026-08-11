// Title: Fortress Sudoku
// Author: 'South Korea'
// Video: https://www.youtube.com/watch?v=w3fn9BA019U
// Source: https://app.crackingthecryptic.com/sudoku/f2thqnFn7j

// Normal sudoku rules apply. A digit in a shaded (grey) cell must be
// greater than a digit in each orthogonally adjacent unshaded cell.

const givens = [
  ['R1C9', 6], ['R2C8', 5], ['R3C4', 2], ['R5C5', 6], ['R6C5', 1],
  ['R6C8', 2], ['R7C1', 8], ['R8C5', 7], ['R8C9', 1], ['R9C6', 6],
];

// Shaded (fortress) cells, transcribed from the drawn light-grey 1x1
// underlays.
const fortressCells = [
  'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R3C2', 'R2C3', 'R1C4', 'R4C3',
  'R5C4', 'R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C9', 'R7C8', 'R7C7', 'R8C8', 'R9C9',
];
const fortressSet = new Set(fortressCells);

// Each fortress cell must be greater than its orthogonally-adjacent
// non-shaded neighbours. GreaterThan(a, b, c, ...) enforces a > (each
// later-listed cell that is adjacent to an earlier one), so listing the
// fortress cell first gives exactly "shaded > each unshaded neighbour". A
// fortress cell's own neighbours are never mutually adjacent (up/down/
// left/right of one cell are never adjacent to each other), so a single
// GreaterThan per fortress cell cannot smuggle in an unwanted pairwise
// relation between two of its neighbours. Neighbouring fortress cells are
// left out of each other's lists: the rule is silent on shaded-shaded
// adjacency. R3C1's only neighbours (R2C1, R4C1, R3C2) are all fortress
// cells, so it has no unshaded neighbour and contributes no constraint.
const graph = cellGraph('9x9');
const fortress = fortressCells
  .map(cell => [cell, graph.neighbours(cell).filter(n => !fortressSet.has(n))])
  .filter(([, unshaded]) => unshaded.length > 0)
  .map(([cell, unshaded]) => new GreaterThan(cell, ...unshaded));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...fortress,
];
