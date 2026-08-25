// Title: XY Differences IV
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=dgLYKopOsF0
// Source: https://app.crackingthecryptic.com/sudoku/Rt79DqgjP2

// Normal sudoku rules apply. "The first cell in the row/column" is a definite
// reference to one specific cell -- the row's own leftmost cell (column 1) or
// the column's own topmost cell (row 1) -- not "whichever of the two marked
// cells comes first". Treating it instead as the earlier of the two marked
// cells was tried and refuted: a small subset of the resulting constraints
// (the two chained column marks through R4C5/R5C5/R6C5 plus R6C4/R7C4,
// R7C4/R8C4, R7C5/R8C5, R7C6/R8C6) is unsatisfiable under plain sudoku alone,
// which cannot be true of a puzzle with a solution.
//
// So: a small square between two orthogonally adjacent cells in row r means
// the difference between the two digits equals the digit in R{r}C1; a small
// square between two adjacent cells in column c means the difference equals
// the digit in R1C{c}. "All possible small squares are marked" is exhaustive:
// every adjacent pair with no small square does not satisfy the relation for
// its row's/column's own reference cell.
//
// Each rule ties every pair in one row (or column) to that row's (or
// column's) own reference cell, whose value is not known in advance, so the
// relation is encoded as a switch on the reference cell's digit: for each
// row r, an Or over k = 1..9 of And(Given(R{r}C1, k), <every one of the row's
// 8 adjacent pairs checked against k -- equality where marked, inequality
// where not>). Exactly one k branch is live (whatever R{r}C1 actually is),
// and that branch is what constrains the row's pairs -- the same
// Given-inside-And/Or switch used for a value-dependent rule generally.
// Columns are the same construction transposed.

// Marked edges below are transcribed from the payload's overlay list (the
// 24 black-bordered small-square overlays); two further overlays sit
// off-grid (centers [-0.5,-0.5] and [9.5,9.5]) and draw no cell edge --
// styling only, not clues.

const rowEdges = [
  ['R1C2', 'R1C3'], ['R1C4', 'R1C5'], ['R4C3', 'R4C4'], ['R5C2', 'R5C3'],
  ['R5C6', 'R5C7'], ['R5C8', 'R5C9'], ['R7C6', 'R7C7'], ['R8C3', 'R8C4'],
  ['R8C6', 'R8C7'], ['R9C4', 'R9C5'],
];

const colEdges = [
  ['R1C7', 'R2C7'], ['R2C5', 'R3C5'], ['R2C7', 'R3C7'], ['R3C3', 'R4C3'],
  ['R4C1', 'R5C1'], ['R4C4', 'R5C4'], ['R4C5', 'R5C5'], ['R5C5', 'R6C5'],
  ['R6C4', 'R7C4'], ['R7C1', 'R8C1'], ['R7C4', 'R8C4'], ['R7C5', 'R8C5'],
  ['R7C6', 'R8C6'], ['R8C2', 'R9C2'],
];

const markedRow = new Set(rowEdges.map(([a, b]) => `${a}-${b}`));
const markedCol = new Set(colEdges.map(([a, b]) => `${a}-${b}`));

// One shared pair of keyed predicates per possible reference digit k: "the
// difference is exactly k" (marked) and "the difference is not k" (unmarked).
const diffKeys = [];
const noDiffKeys = [];
for (let k = 1; k <= 9; k++) {
  diffKeys[k] = Pair.fnToKey((a, b) => Math.abs(a - b) === k, 9);
  noDiffKeys[k] = Pair.fnToKey((a, b) => Math.abs(a - b) !== k, 9);
}

// Build the Or-over-k switch for one row (refCell = R{r}C1) or column
// (refCell = R1C{c}), given its 8 ordered adjacent pairs and which of them
// are marked.
function referenceSwitch(refCell, pairs, markedSet) {
  const branches = [];
  for (let k = 1; k <= 9; k++) {
    const perPair = pairs.map(([a, b]) => {
      const key = markedSet.has(`${a}-${b}`) ? diffKeys[k] : noDiffKeys[k];
      return new Pair(key, 'xy-diff', a, b);
    });
    branches.push(new And([new Given(refCell, k), ...perPair]));
  }
  return new Or(branches);
}

const rowPairs = [];
for (let r = 1; r <= 9; r++) {
  const pairs = [];
  for (let c = 1; c <= 8; c++) {
    pairs.push([makeCellId(r, c), makeCellId(r, c + 1)]);
  }
  rowPairs.push(referenceSwitch(makeCellId(r, 1), pairs, markedRow));
}

const colPairs = [];
for (let c = 1; c <= 9; c++) {
  const pairs = [];
  for (let r = 1; r <= 8; r++) {
    pairs.push([makeCellId(r, c), makeCellId(r + 1, c)]);
  }
  colPairs.push(referenceSwitch(makeCellId(1, c), pairs, markedCol));
}

return [
  new Shape('9x9'),

  new Given('R4C8', 1),
  new Given('R6C2', 9),

  ...rowPairs,
  ...colPairs,
];
