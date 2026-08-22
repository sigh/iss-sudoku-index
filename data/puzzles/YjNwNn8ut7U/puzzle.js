// Title: Cloaked In Nightwinds
// Author: Barrels
// Video: https://www.youtube.com/watch?v=YjNwNn8ut7U
// Source: https://app.crackingthecryptic.com/sudoku/9jJDgBpLjN

// Rules encoded:
// - Normal sudoku: default 9x9 rows, columns and 3x3 boxes.
// - Cages: digits sum to the small corner clue. The rules state only the
//   sum, so Sum rather than Cage; every drawn cage happens to lie within a
//   single row, column or box, so the two are equivalent here anyway.
// - Circles: exactly two circles are drawn, on R1C1 and R6C6. Each circled
//   cell is the upper-left cell of a square region whose side length is that
//   cell's own (unknown) digit, and the two regions' digit sums are equal.
//   Encoded as an Or over every (side at R1C1, side at R6C6) pair for which
//   both squares lie on the grid; each branch pins the two circled digits
//   and ties the two blocks' sums with EqualSum. The side bound is the
//   grid-fit requirement implicit in "a region of size x by x" (at R6C6 a
//   side of 5+ would leave the grid); the rules do not forbid the two
//   regions overlapping, so no on-grid pair is excluded.
// - "Digits CAN repeat within a region" and "the digits in the circles can
//   be different" are clarifications, adding no constraint: the regions get
//   no all-different of their own, and the circle digits are not tied.
// Nothing is omitted.

const graph = cellGraph('9x9');

// The 7 drawn givens.
const GIVENS = [
  ['R2C6', 4], ['R3C3', 9], ['R3C6', 5],
  ['R6C2', 4], ['R6C3', 5], ['R7C7', 8], ['R8C8', 5],
];

// The 7 drawn cages, as [total, cells], from the drawn cage outlines.
const CAGES = [
  [9, ['R1C2', 'R2C2', 'R2C1']],
  [13, ['R1C7', 'R2C7', 'R3C7']],
  [12, ['R1C9', 'R1C8']],
  [13, ['R4C8', 'R4C7', 'R5C8']],
  [11, ['R8C1', 'R9C1']],
  [9, ['R7C1', 'R7C2', 'R7C3']],
  [11, ['R7C4', 'R8C4', 'R8C5']],
];

// The 2 drawn circles: each cell anchors its own square region.
const CIRCLES = ['R1C1', 'R6C6'];

// One branch per pair of side lengths that keeps both squares on the grid
// (block() is null off-grid): pin both circled digits to their region's side
// and tie the two regions' digit sums equal.
const [circleA, circleB] = CIRCLES;
const branches = [];
for (let sideA = 1; sideA <= 9; sideA++) {
  const blockA = graph.block(circleA, sideA, sideA);
  if (!blockA) continue;
  for (let sideB = 1; sideB <= 9; sideB++) {
    const blockB = graph.block(circleB, sideB, sideB);
    if (!blockB) continue;
    branches.push(new And([
      new Given(circleA, sideA),
      new Given(circleB, sideB),
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
