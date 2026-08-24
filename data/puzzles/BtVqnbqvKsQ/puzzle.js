// Title: 7 Kingdoms (x)v White Walkers
// Author: PolmanPoppins
// Video: https://www.youtube.com/watch?v=BtVqnbqvKsQ
// Source: https://app.crackingthecryptic.com/sudoku/F96tj2b6b6
//
// Rules: normal sudoku; digits in cages sum to the given total; the marked
// diagonal can contain repeats and sums to 27; some pairs of cells adding to
// 10 (X) or 5 (V) are marked; in the top two rows all instances of
// neighbouring consecutive digits are marked by white dots.
//
// Regions: the payload's own `regions` array gives 9 regions of 9 cells,
// but rows 1-3 are each one whole-row region (redundant with the row
// all-different, so no box constraint applies there) while rows 4-9 keep
// six ordinary 3x3 boxes. NoBoxes() + explicit AllDifferent per real box
// encodes this faithfully.
//
// Cages: every cage's two cells already share a row or column, so
// distinctness is inert either way; the rules state only a sum, so `Sum`
// (not `Cage`) is used.
//
// Little killer: R7C2 and R8C3 (both on the diagonal) sit in the same box.
// The rules' explicit "can contain repeats" is the needed exception to that
// box's all-different for this one pair (verified: no other diagonal-cell
// pair shares a box, row, or column).
//
// White dots: "all instances... are marked" in the top two rows is an
// exhaustiveness clause, so every unmarked adjacent pair there is
// constrained to NOT be consecutive.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Real (non-row) boxes: rows 4-6 and 7-9, each split into three column
// triples. Built directly instead of hand listing 54 cell ids.
const box = (rowStart, colStart) => {
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      cells.push(makeCellId(rowStart + r, colStart + c));
    }
  }
  return cells;
};

const box1 = box(4, 1);
const box2 = box(7, 1); // contains the diagonal-repeat exception pair
const box4 = box(4, 4);
const box5 = box(7, 4);
const box7 = box(4, 7);
const box8 = box(7, 7);

// box2's two diagonal cells may repeat; every other pair in box2 stays
// all-different. Two AllDifferents (box2 minus each exception cell) cover
// every pair except the exempted one.
const diagA = 'R7C2';
const diagB = 'R8C3';
const box2WithoutA = box2.filter(c => c !== diagA);
const box2WithoutB = box2.filter(c => c !== diagB);

const cageSums = [
  [9, 'R4C2', 'R5C2'],
  [9, 'R4C3', 'R5C3'],
  [11, 'R8C2', 'R9C2'],
  [11, 'R8C3', 'R9C3'],
  [13, 'R8C4', 'R9C4'],
  [9, 'R4C5', 'R4C6'],
  [12, 'R5C5', 'R5C6'],
];

const xPairs = [
  ['R4C7', 'R5C7'],
  ['R4C8', 'R5C8'],
  ['R6C8', 'R6C9'],
  ['R7C8', 'R7C9'],
  ['R8C8', 'R9C8'],
  ['R9C5', 'R9C6'],
  ['R7C4', 'R7C5'],
  ['R6C4', 'R6C5'],
];

const vPairs = [
  ['R6C6', 'R6C7'],
  ['R7C6', 'R7C7'],
];

// Top-two-rows white dots: marked (consecutive) pairs from the overlays.
const dotPairs = [
  ['R1C1', 'R1C2'],
  ['R1C4', 'R1C5'],
  ['R1C6', 'R1C7'],
  ['R1C7', 'R1C8'],
  ['R1C8', 'R1C9'],
  ['R2C1', 'R2C2'],
  ['R2C6', 'R2C7'],
  ['R2C7', 'R2C8'],
  ['R1C3', 'R2C3'],
  ['R1C5', 'R2C5'],
  ['R1C6', 'R2C6'],
  ['R1C7', 'R2C7'],
];

// Every orthogonally-adjacent pair within rows 1-2 (row1, row2, and the
// row1/row2 verticals); the ones not in dotPairs are the negative closure.
const allTopPairs = [];
for (let c = 1; c <= 8; c++) {
  allTopPairs.push([makeCellId(1, c), makeCellId(1, c + 1)]);
  allTopPairs.push([makeCellId(2, c), makeCellId(2, c + 1)]);
}
for (let c = 1; c <= 9; c++) {
  allTopPairs.push([makeCellId(1, c), makeCellId(2, c)]);
}
const dotPairKeys = new Set(dotPairs.map(p => p.slice().sort().join(',')));
const nonDotPairs = allTopPairs.filter(
  p => !dotPairKeys.has(p.slice().sort().join(',')));

const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),
  new NoBoxes(),

  new AllDifferent(...box1),
  new AllDifferent(...box2WithoutA),
  new AllDifferent(...box2WithoutB),
  new AllDifferent(...box4),
  new AllDifferent(...box5),
  new AllDifferent(...box7),
  new AllDifferent(...box8),

  ...cageSums.map(([sum, ...cells]) => new Sum(sum, ...cells)),

  LittleKiller.fromCells(27, graph.ray('R6C1', 1, 1), geometry),

  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),

  ...dotPairs.map(cells => new WhiteDot(...cells)),
  ...nonDotPairs.map(
    cells => new Pair(notConsecutive, 'not consecutive', ...cells)),
];
