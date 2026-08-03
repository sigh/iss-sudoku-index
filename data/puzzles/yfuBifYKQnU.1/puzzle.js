// Title: Count Different Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=yfuBifYKQnU
// Source: https://tinyurl.com/4pcmnfzf

// Normal Sudoku Rules Apply (rows/columns/boxes all-different; the default
// Shape('9x9') below).
//
// Each two-cell cage's printed small number is the count of distinct digits
// among the cells that touch the cage by a side or by a corner ("up to 10
// cells"), per the ruleset text. The cage's own two cells are excluded from
// that count: a domino's king-move footprint (the 3x4 bounding box around a
// horizontal pair, or 4x3 around a vertical one) is 12 cells, and only
// excluding the cage's own two cells brings that down to the stated "up to
// 10" -- so the rule counts the surrounding ring, not the cage cells
// themselves. The cage carries no sum or distinctness meaning of its own
// (unlike a killer cage), so no Cage/AllDifferent is added over the two cage
// cells.
//
// Each cage's count is pinned to a Var via Given and tied to its ring with
// CountDistinct, since the printed number is a constant rather than a grid
// cell's value.

const cc = cellGraph('9x9');

// The six two-cell cages and their printed counts, transcribed from the
// drawn cages.
const CAGES = [
  { cells: ['R1C3', 'R1C4'], count: 4 },
  { cells: ['R3C9', 'R4C9'], count: 4 },
  { cells: ['R9C6', 'R9C7'], count: 4 },
  { cells: ['R6C1', 'R7C1'], count: 4 },
  { cells: ['R6C8', 'R7C8'], count: 5 },
  { cells: ['R3C2', 'R4C2'], count: 5 },
];

// One control cell per cage, each pinned to that cage's printed count.
const cageCounts = new Var('CD', 'cage distinct count', CAGES.length);

const countDistincts = CAGES.flatMap(({ cells: [a, b], count }, i) => {
  const ring = new Set([...cc.kingNeighbours(a), ...cc.kingNeighbours(b)]);
  ring.delete(a);
  ring.delete(b);
  const control = cageCounts.cell(i + 1);
  return [
    new Given(control, count),
    new CountDistinct(control, ...ring),
  ];
});

return [
  new Shape('9x9'),
  cageCounts,

  // Givens, transcribed from the drawn grid.
  new Given('R1C2', 1),
  new Given('R2C2', 2), new Given('R2C3', 3), new Given('R2C4', 4),
  new Given('R3C5', 9), new Given('R3C8', 6),
  new Given('R4C3', 2), new Given('R4C8', 7),
  new Given('R5C1', 3), new Given('R5C2', 7), new Given('R5C8', 8), new Given('R5C9', 9),
  new Given('R6C2', 8), new Given('R6C7', 2),
  new Given('R7C2', 6), new Given('R7C5', 5),
  new Given('R8C6', 7), new Given('R8C7', 6), new Given('R8C8', 5),
  new Given('R9C8', 4),

  ...countDistincts,
];
