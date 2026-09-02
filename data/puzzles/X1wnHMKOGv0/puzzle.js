// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=X1wnHMKOGv0
// Source: https://cracking-the-cryptic.web.app/sudoku/P68BrQPTp7

// Compass. Divide the 9x9 grid into 9 regions along the grid lines. Every cell
// belongs to exactly one region, each region is orthogonally connected, and
// each region contains exactly one of the 9 compass cells. A number printed in
// a compass's north / east / south / west triangle counts the cells of that
// compass's own region lying strictly above / right of / below / left of the
// compass cell: the whole half of the grid on that side, not only the
// compass's own row or column. A cell off both the compass's row and its
// column therefore counts once vertically and once horizontally. A triangle
// with no number is unclued.
//
// There is no digit layer. The source draws no givens and no digit clue, so
// the answer is the region division alone: each cell's value here is the label
// 1-9 of the region it lies in, on a Raw grid so that rows, columns and boxes
// carry no rules of their own.
//
// Read on the whole-half-of-the-grid side because the two narrower readings are
// arithmetically impossible for these clues. Counting only the compass's own
// row and column caps R5C5's south count at the 4 cells below it, but its south
// triangle reads 5. Counting only the wedge cut off by the compass's own drawn
// diagonals caps R7C3's south count at the 4 cells inside that wedge, but its
// south triangle reads 7. Region sizes are likewise free rather than a uniform
// nine: R7C7 reads north 1, east 0 and south 0, confining its region to row 7
// west of C7 plus a single cell above, at most 8 cells in all.

const shape = new Shape('9x9', '1-9', 'Raw');
const at = (r, c) => makeCellId(r, c);

// The drawn clues. Each compass cell carries both of its corner-to-corner
// diagonals, splitting it into four triangles; n/e/s/w below are the numbers
// drawn in the north / east / south / west triangle, null where the triangle
// is blank. Listing order (reading order down the drawn X) fixes the labels.
const COMPASSES = [
  { cell: [3, 3], n: 1, e: null, s: null, w: null },
  { cell: [3, 7], n: null, e: null, s: null, w: 0 },
  { cell: [4, 4], n: 2, e: null, s: 1, w: 2 },
  { cell: [4, 6], n: 1, e: 0, s: null, w: null },
  { cell: [5, 5], n: null, e: 4, s: 5, w: 4 },
  { cell: [6, 4], n: null, e: null, s: null, w: 6 },
  { cell: [6, 6], n: 2, e: 1, s: null, w: 3 },
  { cell: [7, 3], n: null, e: null, s: 7, w: null },
  { cell: [7, 7], n: 1, e: 0, s: 0, w: null },
];

// Membership of the half-grid a triangle looks across, from the compass at
// (r, c). Strict: the compass's own row is outside n and s, its own column is
// outside e and w.
const SIDES = {
  n: (r, c) => (rr, cc) => rr < r,
  e: (r, c) => (rr, cc) => cc > c,
  s: (r, c) => (rr, cc) => rr > r,
  w: (r, c) => (rr, cc) => cc < c,
};

const COORDS = [];
for (let r = 1; r <= 9; r++) for (let c = 1; c <= 9; c++) COORDS.push([r, c]);

// A cell's value is its region's label, so region k is exactly the cells
// holding k. One connected area per label is the whole division rule: every
// cell already holds exactly one label, so the 9 areas tile the grid.
const regions = COMPASSES.map((_, i) => new ConnectedValues('', i + 1));

// Each region holds its own compass, so pinning compass k to label k is the
// labelling convention itself. It also supplies the "exactly one compass per
// region" half of the rule: the 9 compasses take the 9 distinct labels, so no
// region can hold two of them, and none of the 9 labels is empty.
const anchors = COMPASSES.map((c, i) => new Given(at(...c.cell), i + 1));

// "Exactly n cells of region k lie on this side" as a look-and-say (count,
// value) pair, which restricts label k's count and leaves every other label
// free. Counts run 0-7 and labels 1-9, so each clue is one digit pair.
const counts = COMPASSES.flatMap((compass, i) => {
  const label = i + 1;
  const [r, c] = compass.cell;
  return Object.keys(SIDES)
    .filter(dir => compass[dir] !== null)
    .map(dir => {
      const inSide = SIDES[dir](r, c);
      const cells = COORDS.filter(rc => inSide(...rc)).map(rc => at(...rc));
      return new LookAndSay(`${compass[dir]}${label}`, ...cells);
    });
});

return [shape, ...anchors, ...regions, ...counts];
