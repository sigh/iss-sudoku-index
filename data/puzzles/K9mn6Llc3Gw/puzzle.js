// Title: The Amazing Invisible Dice
// Author: Unknown
// Video: https://www.youtube.com/watch?v=K9mn6Llc3Gw
// Source: https://cracking-the-cryptic.web.app/sudoku/mj3dnMb8NM

// Normal sudoku rules apply (rows/columns/3x3 boxes). "The grey shape in the
// grid is the net of a dice with faces 1-6, and opposite faces summing to 7.
// Hidden in the grid is an exact clone of the shape." Read as two clauses:
// (1) the grey shape's own 6 cells are unresolved die-net cells -- digits
// 1-6 once each, with opposite faces summing to 7 -- not just decoration
// (they carry no given digit because they are solved, not given); (2) "an
// exact clone" is a cell-wise clone, value-for-value, not merely a
// structurally-similar independent copy -- a second, hidden placement of the
// same outline whose 6 cells each equal the grey cell in the same relative
// (role) position. Cloning the grey cells' values into the hidden copy
// automatically carries the net-value rule over to the clone too, so the
// clone branches only need the equality.
//
// The drawn (grey) outline occupies R3C4, R4C3, R4C4, R4C5, R5C4, R6C4 -- a
// 4-cell vertical column (R3C4..R6C4) with a flap left (R4C3) and right
// (R4C5) of the column's second cell (R4C4). This is the classic "Latin
// cross" cube net: folding the column's 2nd cell (here R4C4) flat gives the
// FRONT face; its up/down/left/right neighbours in the net fold up to
// TOP/BOTTOM/LEFT/RIGHT, and the column's far end (two fold-steps beyond
// BOTTOM, here R6C4) wraps around underneath to BACK, opposite FRONT. So the
// net's three opposite pairs are (TOP, BOTTOM), (LEFT, RIGHT), (FRONT, BACK)
// -- each must sum to 7 per the stated rule.
//
// The clone keeps the same orientation as the drawn outline (translated
// only, no rotation or reflection): "exact clone" is read as excluding a
// rotated/reflected copy, and is required to sit at a different position
// from the drawn one (excluded below), since the drawn one is visible, not
// hidden.

// Role offsets from the shape's bounding-box top-left corner (row0..3,
// col0..2), derived from the drawn outline above.
const ROLE_OFFSETS = {
  TOP: [0, 1],
  LEFT: [1, 0],
  FRONT: [1, 1],
  RIGHT: [1, 2],
  BOTTOM: [2, 1],
  BACK: [3, 1],
};
const OPPOSITE_PAIRS = [['TOP', 'BOTTOM'], ['LEFT', 'RIGHT'], ['FRONT', 'BACK']];

// The drawn outline's own bounding-box top-left corner, so it can be
// excluded from the candidate placements below (the clone must be
// elsewhere, since the drawn one is visible, not hidden).
const DRAWN_ORIGIN = { r0: 3, c0: 3 };

// Every translation of the bounding box (4 rows x 3 cols) that fits on the
// 9x9 grid, excluding the drawn position itself.
const candidateOrigins = [];
for (let r0 = 1; r0 <= 6; r0++) {
  for (let c0 = 1; c0 <= 7; c0++) {
    if (r0 === DRAWN_ORIGIN.r0 && c0 === DRAWN_ORIGIN.c0) continue;
    candidateOrigins.push({ r0, c0 });
  }
}

const roleCellAt = (r0, c0, role) => {
  const [dr, dc] = ROLE_OFFSETS[role];
  return makeCellId(r0 + dr, c0 + dc);
};

const greyCellOf = role => roleCellAt(DRAWN_ORIGIN.r0, DRAWN_ORIGIN.c0, role);
const roles = Object.keys(ROLE_OFFSETS);

// The grey outline's own die-net constraint: 1-6 once each, opposite faces
// (per the fold-derived pairing above) sum to 7.
const greyNetConstraints = [
  ...roles.map(role => new Given(greyCellOf(role), 1, 2, 3, 4, 5, 6)),
  new AllDifferent(...roles.map(greyCellOf)),
  ...OPPOSITE_PAIRS.map(([a, b]) => new Sum(7, greyCellOf(a), greyCellOf(b))),
];

// One branch per candidate placement: its 6 cells each equal the grey
// cell in the same role (a cell-wise "clone", ISS's `SameValues` sense).
const branches = candidateOrigins.map(({ r0, c0 }) => new And(
  roles.map(role => new SameValues(2, greyCellOf(role), roleCellAt(r0, c0, role)))
));

return [
  new Shape('9x9'),

  new Given('R1C7', 7),
  new Given('R1C9', 4),
  new Given('R2C1', 6),
  new Given('R2C5', 4),
  new Given('R2C8', 3),
  new Given('R3C2', 8),
  new Given('R3C9', 9),
  new Given('R5C2', 5),
  new Given('R5C8', 9),
  new Given('R6C3', 1),
  new Given('R8C2', 2),
  new Given('R8C5', 8),
  new Given('R8C7', 1),
  new Given('R8C9', 6),
  new Given('R9C3', 7),

  ...greyNetConstraints,
  new Or(branches),
];
