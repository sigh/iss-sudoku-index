// Title: Stitches Sudoku
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=gTvPMgaBwb0
// Source: https://app.crackingthecryptic.com/sudoku/NGPN2NHHM6

// Standard 9x9 sudoku with the default 3x3 boxes (matches the payload's own
// region list). The anti-diagonal R1C9-R2C8-...-R9C1 is drawn in blue: its
// digits cannot repeat and must alternate parity along the line, encoded as
// Diagonal(1) (all-different) plus Modular(2, ...) (every consecutive pair
// differs mod 2, i.e. alternates odd/even).
//
// Seven gray "stitch" lines each run circle-middle-circle across three
// cells: a circled end, a gray cell strictly between the two circled
// values, and the other circled end. Between(...) takes the first and last
// cells of its argument list as the circled ends and every cell in between
// as constrained strictly between them -- exactly this shape. Every
// stitch's middle cell is an interior cell of the blue diagonal; the two
// ends sit one step off the diagonal on each side.
//
// Five outside arrows give little-killer sums (repeats allowed) along
// broken diagonals; each entry cell/direction pair was read directly off
// the arrow's own drawn waypoints and paired to its overlay number at zero
// on-canvas distance.
//
// One X (sum 10) and one V (sum 5) marker are drawn on grid edges, plus two
// white circles (consecutive). The rules say not every X/V/white-circle is
// shown, so unmarked adjacent pairs are left unconstrained -- no negative
// constraint is implied.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

// Anti-diagonal cells in drawn order (R1C9 -> R9C1).
const blueDiagonal = [
  'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1',
];

// Stitch lines (circled end, gray middle, circled end): each is a short
// diagonal stroke centred on an interior anti-diagonal cell, with the
// matching circle overlays at its ends.
const stitches = [
  ['R1C7', 'R2C8', 'R3C9'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R7C1', 'R8C2', 'R9C3'],
];

// Little-killer arrows: (entry cell, dRow, dCol, sum), read from each
// arrow's off-grid stroke direction and paired to its overlay text by
// nearest on-canvas distance (all at distance 0).
const littleKillers = [
  ['R1C4', 1, -1, 30],
  ['R1C7', 1, -1, 12],
  ['R3C9', 1, -1, 59],
  ['R6C9', 1, -1, 22],
  ['R9C9', -1, -1, 24],
];

return [
  shape,
  new Diagonal(1),
  new Modular(2, ...blueDiagonal),
  ...stitches.map(cells => new Between(...cells)),
  ...littleKillers.map(([cell, dRow, dCol, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(cell, dRow, dCol), geometry)),
  new X('R1C8', 'R1C9'),
  new V('R9C1', 'R9C2'),
  new WhiteDot('R2C7', 'R3C7'),
  new WhiteDot('R7C2', 'R7C3'),
];
