// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=J9zpFWxu6LE
// Source: https://cracking-the-cryptic.web.app/sudoku/RBh8T4LRT2

// Rules encoded:
//  - Normal sudoku: 1-9 once in each row, column and 3x3 box (the payload's
//    `regions` array is the ordinary nine 3x3 blocks, which is ISS's default).
//  - 22 givens.
//  - Anti-diagonal: each of the two marked main diagonals contains only three
//    different digits. The payload carries no rules text; the two grey
//    corner-to-corner strokes mark the diagonals and the video titles the
//    puzzle "Anti-Diagonal Sudoku", the standard name for that rule. (A plain
//    all-different reading of the same two strokes is contradicted by the
//    givens: rows/columns/boxes plus five of them -- R3C1=1, R4C2=7, R6C8=1,
//    R8C9=1, R9C3=1, none on a diagonal -- already make it unsatisfiable.)
// Nothing else is drawn in the payload.

const N = 9;

// Givens, read off the payload's grid in reading order.
const givens = [
  ['R1C3', 9], ['R1C5', 3], ['R1C7', 1],
  ['R2C1', 5], ['R2C9', 9],
  ['R3C1', 1], ['R3C5', 2], ['R3C9', 5],
  ['R4C2', 7], ['R4C8', 5],
  ['R5C3', 3], ['R5C7', 7],
  ['R6C2', 4], ['R6C8', 1],
  ['R7C1', 7], ['R7C5', 8], ['R7C9', 3],
  ['R8C1', 2], ['R8C9', 1],
  ['R9C3', 1], ['R9C5', 6], ['R9C7', 5],
];

// The two drawn strokes: R1C1-R9C9 and R1C9-R9C1.
const diagonals = [[], []];
for (let row = 1; row <= N; row++) {
  diagonals[0].push(makeCellId(row, row));
  diagonals[1].push(makeCellId(row, N + 1 - row));
}

// One control cell per diagonal, pinned to 3: CountDistinct makes the control
// cell equal the number of distinct digits among the diagonal's nine cells.
const counts = new Var('D', 'distinct', diagonals.length);

return [
  new Shape('9x9'),
  counts,

  ...givens.map(([cell, value]) => new Given(cell, value)),

  ...diagonals.flatMap((cells, i) => {
    const control = counts.cell(i + 1);
    return [
      new Given(control, 3),
      new CountDistinct(control, ...cells),
    ];
  }),
];
