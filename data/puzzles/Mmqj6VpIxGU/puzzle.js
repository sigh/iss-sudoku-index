// Title: Squeeze Play
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=Mmqj6VpIxGU
// Source: https://sudokupad.app/sn2nojv4os?setting-nogrid=1

// Normal sudoku rules apply: standard rows, columns and 3x3 boxes.
//
// The board is drawn as a baseball field: the 9x9 sudoku is rotated 45
// degrees so that it fills a diamond, and the grid lines are drawn by hand.
// All coordinates below are the plain, unrotated 9x9 row/column numbering.
//
// Green line: adjacent digits differ by at least 5.
//
// Outside clues: sandwich sums (the sum of the digits between the 1 and the
// 9), one on each of two rows and two columns. They read as diagonals on the
// rotated display.
//
// Base paths: the four sides of the drawn white square joining the four
// bases are double arrows -- the digits between two bases sum to the two
// bases at the ends. The four bases hold four different digits.
//
// Nothing is omitted.

const geometry = cellGeometry('9x9');

const row = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const col = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// The four bases, in the order they are joined by the drawn base path: the
// home-plate pentagon at R9C9 and the three square base markers at R9C5,
// R5C5 and R5C9. In the source they sit on the corners of the tan infield.
const bases = ['R9C9', 'R9C5', 'R5C5', 'R5C9'];

// The base path is one closed white square through those four corners; each
// of its four sides is a separate double arrow. Walk each side to recover the
// cells it covers -- every side is a straight run of five cells.
const basePaths = bases.map((from, i) => {
  const a = parseCellId(from);
  const b = parseCellId(bases[(i + 1) % bases.length]);
  const dr = Math.sign(b.row - a.row);
  const dc = Math.sign(b.col - a.col);
  const len = Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col));
  return Array.from(
    { length: len + 1 }, (_, k) => makeCellId(a.row + k * dr, a.col + k * dc));
});

return [
  new Shape('9x9'),

  new Given('R2C2', 8),
  new Given('R2C8', 7),
  new Given('R4C6', 6),
  new Given('R4C8', 5),
  new Given('R6C4', 4),
  new Given('R7C7', 1),
  new Given('R8C2', 9),
  new Given('R8C4', 3),
  new Given('R9C9', 2),

  new Whisper(5,
    'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),

  Sandwich.fromCells(18, row(2), geometry),
  Sandwich.fromCells(18, row(5), geometry),
  Sandwich.fromCells(11, col(2), geometry),
  Sandwich.fromCells(23, col(5), geometry),

  // DoubleArrow takes the two circles as the first and last cells.
  ...basePaths.map((cells) => new DoubleArrow(...cells)),

  new AllDifferent(...bases),
];
