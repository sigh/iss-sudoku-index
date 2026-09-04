// Title: A Wonderful Discovery
// Author: damasosos92
// Video: https://www.youtube.com/watch?v=rLwekPjOKBo
// Source: https://app.crackingthecryptic.com/sudoku/mBJDRbQLTj

// Rows and columns are standard, but there are no default 3x3 boxes: every
// drawn circle marks the centre of a 3x3 box instead, and each such box must
// hold every digit once, same as rows/columns. The 16 circles sit on the
// outline of the central 5x5 block (rows/cols 3-7), so the 16 resulting
// boxes overlap heavily and do not tile the grid: every border cell (row 1,
// row 9, column 1, column 9) falls inside none of them.
// Green lines are German Whisper lines: adjacent digits differ by >= 5.
// Each outside arrow marks a diagonal that must sum to a total given as an
// expression in one shared unknown x ("The value of 'x' has to be
// determined by the solver."). Rather than hold x on a cell, the four
// linear relations between the five diagonal sums are encoded directly:
// with S0..S4 the sums of the "x", "x-2", "x+3", "x+1" and "6x" diagonals,
// S0-S1=2, S2-S0=3, S3-S0=1 and S4-6*S0=0 are algebraically equivalent to
// the five stated equations (S0=x, S1=x-2, S2=x+3, S3=x+1, S4=6x) with x
// eliminated, so no extra cell or Var is needed to hold it.

// Drawn circle positions: the outline of the 5x5 block spanning rows 3-7,
// columns 3-7.
const boxCenters = [
  [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
  [4, 7], [5, 7], [6, 7], [7, 7],
  [7, 6], [7, 5], [7, 4], [7, 3],
  [6, 3], [5, 3], [4, 3],
];

const boxes = boxCenters.map(([r, c]) => {
  const cells = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      cells.push(makeCellId(r + dr, c + dc));
    }
  }
  return new AllDifferent(...cells);
});

// Green whisper lines, one entry per drawn line; order within each line
// does not matter for a symmetric difference rule.
const whispers = [
  ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C2', 'R5C2'],
  ['R6C3', 'R6C4', 'R7C4'],
  ['R8C5', 'R7C6'],
  ['R4C1', 'R4C2'],
].map(cells => new Whisper(5, ...cells));

// The five outside-clue diagonals, each paired with its drawn total by
// nearest spatial distance between the arrow and the algebraic overlay.
const diagX = ['R1C2', 'R2C1']; // total x
const diagXm2 = ['R9C2', 'R8C1']; // total x-2
const diagXp3 = ['R9C8', 'R8C9']; // total x+3
const diagXp1 = ['R1C8', 'R2C9']; // total x+1
const diag6X = ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7']; // total 6x

const negate = cells => cells.map(c => [c, -1]);

const diagonalRelations = [
  new Sum(2, ...diagX, ...negate(diagXm2)), // S0 - S1 = 2
  new Sum(3, ...diagXp3, ...negate(diagX)), // S2 - S0 = 3
  new Sum(1, ...diagXp1, ...negate(diagX)), // S3 - S0 = 1
  new Sum(0, ...diag6X, ...diagX.map(c => [c, -6])), // S4 - 6*S0 = 0
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...boxes,
  ...whispers,
  ...diagonalRelations,
];
