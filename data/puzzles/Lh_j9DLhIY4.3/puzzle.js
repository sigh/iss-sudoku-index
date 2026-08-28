// Title: March 31, 2022: Over 20
// Author: clover!
// Video: https://www.youtube.com/watch?v=Lh_j9DLhIY4
// Source: https://tinyurl.com/msc5ua8t

// Normal sudoku rules apply (Shape). In every 3x3 box, at least one of its
// three rows sums to 20 or more, and at least one of its three columns sums
// to 20 or more. Since a box row/column holds three box-distinct digits from
// 1-9, the achievable totals are exactly 20-24 (max 9+8+7=24), so "sum >= 20"
// is expressed directly as the disjunction over those five exact totals --
// no auxiliary state needed.

const graph = cellGraph('9x9');

// Givens, from the payload's grid (row by row).
const givens = [
  ['R1C1', 1], ['R1C6', 9], ['R1C9', 5],
  ['R2C2', 2], ['R2C6', 8], ['R2C8', 1],
  ['R3C3', 5], ['R3C4', 6], ['R3C7', 2],
  ['R4C1', 9], ['R4C2', 7], ['R4C9', 3],
  ['R6C1', 5], ['R6C8', 9], ['R6C9', 8],
  ['R7C3', 1], ['R7C6', 6], ['R7C7', 5],
  ['R8C2', 5], ['R8C4', 9], ['R8C8', 2],
  ['R9C1', 2], ['R9C4', 7], ['R9C9', 1],
].map(([cell, value]) => new Given(cell, value));

// "sum >= 20" over three box-distinct 1-9 digits, as the disjunction over its
// only achievable exact totals.
const atLeast20 = (cells) =>
  new Or([20, 21, 22, 23, 24].map(total => new Sum(total, ...cells)));

const boxConstraints = [];
for (let b = 1; b <= 9; b++) {
  const box = graph.box(b); // 3x3 cells, row-major.
  const rows = [box.slice(0, 3), box.slice(3, 6), box.slice(6, 9)];
  const cols = [0, 1, 2].map(c => [box[c], box[c + 3], box[c + 6]]);
  boxConstraints.push(new Or(rows.map(atLeast20)));
  boxConstraints.push(new Or(cols.map(atLeast20)));
}

return [
  new Shape('9x9'),
  ...givens,
  ...boxConstraints,
];
