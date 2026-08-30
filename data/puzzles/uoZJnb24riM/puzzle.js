// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=uoZJnb24riM
// Source: https://cracking-the-cryptic.web.app/sudoku/Rf8JpjJTFp

// Normal sudoku (9x9, rows/columns/3x3 boxes all-different -- ISS default).
// Two boxes (top-middle, bottom-middle) carry grey-shaded cells that must
// hold odd digits; since a box always holds each digit 1-9 exactly once,
// that also forces the box's other 4 cells to the 4 even digits. In each of
// the other 7 boxes, the 5 cells holding that box's odd digits must form a
// connected pentomino shape, and the 7 shapes produced (one per box) must
// all be mutually different up to rotation/reflection.
//
// Pentomino-shape catalogue: a 5-cell subset of a 3x3 box that is
// orthogonally connected always sits within that same 3x3 bounding box, so
// the whole placement space is finite and was enumerated once offline: of
// the C(9,5)=126 five-cell subsets of a 3x3 box, exactly 49 are connected,
// and those 49 fall into exactly 10 shapes once grouped by the 8 symmetries
// (4 rotations x reflection) of the box. PENTOMINO_PATTERNS lists each of
// the 49 as the box-local cell indices (0-8, row-major within the box) that
// would be odd, tagged with which of the 10 shape classes (1-10) it
// belongs to. Class numbering is arbitrary (not tied to conventional
// pentomino letter names) -- it only needs to agree with itself so distinct
// classes mean distinct shapes.
const PENTOMINO_PATTERNS = [
  { odd: [0, 1, 2, 3, 4], class: 1 },
  { odd: [0, 1, 2, 4, 5], class: 1 },
  { odd: [0, 1, 3, 4, 6], class: 1 },
  { odd: [0, 3, 4, 6, 7], class: 1 },
  { odd: [1, 2, 4, 5, 8], class: 1 },
  { odd: [2, 4, 5, 7, 8], class: 1 },
  { odd: [3, 4, 6, 7, 8], class: 1 },
  { odd: [4, 5, 6, 7, 8], class: 1 },
  { odd: [0, 1, 2, 3, 5], class: 2 },
  { odd: [0, 1, 3, 6, 7], class: 2 },
  { odd: [1, 2, 5, 7, 8], class: 2 },
  { odd: [3, 5, 6, 7, 8], class: 2 },
  { odd: [0, 1, 2, 3, 6], class: 3 },
  { odd: [0, 1, 2, 5, 8], class: 3 },
  { odd: [0, 3, 6, 7, 8], class: 3 },
  { odd: [2, 5, 6, 7, 8], class: 3 },
  { odd: [0, 1, 2, 4, 7], class: 4 },
  { odd: [0, 3, 4, 5, 6], class: 4 },
  { odd: [1, 4, 6, 7, 8], class: 4 },
  { odd: [2, 3, 4, 5, 8], class: 4 },
  { odd: [0, 1, 3, 4, 5], class: 5 },
  { odd: [0, 1, 3, 4, 7], class: 5 },
  { odd: [1, 2, 3, 4, 5], class: 5 },
  { odd: [1, 2, 4, 5, 7], class: 5 },
  { odd: [1, 3, 4, 6, 7], class: 5 },
  { odd: [1, 4, 5, 7, 8], class: 5 },
  { odd: [3, 4, 5, 6, 7], class: 5 },
  { odd: [3, 4, 5, 7, 8], class: 5 },
  { odd: [0, 1, 4, 5, 7], class: 6 },
  { odd: [0, 3, 4, 5, 7], class: 6 },
  { odd: [1, 2, 3, 4, 7], class: 6 },
  { odd: [1, 3, 4, 5, 6], class: 6 },
  { odd: [1, 3, 4, 5, 8], class: 6 },
  { odd: [1, 3, 4, 7, 8], class: 6 },
  { odd: [1, 4, 5, 6, 7], class: 6 },
  { odd: [2, 3, 4, 5, 7], class: 6 },
  { odd: [0, 1, 4, 5, 8], class: 7 },
  { odd: [0, 3, 4, 7, 8], class: 7 },
  { odd: [1, 2, 3, 4, 6], class: 7 },
  { odd: [2, 4, 5, 6, 7], class: 7 },
  { odd: [0, 1, 4, 6, 7], class: 8 },
  { odd: [0, 2, 3, 4, 5], class: 8 },
  { odd: [1, 2, 4, 7, 8], class: 8 },
  { odd: [3, 4, 5, 6, 8], class: 8 },
  { odd: [0, 1, 4, 7, 8], class: 9 },
  { odd: [0, 3, 4, 5, 8], class: 9 },
  { odd: [1, 2, 4, 6, 7], class: 9 },
  { odd: [2, 3, 4, 5, 6], class: 9 },
  { odd: [1, 3, 4, 5, 7], class: 10 },
];

