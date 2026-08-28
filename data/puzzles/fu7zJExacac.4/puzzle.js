// Title: Odd-Even-Big-Small
// Author: Unknown
// Video: https://www.youtube.com/watch?v=fu7zJExacac
// Source: https://cracking-the-cryptic.web.app/sudoku/Lfgq42qfdh

// Standard sudoku: digits 1-8 once each in every row, column and region.
// This grid's default 8x8 box tiling is 2 rows x 4 columns, which matches
// the puzzle's drawn regions exactly, so no explicit region constraint is
// needed.
//
// Outside-clue rule (video description, verbatim): "the first two cells in
// from a clue must obey the clue (small = 1,2,3,4; big = 5,6,7,8)". Even and
// odd take the standard meaning, undefined in the source text: even =
// 2,4,6,8; odd = 1,3,5,7. Each clue is a candidate restriction on the two
// grid cells nearest its printed edge, encoded as a multi-value Given.

const SMALL = [1, 2, 3, 4];
const BIG = [5, 6, 7, 8];
const EVEN = [2, 4, 6, 8];
const ODD = [1, 3, 5, 7];

const givens = [
  new Given('R2C4', 8),
  new Given('R2C6', 7),
  new Given('R3C2', 1),
  new Given('R4C7', 6),
  new Given('R5C2', 2),
  new Given('R6C7', 5),
  new Given('R7C3', 3),
  new Given('R7C5', 4),
];

// Each entry is [nearCell, farCell, set]: nearCell is the cell touching the
// labelled edge, farCell the next one in. Transcribed from the payload's
// `overlays` (text + center, read against the framed board) via the outside
// clue lanes: top C2/C3/C5, left R4/R5/R6/R7, right R2/R3, bottom C6/C7.
const outsideClueCells = [
  ['R1C2', 'R2C2', SMALL], // top of column 2: small
  ['R1C3', 'R2C3', EVEN],  // top of column 3: even
  ['R1C5', 'R2C5', BIG],   // top of column 5: big
  ['R4C1', 'R4C2', EVEN],  // left of row 4: even
  ['R5C1', 'R5C2', SMALL], // left of row 5: small
  ['R6C1', 'R6C2', BIG],   // left of row 6: big
  ['R7C1', 'R7C2', EVEN],  // left of row 7: even
  ['R2C8', 'R2C7', ODD],   // right of row 2: odd
  ['R3C8', 'R3C7', SMALL], // right of row 3: small
  ['R8C6', 'R7C6', EVEN],  // bottom of column 6: even
  ['R8C7', 'R7C7', SMALL], // bottom of column 7: small
];

const outsideClues = outsideClueCells.flatMap(
  ([near, far, set]) => [new Given(near, ...set), new Given(far, ...set)]);

return [
  new Shape('8x8'),
  ...givens,
  ...outsideClues,
];
