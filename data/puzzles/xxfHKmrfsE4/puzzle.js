// Title: Oops! All Twins
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=xxfHKmrfsE4
// Source: https://sudokupad.app/6i4p1bm3xi?setting-nogrid

// FULL SCHRODINGER: a 4x4 logical grid of "twin" cells drawn on an 8x8
// canvas. Logical cell (I,J) occupies physical rows {2I-1,2I} and columns
// {2J-1,2J}; its upper-left physical cell (R(2I-1)C(2J-1)) holds the
// smaller of its two digits, its lower-right physical cell (R(2I)C(2J))
// the larger. The other two physical cells of each 2x2 block are always
// blank (established from the payload's own hidden cages, its 2x2-block
// overlays, and its blank cells array).
//
// Each digit 1-8 appears exactly once among the eight occupied cells of
// every logical row, column, and 2x2 box (four logical cells x two digits).
// The grid is widened to a spare 9th value so the always-blank cells have
// somewhere to go without breaking the contiguous alphabet; they are then
// pinned there so they contribute no free choices.
const shape = new Shape('8x8', 9, 'Raw');

const occupied = [];
const blank = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const cell = makeCellId(r, c);
    if ((r % 2) === (c % 2)) occupied.push(cell); else blank.push(cell);
  }
}
const occupiedGivens = occupied.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8));
const blankGivens = blank.map(cell => new Given(cell, 9));

function ulCell(I, J) { return makeCellId(2 * I + 1, 2 * J + 1); }
function lrCell(I, J) { return makeCellId(2 * I + 2, 2 * J + 2); }

// "The smaller digit should go in the upper left, and the larger one in
// the lower right." Upper-left and lower-right of a block are diagonal, not
// grid-adjacent, so this is a Pair rather than GreaterThan (which binds by
// grid adjacency).
const lessThan = Pair.fnToKey((a, b) => a < b, shape);
const twins = [];
for (let I = 0; I < 4; I++) {
  for (let J = 0; J < 4; J++) {
    twins.push(new Pair(lessThan, 'twin', ulCell(I, J), lrCell(I, J)));
  }
}

// Logical rows/columns/2x2 boxes: each is the eight occupied cells of four
// logical cells, all-different (the payload's own hidden `unique` cages use
// these identical cell sets, one cage per line/box).
function cellsForRow(I) {
  const cells = [];
  for (let J = 0; J < 4; J++) cells.push(ulCell(I, J), lrCell(I, J));
  return cells;
}
function cellsForCol(J) {
  const cells = [];
  for (let I = 0; I < 4; I++) cells.push(ulCell(I, J), lrCell(I, J));
  return cells;
}
function cellsForBox(BI, BJ) {
  const cells = [];
  for (let di = 0; di < 2; di++) {
    for (let dj = 0; dj < 2; dj++) {
      cells.push(ulCell(BI * 2 + di, BJ * 2 + dj), lrCell(BI * 2 + di, BJ * 2 + dj));
    }
  }
  return cells;
}
const rows = [0, 1, 2, 3].map(I => new AllDifferent(...cellsForRow(I)));
const cols = [0, 1, 2, 3].map(J => new AllDifferent(...cellsForCol(J)));
const boxes = [];
for (let BI = 0; BI < 2; BI++) {
  for (let BJ = 0; BJ < 2; BJ++) boxes.push(new AllDifferent(...cellsForBox(BI, BJ)));
}

// A sum clue whose cells are logical cells, not grid cells: "a cell can take
// the value of either of its digits", so each logical cell independently
// contributes either its smaller or its larger digit to the total. `pairs`
// is one [smallerCell, largerCell] per logical cell in the clue; every one
// of the 2^n ways to pick a digit per logical cell is offered as an Or
// branch, so the constraint holds whenever at least one pick sums to
// `target` -- exactly "is a sum of" with the puzzle's own per-cell choice,
// not a claim about which digit each cell contributes.
function chosenDigitSum(target, pairs) {
  const branches = [];
  for (let mask = 0; mask < (1 << pairs.length); mask++) {
    const cells = pairs.map((pair, i) => pair[(mask >> i) & 1]);
    branches.push(new And([new Sum(target, ...cells)]));
  }
  return new Or(branches);
}

// "A number on a diamond is a sum of the cells it separates." Each drawn
// diamond sits at the corner shared by two adjacent logical cells (either
// side-by-side in one logical row or stacked in one logical column).
const diamonds = [
  chosenDigitSum(9, [[ulCell(0, 1), lrCell(0, 1)], [ulCell(0, 2), lrCell(0, 2)]]),
  chosenDigitSum(9, [[ulCell(1, 1), lrCell(1, 1)], [ulCell(1, 2), lrCell(1, 2)]]),
  chosenDigitSum(9, [[ulCell(0, 3), lrCell(0, 3)], [ulCell(1, 3), lrCell(1, 3)]]),
  chosenDigitSum(9, [[ulCell(1, 3), lrCell(1, 3)], [ulCell(2, 3), lrCell(2, 3)]]),
  chosenDigitSum(7, [[ulCell(2, 1), lrCell(2, 1)], [ulCell(2, 2), lrCell(2, 2)]]),
  chosenDigitSum(9, [[ulCell(2, 0), lrCell(2, 0)], [ulCell(3, 0), lrCell(3, 0)]]),
  chosenDigitSum(8, [[ulCell(3, 0), lrCell(3, 0)], [ulCell(3, 1), lrCell(3, 1)]]),
];

// "A number outside a row a column is a sum of that row or column." Each
// clued line is one logical row or column (four logical cells), read with
// the same per-cell either-digit choice as the diamonds.
const outside = [
  chosenDigitSum(13, [0, 1, 2, 3].map(I => [ulCell(I, 0), lrCell(I, 0)])), // top of column 1
  chosenDigitSum(26, [0, 1, 2, 3].map(I => [ulCell(I, 0), lrCell(I, 0)])), // bottom of column 1
  chosenDigitSum(11, [0, 1, 2, 3].map(J => [ulCell(0, J), lrCell(0, J)])), // left of row 1
  chosenDigitSum(26, [0, 1, 2, 3].map(J => [ulCell(0, J), lrCell(0, J)])), // right of row 1
];

return [
  shape,
  ...occupiedGivens,
  ...blankGivens,
  ...twins,
  ...rows,
  ...cols,
  ...boxes,
  ...diamonds,
  ...outside,
];
