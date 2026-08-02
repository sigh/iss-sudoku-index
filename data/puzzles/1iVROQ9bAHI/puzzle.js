// Title: Twenty Lines
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=1iVROQ9bAHI
// Source: https://app.crackingthecryptic.com/sudoku/y74wrbb125

// Normal Sudoku. R5C1=5 is the only given.
// Twenty Lines: each grey line is completely divided into one or more
// non-overlapping strings of digits adjacent along the line, each string
// summing to 20. Repeats within a string are allowed where Sudoku allows them,
// so no extra all-different applies.
// Black dots: the marked adjacent pair is in a 1:2 ratio. "Not all dots are
// necessarily given", so unmarked adjacent pairs are unconstrained.
// Nothing is omitted. The one-cell `msgcorrect` overlay at R1C1 is the
// source's success message, not a clue.

// The eleven grey lines, transcribed as drawn (cell order along the stroke).
// Two of them are stored as a pair of polylines that share a cell rather than
// as one array: R9C2..R8C2 with R8C2..R6C2, and R6C9..R8C9 with R8C9..R9C7.
// Each pair overlaps on a whole cell, so it renders as one unbroken grey
// stroke of a single colour and width -- at R8C2 the join is even collinear
// (R8C1-R8C2-R8C3) -- and is transcribed here as the one line it draws. Every
// other line in the puzzle stops a full cell short of its neighbour, leaving a
// visible gap; these two joins have no such gap.
const twentyLines = [
  ['R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R6C9', 'R6C8', 'R6C7', 'R7C7', 'R7C8', 'R7C9',
    'R8C9', 'R8C8', 'R9C9', 'R9C8', 'R9C7'],
  ['R9C2', 'R9C1', 'R8C1', 'R8C2', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R6C2'],
  ['R7C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R2C4', 'R2C5',
    'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R1C9', 'R1C8'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R8C7', 'R8C6', 'R8C5'],
  ['R3C5', 'R3C4', 'R4C4'],
  ['R3C2', 'R3C3', 'R4C3'],
  ['R5C7', 'R5C8', 'R5C9'],
];

// Black-dot pairs, transcribed from the drawn dots.
const blackDots = [
  ['R9C2', 'R9C3'], ['R7C4', 'R8C4'], ['R2C1', 'R1C1'],
  ['R5C9', 'R6C9'], ['R5C5', 'R6C5'], ['R1C9', 'R2C9'],
  ['R4C9', 'R3C9'], ['R1C5', 'R2C5'],
];

return [
  new Shape('9x9'),
  new Given('R5C1', 5),
  // SumLine splits its cells in list order, so the two steps that move
  // diagonally (R8C8-R9C9 and R7C1-R6C2) stay inside a string, matching the
  // drawn stroke, which passes straight through them.
  ...twentyLines.map(cells => new SumLine(20, ...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
