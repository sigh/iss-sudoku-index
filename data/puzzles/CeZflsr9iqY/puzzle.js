// Title: Magic Squares and Magic Pairs
// Author: Mr. Mo
// Video: https://www.youtube.com/watch?v=CeZflsr9iqY
// Source: https://app.crackingthecryptic.com/sudoku/DLDmBffGrG

// Normal sudoku rules apply (default 9x9 rows/columns/boxes, no givens).
//
// Three of the nine boxes -- top-right (R1C7), centre (R4C4), bottom-left
// (R7C1) -- are grey magic squares: every 3-cell row, column and diagonal
// sums to the same total. That is EqualSum over the box's 3 rows, 3 columns
// and 2 diagonals; the box's own all-different (already enforced as a
// default sudoku box) then forces the common total to 15 on its own, so no
// total needs to be stated here.
//
// Each of the 9 drawn cages holds pairs of 2 different digits that each
// sum to the cage's printed total N: "so a cage with a clue of 6 would have
// to contain 1,2,4,5". For every N printed here, the set of digits with a
// distinct in-range partner summing to N --
// V(N) = { v in 1..9 : 1 <= N-v <= 9, v != N-v } -- has size exactly equal
// to that cage's own cell count (checked below), so the rule reduces to:
// restrict every cage cell's candidates to V(N), and require the cage's
// cells to be all-different. With #cells == |V(N)| that all-different
// forces a bijection onto V(N) -- every value of V(N) appears exactly once,
// which is exactly one occurrence of every complementary pair summing to N.

// Cage cell lists are literal [row,col] pairs (1-indexed), transcribed from
// the drawn cages in the payload's own order.
const cages = [
  { cells: [[1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2]], total: 10 },
  { cells: [[2, 2], [2, 3]], total: 3 },
  { cells: [[3, 2], [3, 3], [4, 3], [4, 4]], total: 15 },
  { cells: [[2, 7], [2, 6], [2, 5], [3, 4], [3, 5], [4, 5], [4, 6], [3, 6]], total: 9 },
  { cells: [[4, 8], [4, 9], [5, 9], [6, 9], [6, 8], [5, 8]], total: 12 },
  { cells: [[6, 7], [6, 6], [6, 5], [7, 6]], total: 5 },
  { cells: [[7, 5], [8, 5]], total: 17 },
  { cells: [[7, 8], [8, 8], [8, 7], [9, 7]], total: 15 },
  { cells: [[8, 3], [8, 4], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6]], total: 9 },
];

// V(N): digits 1-9 with a distinct in-range partner summing to N.
function validPartnerSet(n) {
  const vs = [];
  for (let v = 1; v <= 9; v++) {
    const w = n - v;
    if (w >= 1 && w <= 9 && w !== v) vs.push(v);
  }
  return vs;
}

const cageConstraints = cages.flatMap(({ cells, total }) => {
  const ids = cells.map(([r, c]) => makeCellId(r, c));
  const valid = validPartnerSet(total);
  if (valid.length !== ids.length) {
    // Structural check: every cage here satisfies this by construction of
    // the puzzle; this guards against a decode slip.
    throw new Error(
      `cage of ${ids.length} cells has |V(${total})| = ${valid.length}`);
  }
  return [
    new AllDifferent(...ids),
    ...ids.map(id => new Given(id, ...valid)),
  ];
});

// Magic squares: EqualSum over each grey box's 3 rows, 3 columns and 2
// diagonals. (rowStart, colStart) is the box's 1-indexed top-left cell.
function magicSquare(rowStart, colStart) {
  const grid = [];
  for (let dr = 0; dr < 3; dr++) {
    const row = [];
    for (let dc = 0; dc < 3; dc++) row.push(makeCellId(rowStart + dr, colStart + dc));
    grid.push(row);
  }
  const rows = grid;
  const cols = [0, 1, 2].map(c => [grid[0][c], grid[1][c], grid[2][c]]);
  const diag1 = [grid[0][0], grid[1][1], grid[2][2]];
  const diag2 = [grid[0][2], grid[1][1], grid[2][0]];
  return new EqualSum(...rows, ...cols, diag1, diag2);
}

const magicSquareConstraints = [
  magicSquare(1, 7), // top-right grey box
  magicSquare(4, 4), // centre grey box
  magicSquare(7, 1), // bottom-left grey box
];

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...magicSquareConstraints,
];
