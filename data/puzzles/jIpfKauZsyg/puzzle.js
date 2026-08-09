// Title: Significant Product
// Author: WombatBreath
// Video: https://www.youtube.com/watch?v=jIpfKauZsyg
// Source: https://app.crackingthecryptic.com/sudoku/Pf84Gn2GhL

// Place 0-9 once each in every row, column and (jigsaw) region. The four
// shaded 3x3 corner areas are magic squares: their 3 rows, 3 columns and 2
// diagonals each sum to the same constant. The four undrawn-total cages'
// sums multiply to 500,000. A 'V' between two orthogonally adjacent cells
// sums to 5, an 'X' sums to 10; not every such pair is marked, so an
// unmarked pair carries no constraint.

const shapeSpec = '10x10~0-9';
const shape = new Shape('10x10', '0-9');

// 1-indexed (row, col) -> cell id. Row/col 10 needs this: cell ids pack each
// coordinate into a single base-17 character, so a literal 'R1C10' string is
// not a valid id on this 10-wide grid -- it must go through makeCellId.
const cid = (r, c) => makeCellId(r, c);

// Ten 10-cell jigsaw regions, transcribed from the puzzle's drawn regions as
// 1-indexed [row, col] pairs. Each corner region is exactly that corner's
// 3x3 magic square plus one extra cell.
const regions = [
  [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3], [4, 3]],
  [[1, 8], [1, 9], [1, 10], [2, 8], [2, 9], [2, 10], [3, 7], [3, 8], [3, 9], [3, 10]],
  [[1, 4], [1, 5], [1, 6], [1, 7], [2, 5], [2, 6], [2, 7], [3, 5], [3, 6], [4, 6]],
  [[4, 7], [4, 8], [4, 9], [5, 6], [5, 7], [6, 6], [7, 6], [7, 7], [8, 7], [9, 7]],
  [[2, 4], [3, 4], [4, 4], [4, 5], [5, 5], [6, 4], [6, 5], [7, 2], [7, 3], [7, 4]],
  [[4, 10], [5, 8], [5, 9], [5, 10], [6, 7], [6, 8], [6, 9], [6, 10], [7, 9], [7, 10]],
  [[4, 1], [4, 2], [5, 1], [5, 2], [5, 3], [5, 4], [6, 1], [6, 2], [6, 3], [7, 1]],
  [[7, 5], [8, 5], [8, 6], [9, 4], [9, 5], [9, 6], [10, 4], [10, 5], [10, 6], [10, 7]],
  [[8, 1], [8, 2], [8, 3], [8, 4], [9, 1], [9, 2], [9, 3], [10, 1], [10, 2], [10, 3]],
  [[7, 8], [8, 8], [8, 9], [8, 10], [9, 8], [9, 9], [9, 10], [10, 8], [10, 9], [10, 10]],
].map(cells => cells.map(([r, c]) => cid(r, c)));
const jigsaw = regions.map(cells => new Jigsaw(shapeSpec, ...cells));

// The four shaded 3x3 magic squares. Each square's 9 cells are already
// mutually all-different (each is a subset of one region above), so only the
// equal-sum rows/columns/diagonals need to be added.
const magicSquares = [
  // [topLeftRow, topLeftCol] of each corner square, 1-indexed.
  [1, 1], [1, 8], [8, 1], [8, 8],
];
function magicSquareEqualSum([r0, c0]) {
  const cell = (dr, dc) => cid(r0 + dr, c0 + dc);
  const grid = [0, 1, 2].map(dr => [0, 1, 2].map(dc => cell(dr, dc)));
  const rows = grid;
  const cols = [0, 1, 2].map(c => grid.map(row => row[c]));
  const diags = [
    [grid[0][0], grid[1][1], grid[2][2]],
    [grid[0][2], grid[1][1], grid[2][0]],
  ];
  return new EqualSum(...rows, ...cols, ...diags);
}
const magicSquareConstraints = magicSquares.map(magicSquareEqualSum);

// The four undrawn-total cages, one inside each magic square (the puzzle's
// drawn cage list also carries three metadata stub entries -- author, rules,
// title -- which are not cages and are omitted here).
const cages = [
  [[1, 9], [2, 8], [2, 9], [2, 10], [3, 9]],    // cage TR
  [[1, 2], [2, 1], [2, 2], [3, 2], [3, 3]],     // cage TL
  [[8, 3], [9, 1], [9, 2], [9, 3], [10, 2]],    // cage BL
  [[8, 10], [9, 8], [9, 9], [9, 10], [10, 9]],  // cage BR
].map(cells => cells.map(([r, c]) => cid(r, c)));

// cageA*cageB*cageC*cageD = 500,000, and each cage's 5 cells are distinct
// digits from 0-9, so each cage total is an integer in [0+1+2+3+4,
// 5+6+7+8+9] = [10, 35] (the rule's own arithmetic, independent of the
// puzzle's solution). Enumerating the divisors of 500,000 = 2^5 * 5^6 that
// fall in [10, 35] and combining them four at a time leaves exactly one
// multiset of totals that multiplies to 500,000: {25, 25, 25, 32}, with the
// 32 in any of the four cages. Cage(total, ...cells) folds the killer-style
// "distinct digits summing to total" reading into each branch, so no
// separate all-different constraint is needed alongside this.
const CAGE_SUM_COMMON = 25;
const CAGE_SUM_SPECIAL = 32;
const cageProduct = new Or(cages.map((_, specialIdx) => new And(
  cages.map((cells, i) => new Cage(
    i === specialIdx ? CAGE_SUM_SPECIAL : CAGE_SUM_COMMON, ...cells)))));

// V (sum 5) and X (sum 10) pair markers, each tying exactly the two
// adjacent cells it is drawn between.
const vPairs = [
  ['R2C6', 'R3C6'], ['R5C8', 'R6C8'], ['R8C6', 'R9C6'], ['R6C4', 'R6C5'],
];
const xPairs = [
  ['R3C6', 'R4C6'], ['R6C9', 'R7C9'],
];

return [
  shape,
  new NoBoxes(),
  ...jigsaw,
  ...magicSquareConstraints,
  cageProduct,
  ...vPairs.map(cells => new V(...cells)),
  ...xPairs.map(cells => new X(...cells)),
];
