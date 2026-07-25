// Title: Quadrants
// Author: Supware
// Video: https://www.youtube.com/watch?v=IEO4oA2-TTQ
// Source: https://sudokupad.app/neh0ii8ycb

// Normal sudoku rules apply. Additionally, every 2x2 region of the grid whose
// four cells include none of the 8 drawn circles must have a digit sum that
// is a multiple of 4 (ruleset text). Circle cells below are the 8 drawn
// circle positions.
const circles = new Set([
  'R2C5', 'R2C8', 'R5C2', 'R5C5', 'R5C8', 'R8C2', 'R8C5', 'R9C9',
]);

// A 9x9 grid has 8x8 = 64 possible 2x2 blocks, one per top-left corner
// (r, c) with r, c in 1..8. A block is exempt when any of its 4 cells is
// circled; every other block needs "sum is a multiple of 4". That is
// expressed with one quotient Var per remaining block via a coefficient
// Sum: cellA + cellB + cellC + cellD - 4*Q = 0. Q's domain is the grid's
// value range (1-9), which covers every possible quotient (block sums
// range from 4 to 36).
const blockCells = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const cells = [
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ];
    if (!cells.some(cell => circles.has(cell))) blockCells.push(cells);
  }
}

const quadrantQuotient = new Var('Q', 'block sum / 4', blockCells.length);
const quadrantSums = blockCells.map(
  (cells, i) => new Sum(0, ...cells, [quadrantQuotient.cell(i + 1), -4]));

return [
  new Shape('9x9'),
  new Given('R1C2', 2),
  new Given('R2C2', 1),
  new Given('R2C3', 3),
  new Given('R7C7', 7),
  new Given('R8C8', 8),
  new Given('R8C9', 9),
  quadrantQuotient,
  ...quadrantSums,
];
