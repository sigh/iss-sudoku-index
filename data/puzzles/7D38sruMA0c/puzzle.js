// Title: Flywheel
// Author: Innocuous
// Video: https://www.youtube.com/watch?v=7D38sruMA0c
// Source: https://app.crackingthecryptic.com/sudoku/p3Nm96MDBp

// Normal sudoku (rows/cols/3x3 boxes). All six drawn lines are renban lines
// (a set of consecutive, non-repeating digits in any order); line colour is
// visual only, both colours are renban per the rules text. Cells marked with
// an opaque grey square must hold an even digit, encoded as a candidate
// restriction Given. Each two-digit circle sits at a grid intersection and
// touches the four surrounding cells; both listed digits must appear
// somewhere among those four cells.

const evenCells = [
  'R1C4', 'R2C2', 'R2C9', 'R8C1', 'R8C8', 'R9C6',
];

const renbanLines = [
  ['R1C3', 'R2C3', 'R3C4', 'R4C5', 'R5C5', 'R6C5', 'R7C6', 'R8C7', 'R9C7'],
  ['R7C1', 'R6C2', 'R6C3', 'R5C4', 'R5C5', 'R5C6', 'R4C7', 'R4C8', 'R3C9'],
  ['R3C3', 'R3C2', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7'],
  ['R7C7', 'R7C8', 'R7C9', 'R6C9', 'R5C9'],
  ['R7C3', 'R8C3', 'R9C3', 'R9C4', 'R9C5'],
];

// Each entry is [top-left cell of the 2x2 the circle touches, its two digits].
// Quad(topLeftCell, ...values) requires all listed values somewhere in the
// 2x2 square starting there -- exactly the circle rule.
const circles = [
  ['R1C1', 2, 3],
  ['R4C1', 2, 3],
  ['R8C1', 4, 5],
  ['R8C4', 4, 5],
  ['R1C5', 5, 6],
  ['R1C8', 5, 6],
  ['R5C8', 7, 8],
  ['R8C8', 7, 8],
];

return [
  new Shape('9x9'),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...circles.map(([topLeftCell, ...values]) => new Quad(topLeftCell, ...values)),
];
