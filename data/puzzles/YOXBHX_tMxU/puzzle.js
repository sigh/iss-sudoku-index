// Title: "Top Heavy" Sudoku
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=YOXBHX_tMxU
// Source: https://cracking-the-cryptic.web.app/sudoku/H23RFNMN44

// Rules: fill the grid with digits 1-6, each appearing exactly once in every
// row, column and marked 3x3 box; exactly 3 cells per row/column/box are
// blank. Wherever two vertically adjacent cells both hold a digit, the top
// one is greater than the bottom one -- a pair touching a blank cell is
// unconstrained.
//
// Board: a 9x9 grid over a 7-symbol alphabet (1-6 the real digits, 7 a single
// interchangeable blank sentinel) on the Raw grid type -- Raw carries no
// implicit row/column/box rules, so every house rule below is stated
// explicitly. Each row, column and box must hold the exact multiset
// "1_2_3_4_5_6_7_7_7": one of each real digit, plus the blank sentinel three
// times. One shared sentinel value needs no symmetry-breaking pin (unlike
// distinct spare digits): every blank cell reading 7 is indistinguishable
// from every other, so there is nothing to permute.

const shape = new Shape('9x9', 7, 'Raw');
const graph = cellGraph(shape);

const HOUSE_MULTISET = '1_2_3_4_5_6_7_7_7';

// The 9 standard 3x3 boxes (Raw grid type has no default boxes); top-left
// cell of each, matching the drawn box partition.
const boxTopLefts = [
  'R1C1', 'R1C4', 'R1C7',
  'R4C1', 'R4C4', 'R4C7',
  'R7C1', 'R7C4', 'R7C7',
];
const boxes = boxTopLefts.map((topLeft) => graph.block(topLeft, 3, 3));

const houses = [...graph.rows(), ...graph.columns(), ...boxes];
const houseConstraints = houses.map(
  (cells) => new ContainExact(HOUSE_MULTISET, ...cells));

// Vertical ordering: skip the rule (accept) whenever either cell is the
// blank sentinel (7); otherwise the top cell's value must exceed the
// bottom's. One template Pair, replicated onto every (row, row+1) origin in
// rows 1-8 across all 9 columns -- row 9 is excluded since it has no row
// below it to pair with.
const verticalKey = Pair.fnToKey(
  (a, b) => a === 7 || b === 7 || a > b, 7);
const verticalTemplate = new Pair(
  verticalKey, 'top > bottom unless either cell is blank', 'R1C1', 'R2C1');
const verticalTargets = [];
for (let row = 1; row <= 8; row++) {
  for (let col = 1; col <= 9; col++) {
    verticalTargets.push(makeCellId(row, col));
  }
}
const verticalPairs = graph.makeReplicate(verticalTemplate, verticalTargets);

// The 17 drawn givens, [row, col, digit] read off the puzzle's cell grid.
const givens = [
  [1, 4, 5], [1, 6, 2],
  [2, 1, 1], [2, 3, 2], [2, 7, 5],
  [4, 3, 4], [4, 9, 1],
  [5, 4, 2], [5, 5, 3], [5, 6, 4],
  [6, 1, 3], [6, 7, 2],
  [8, 3, 1], [8, 7, 6], [8, 9, 4],
  [9, 4, 6], [9, 6, 3],
].map(([row, col, value]) => new Given(makeCellId(row, col), value));

return [
  shape,
  ...houseConstraints,
  verticalPairs,
  ...givens,
];
