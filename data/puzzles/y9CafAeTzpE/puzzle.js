// Title: A Mathematical Phenomenon
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=y9CafAeTzpE
// Source: https://tinyurl.com/a-mathematical-phenomenon

// Normal Sudoku rules apply. The grid carries no givens: every payload cell
// is valued and none carries fpuzzles' `given` flag, which per the decode
// convention marks a captured solution rather than a given-set -- so the 81
// digits are solved entirely from the rules below.
//
// Unknown X-Sums clues surround the grid: one clue per row on the left and
// right, one per column on the top and bottom. A clue's value is the sum of
// the first X digits seen entering its row/column from its side, where X is
// that first (nearest) digit. The clue digits themselves are never shown --
// only some pairs of clues that are adjacent along the border are related,
// by a dot drawn between them: a white dot means the two clue values are
// consecutive (differ by 1); a black dot means they are in a 2:1 ratio. A
// clue with no dot on either side (most of them) imposes no constraint here
// -- an unlinked "unknown" clue value is not itself checkable against
// anything. The shaded border cells are a visual echo of which clues sit in
// a dot-chain and add no further rule.
//
// Each xSumDifference/xSumRatio call below is one drawn dot, translated from
// its two flanking border cells to the row/column each belongs to and the
// direction it reads from.

// Builds the 9 cells of row `idx` (for 'left'/'right') or column `idx` (for
// 'top'/'bottom'), ordered from the side the clue is read from.
function line(type, idx) {
  const cells = [];
  if (type === 'left') for (let c = 1; c <= 9; c++) cells.push(makeCellId(idx, c));
  else if (type === 'right') for (let c = 9; c >= 1; c--) cells.push(makeCellId(idx, c));
  else if (type === 'top') for (let r = 1; r <= 9; r++) cells.push(makeCellId(r, idx));
  else if (type === 'bottom') for (let r = 9; r >= 1; r--) cells.push(makeCellId(r, idx));
  return cells;
}

// The classic XSum decomposition (mirrors the built-in XSum handler, which
// branches on the control digit X and sums the first X cells) -- but here
// the total is left as an unresolved sum-of-cells rather than checked
// against a fixed number, since the clue's own value is unknown. Returns
// one {control, x, cells} candidate per possible X = 1..9.
function xSumBranches(cells) {
  const out = [];
  for (let x = 1; x <= 9; x++) out.push({ control: cells[0], x, cells: cells.slice(0, x) });
  return out;
}

// |sum(cellsA) - sum(cellsB)| = 1, for whichever X each side turns out to
// have. Neither total is ever materialized as a Var (an X-sum can reach 45,
// past the 16-value cap on auxiliary state), so every (Xa, Xb, sign)
// combination is branched explicitly and checked with one linear Sum.
function xSumDifference(cellsA, cellsB) {
  return new Or(
    xSumBranches(cellsA).flatMap(a => xSumBranches(cellsB).flatMap(b => [1, -1].map(target =>
      new And([
        new Given(a.control, a.x),
        new Given(b.control, b.x),
        new Sum(target, ...a.cells.map(c => [c, 1]), ...b.cells.map(c => [c, -1])),
      ])
    )))
  );
}

// sum(cellsA) : sum(cellsB) = 2:1, in either direction. Same branching
// shape as xSumDifference, with the sign pair replaced by the two possible
// coefficient pairs for a 2:1 ratio.
function xSumRatio(cellsA, cellsB) {
  return new Or(
    xSumBranches(cellsA).flatMap(a => xSumBranches(cellsB).flatMap(b => [[1, -2], [2, -1]].map(([coefA, coefB]) =>
      new And([
        new Given(a.control, a.x),
        new Given(b.control, b.x),
        new Sum(0, ...a.cells.map(c => [c, coefA]), ...b.cells.map(c => [c, coefB])),
      ])
    )))
  );
}

// White dots (differ by 1), each commented with the two border cells it was
// drawn between.
const differences = [
  [['left', 2], ['left', 3]],   // R3C1,R4C1
  [['left', 5], ['left', 4]],   // R6C1,R5C1
  [['left', 5], ['left', 6]],   // R6C1,R7C1
  [['bottom', 1], ['bottom', 2]], // R11C2,R11C3
  [['bottom', 5], ['bottom', 6]], // R11C6,R11C7
  [['top', 8], ['top', 7]],     // R1C9,R1C8
];

// Black dots (2:1 ratio), each commented with the two border cells it was
// drawn between.
const ratios = [
  [['top', 2], ['top', 3]],     // R1C3,R1C4
  [['top', 4], ['top', 3]],     // R1C5,R1C4
  [['top', 5], ['top', 4]],     // R1C6,R1C5
  [['right', 6], ['right', 5]], // R7C11,R6C11
  [['left', 4], ['left', 3]],   // R5C1,R4C1
  [['left', 7], ['left', 6]],   // R8C1,R7C1
  [['left', 7], ['left', 8]],   // R8C1,R9C1
  [['left', 8], ['left', 9]],   // R9C1,R10C1
];

return [
  new Shape('9x9'),
  ...differences.map(([a, b]) => xSumDifference(line(...a), line(...b))),
  ...ratios.map(([a, b]) => xSumRatio(line(...a), line(...b))),
];
