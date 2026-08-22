// Title: Cloaked In Nightwinds
// Author: Barrels
// Video: https://www.youtube.com/watch?v=YjNwNn8ut7U
// Source: https://app.crackingthecryptic.com/sudoku/9jJDgBpLjN

// Rules encoded here:
//  - Normal sudoku: rows, columns and the default 3x3 boxes hold 1-9 once
//    each.
//  - Cages: digits sum to the small corner total. The rules do not state cage
//    distinctness, so Sum rather than Cage.
//  - Two square regions, one per drawn circle (R1C1, R6C6): each is the
//    upper-left cell of an s x s region, s being the digit placed there
//    (neither is given, so s is solved for). "Digits CAN repeat within a
//    region" adds no distinctness rule of its own -- row/column/box
//    distinctness already stand and are left as-is; the clause only says a
//    region carries no extra all-different beyond those. The two regions do
//    not overlap. No other cell is circled, so no other region exists; every
//    other cell is an ordinary sudoku cell. The two regions' digit sums are
//    tied equal.
// Nothing is omitted.

const graph = cellGraph('9x9');

// The 7 drawn givens.
const GIVENS = [
  ['R2C6', 4], ['R3C3', 9], ['R3C6', 5],
  ['R6C2', 4], ['R6C3', 5], ['R7C7', 8], ['R8C8', 5],
];

// The 7 drawn cages, as [total, cells].
const CAGES = [
  [9, ['R1C2', 'R2C2', 'R2C1']],
  [13, ['R1C7', 'R2C7', 'R3C7']],
  [12, ['R1C9', 'R1C8']],
  [13, ['R4C8', 'R4C7', 'R5C8']],
  [11, ['R8C1', 'R9C1']],
  [9, ['R7C1', 'R7C2', 'R7C3']],
  [11, ['R7C4', 'R8C4', 'R8C5']],
];

// The 2 drawn circles, each an unknown-size region's own upper-left corner.
const CIRCLES = ['R1C1', 'R6C6'];
const maxSizeAt = (cell) => {
  const { row, col } = parseCellId(cell);
  return Math.min(10 - row, 10 - col);
};

// Regions overlap iff their row ranges and column ranges both intersect.
function overlaps(cellA, sizeA, cellB, sizeB) {
  const a = parseCellId(cellA), b = parseCellId(cellB);
  const rowsOverlap = a.row < b.row + sizeB && b.row < a.row + sizeA;
  const colsOverlap = a.col < b.col + sizeB && b.col < a.col + sizeA;
  return rowsOverlap && colsOverlap;
}

// One branch per (size at R1C1, size at R6C6) pair that keeps both regions on
// the grid and disjoint: pin both circled digits to their sizes and tie the
// two regions' digit sums equal.
const [circleA, circleB] = CIRCLES;
const branches = [];
for (let sizeA = 1; sizeA <= maxSizeAt(circleA); sizeA++) {
  for (let sizeB = 1; sizeB <= maxSizeAt(circleB); sizeB++) {
    if (overlaps(circleA, sizeA, circleB, sizeB)) continue;
    const blockA = graph.block(circleA, sizeA, sizeA);
    const blockB = graph.block(circleB, sizeB, sizeB);
    branches.push(new And([
      new Given(circleA, sizeA),
      new Given(circleB, sizeB),
      new EqualSum(blockA, blockB),
    ]));
  }
}

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  ...CAGES.map(([total, cageCells]) => new Sum(total, ...cageCells)),
  new Or(branches),
];
