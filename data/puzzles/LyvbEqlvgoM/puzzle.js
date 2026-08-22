// Title: Sudoku Bowl
// Author: apetersen
// Video: https://www.youtube.com/watch?v=LyvbEqlvgoM
// Source: https://app.crackingthecryptic.com/sudoku/rqGH96246T

// Normal sudoku (standard 3x3 boxes, no givens). Each arrow's arm digits sum
// to the digit in its bulb circle. Row 1 alternates a grey-circle cell (odd
// digit) with a grey-square cell (even digit). The X mark on the R2C1/R3C1
// border means those two cells sum to 10.

const arrows = [
  ['R8C1', 'R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C3'],
  ['R7C4', 'R6C3'],
  ['R7C6', 'R6C5'],
  ['R7C5', 'R8C4', 'R7C3'],
  ['R8C5', 'R9C4', 'R9C3', 'R8C2'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C8'],
  ['R7C8', 'R6C7', 'R5C6', 'R4C6', 'R3C7'],
  ['R7C9', 'R6C9', 'R5C8', 'R5C7'],
].map((cells) => new Arrow(...cells));

// Row 1 endzone parity: grey circles (odd) at the odd columns, grey squares
// (even) at the even columns -- from the underlay colours/shapes.
const oddCells = ['R1C1', 'R1C3', 'R1C5', 'R1C7', 'R1C9'];
const evenCells = ['R1C2', 'R1C4', 'R1C6', 'R1C8'];
const parity = [
  ...oddCells.map((c) => new Given(c, 1, 3, 5, 7, 9)),
  ...evenCells.map((c) => new Given(c, 2, 4, 6, 8)),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...parity,
  // Penalty-flag X mark on the R2C1/R3C1 border: the two digits sum to 10.
  new X('R2C1', 'R3C1'),
];
