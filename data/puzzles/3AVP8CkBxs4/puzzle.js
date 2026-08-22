// Title: Average Arrow Sandwiches
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=3AVP8CkBxs4
// Source: https://app.crackingthecryptic.com/sudoku/FQDpNL27R2
//
// Normal sudoku rules apply (default rows/cols/boxes all-different).
// Outside sandwich clues: the sum of the digits strictly between the 1 and
// the 9 in that row/column -- encoded with the built-in Sandwich class.
// Arrows: digits along an arrow average exactly to the attached circle's
// digit -- there is no "average" class, so each arrow is a linear equation
// via coefficient `Sum`: sum(arm cells) - count(arm cells) * circle = 0.
// Two circles (R5C4 and R8C4) each anchor two independent arrows -- the
// puzzle draws both strokes from the same bulb.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Arm cells listed circle-to-tip; the circle cell itself is passed separately.
const arrows = [
  { circle: 'R1C9', arm: ['R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C9'] },
  { circle: 'R2C6', arm: ['R2C7', 'R3C7', 'R4C6'] },
  { circle: 'R2C2', arm: ['R2C3', 'R2C4', 'R2C5'] },
  { circle: 'R5C2', arm: ['R4C2', 'R3C2'] },
  { circle: 'R5C6', arm: ['R6C7', 'R7C7'] },
  { circle: 'R5C4', arm: ['R4C3'] },
  { circle: 'R5C4', arm: ['R6C5', 'R7C6', 'R8C7', 'R9C8'] },
  { circle: 'R8C4', arm: ['R7C3'] },
  { circle: 'R8C4', arm: ['R8C3', 'R8C2', 'R7C2', 'R6C2'] },
  { circle: 'R7C3', arm: ['R6C4', 'R5C5', 'R5C6'] },
  { circle: 'R2C9', arm: ['R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3'] },
  { circle: 'R8C7', arm: ['R8C6', 'R8C5'] },
];

// A single-cell arm's "average" is just that cell's value, so express it as
// a direct equality (SameValues) instead of a degenerate coefficient Sum.
const arrowConstraints = arrows.map(({ circle, arm }) =>
  arm.length === 1
    ? new SameValues(2, arm[0], circle)
    : new Sum(0, ...arm, [circle, -arm.length])
);

// Sandwich totals: [row/col index, total]. Rows via graph.row(n), left lane;
// columns via graph.column(n), top lane. Sandwich reads the grid's own 1 and
// 9, so no extra state is needed.
const rowSandwiches = [
  [1, 13],
  [2, 0],
  [4, 14],
  [5, 23],
  [8, 6],
  [9, 22],
];
const colSandwiches = [
  [3, 28],
  [6, 12],
  [9, 19],
];

return [
  new Shape('9x9'),
  new Given('R9C9', 7),
  ...arrowConstraints,
  ...rowSandwiches.map(([r, total]) =>
    Sandwich.fromCells(total, graph.row(r), geometry)
  ),
  ...colSandwiches.map(([c, total]) =>
    Sandwich.fromCells(total, graph.column(c), geometry)
  ),
];
