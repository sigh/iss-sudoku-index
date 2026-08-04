// Title: Parity Renban
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=N44yytFt9N4
// Source: https://app.crackingthecryptic.com/sudoku/pfPjfrfPLG

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9'); the payload's 9 regions are the standard 3x3 boxes).
//
// One black dot: "one of the digits is double the other" -> BlackDot
// (Kropki black dot, ratio-of-2, direction-agnostic).
//
// Ten purple lines: "a set of non-repeating consecutive digits" -> Renban
// (set-based, order-independent). "Adjacent digits on these lines must have
// different parity" -> Modular(2, ...) in the line's drawn walk order (every
// consecutive pair must contain one odd and one even value).

// Cell lists for the 10 drawn purple lines, in their drawn order.
const lineCells = [
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R6C5'],
  ['R9C2', 'R8C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C8', 'R5C8', 'R4C8'],
  ['R6C9', 'R5C9', 'R4C9', 'R3C8', 'R2C9'],
  ['R4C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R4C4', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R1C3', 'R2C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C2', 'R2C3', 'R3C4', 'R3C5', 'R2C6'],
  ['R5C3', 'R6C3', 'R7C2', 'R6C1', 'R6C2', 'R5C1', 'R4C2', 'R3C2'],
  ['R9C7', 'R9C8', 'R8C8', 'R7C9'],
];

const renbans = lineCells.map((cells) => new Renban(...cells));
const parities = lineCells.map((cells) => new Modular(2, ...cells));

// The one drawn black-dot overlay sits on the shared edge of R4C1 and R4C2.
const blackDots = [new BlackDot('R4C1', 'R4C2')];

return [
  new Shape('9x9'),
  ...renbans,
  ...parities,
  ...blackDots,
];
