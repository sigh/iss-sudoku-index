// Title: Sudoku Bowl LIX
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=BsBlndvhpmc
// Source: https://sudokupad.app/xubeuskt61

// Normal sudoku on a 9x9 grid with standard boxes (regions match the default
// boxes, so no explicit region constraint is needed).
//
// German Whispers: every drawn line, regardless of colour, requires adjacent
// cells to differ by at least 5. The grid has 9 separate whisper strokes; a
// couple of pairs share an endpoint (a branch point) or close into a small
// loop, so each stroke is kept as its own Whisper with its own drawn cell
// order rather than merged into a longer path.
//
// Kropki Footballs: a white football means the two cells are consecutive: a
// black football means one is exactly double the other. "Not all footballs
// are necessarily given" means absence carries no information, so these are
// plain WhiteDot/BlackDot pairs, not the strict (all-dots-given) variant.
// Cell pairs below are read from the drawn football ovals (each spans the
// shared border of exactly two adjacent cells).

const whispers = [
  new Whisper(5, 'R6C1', 'R7C1', 'R8C1'),
  new Whisper(5, 'R8C2', 'R7C1', 'R6C2'),
  new Whisper(5, 'R6C4', 'R6C3', 'R7C3', 'R7C4'),
  // Loops back through R7C6, closing a small square (R7C6-R7C7-R6C7-R6C6)
  // with a tail out to R8C6; the repeated cell reproduces that closing edge.
  new Whisper(5, 'R8C6', 'R7C6', 'R7C7', 'R6C7', 'R6C6', 'R7C6'),
  new Whisper(5, 'R7C8', 'R8C8', 'R9C8'),
  new Whisper(5, 'R8C8', 'R8C9', 'R7C9'),
  new Whisper(5, 'R8C9', 'R9C9'),
  new Whisper(5, 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R4C7', 'R3C7', 'R2C7'),
  new Whisper(5, 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
];

const whiteFootballs = [
  ['R8C3', 'R8C4'],
  ['R7C7', 'R7C8'],
  ['R4C5', 'R4C6'],
  ['R2C3', 'R2C4'],
  ['R3C1', 'R4C1'],
].map(cells => new WhiteDot(...cells));

const blackFootballs = [
  ['R6C4', 'R6C5'],
  ['R4C4', 'R4C5'],
  ['R6C7', 'R6C8'],
  ['R8C6', 'R8C7'],
  ['R6C4', 'R7C4'],
  ['R8C2', 'R8C3'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  new Given('R2C5', 5),
  new Given('R2C6', 9),
  ...whispers,
  ...whiteFootballs,
  ...blackFootballs,
];