// Widened to 10 only so the per-box shape-class Var below can take all 10
// possible values; the boxes stay the default 3x3 tiling (sized from the
// grid dimensions, not the value range).
const puzzleShape = new Shape('9x9', 10);
const graph = cellGraph(puzzleShape);
const gridCells = graph.cells();

// Restrict every real grid cell back to its true 1-9 digit range.
const gridDomainRestriction = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// --- Givens (printed digits). ---
const givens = [
  new Given('R1C7', 6), new Given('R1C9', 9),
  new Given('R3C1', 3),
  new Given('R4C2', 7), new Given('R4C4', 2), new Given('R4C9', 1),
  new Given('R5C6', 6),
  new Given('R6C1', 4), new Given('R6C3', 1), new Given('R6C4', 3),
  new Given('R6C6', 7), new Given('R6C7', 9), new Given('R6C9', 6),
  new Given('R7C8', 2),
  new Given('R8C3', 4),
  new Given('R9C1', 9), new Given('R9C9', 3),
];

// --- Grey cells (drawn as light-grey square underlays): must be odd. All
// 10 sit in the top-middle box (R1-3,C4-6) and the bottom-middle
// box (R7-9,C4-6); no rule applies to those boxes' other cells beyond the
// box all-different that ISS already enforces (which forces them even,
// since a box always holds one of each digit 1-9 and the 5 grey cells
// already claim all 5 odd digits).
const GREY_CELLS = [
  'R1C4', 'R1C6', 'R3C4', 'R3C5', 'R3C6',
  'R7C4', 'R7C5', 'R7C6', 'R9C4', 'R9C6',
];
const greyOddGivens = GREY_CELLS.map(cell => new Given(cell, 1, 3, 5, 7, 9));

// --- The other 7 boxes: each one's odd-cell pattern must be one of the 49
// valid pentomino placements above, and the 7 boxes' shape classes must all
// differ. box(n) is 1-based reading order under the default tiling; the two
// grey boxes above are box(2) (top-middle) and box(8) (bottom-middle), so
// the other 7 are:
const SHAPE_BOX_NUMS = [1, 3, 4, 5, 6, 7, 9];
const shapeVar = new Var(
  'SH', 'odd-cell pentomino shape class (1-10) per non-grey box',
  SHAPE_BOX_NUMS.length);

const shapeConstraints = SHAPE_BOX_NUMS.map((boxNum, i) => {
  const boxCells = graph.box(boxNum);
  const labelCell = shapeVar.cell(i + 1);
  return new Or(PENTOMINO_PATTERNS.map(({ odd, class: cls }) => new And([
    ...odd.map(idx => new Given(boxCells[idx], 1, 3, 5, 7, 9)),
    new Given(labelCell, cls),
  ])));
});

return [
  puzzleShape,
  gridDomainRestriction,
  ...givens,
  ...greyOddGivens,
  shapeVar,
  ...shapeConstraints,
  new AllDifferent(...shapeVar.cells()),
];
