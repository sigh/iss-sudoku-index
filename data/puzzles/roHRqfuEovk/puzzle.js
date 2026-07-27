// Title: Index Fingers
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=roHRqfuEovk
// Source: https://sudokupad.app/1dm8yvq9jt

// Normal 6x6 sudoku rules apply (default row/column/box all-different from
// Shape; the grid's own `regions` are the standard 2x3 boxes).
//
// Six fingers are drawn on the grid. Each finger is a bent 3-cell king-move
// path, base -> middle -> tip (fingernail). Reading the solved digits along a
// finger from base to tip gives digits A, B, C: row A, column B holds that
// finger's gold ring, and the ring's digit is C. Every row, column and box
// holds exactly one ring, the six rings hold six different digits, and no
// ring's grid position may be any of the 18 cells that make up the six
// fingers.

// Finger cells, base -> middle -> tip, one row per finger. Each finger is drawn
// as a square-ended skin pill, a short nub, a stroke, and a round end cap. The
// tip is the capped end: it carries a white oval rotated to the finger's own
// axis and inset just inside the cap -- a fingernail. The base is the
// square-cut pill end. The faint "(|)" glyphs sit on the middle cell of every
// finger and mark the knuckle, not either end.
const fingers = [
  ['R3C5', 'R2C5', 'R1C4'],
  ['R5C3', 'R4C3', 'R4C4'],
  ['R3C2', 'R2C3', 'R3C4'],
  ['R6C5', 'R6C4', 'R5C4'],
  ['R6C6', 'R5C6', 'R4C6'],
  ['R1C1', 'R1C2', 'R2C2'],
];
const fingerCells = new Set(fingers.flat());

// This puzzle's boxes are 2 rows x 3 cols; box(r, c) matches the payload's
// `regions` order (region index + 1).
function box(r, c) {
  return Math.floor((r - 1) / 2) * 2 + Math.floor((c - 1) / 3) + 1;
}

// One Var per finger holds its ring's box index, tied to (row, col) below so
// "one ring per box" can be checked with a plain AllDifferent.
const ringBox = new Var('B', 'ring box index', fingers.length);

// For each finger, the ring cell is whichever non-finger grid cell (r, c)
// matches the finger's base/middle digits; that branch also pins the
// matching box index and requires the target cell's digit to equal the
// finger's tip digit.
const ringLinks = fingers.map(([base, middle, tip], i) => {
  const branches = [];
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 6; c++) {
      const target = makeCellId(r, c);
      if (fingerCells.has(target)) continue;
      branches.push(new And([
        new Given(base, r),
        new Given(middle, c),
        new SameValues(2, target, tip),
        new Given(ringBox.cell(i + 1), box(r, c)),
      ]));
    }
  }
  return new Or(branches);
});

return [
  new Shape('6x6'),

  ringBox,
  ...ringBox.cells().map(v => new Given(v, 1, 2, 3, 4, 5, 6)),

  ...ringLinks,

  // One ring per row, one per column, one per box.
  new AllDifferent(...fingers.map(f => f[0])),
  new AllDifferent(...fingers.map(f => f[1])),
  new AllDifferent(...ringBox.cells()),

  // Each ring holds a different digit.
  new AllDifferent(...fingers.map(f => f[2])),
];
