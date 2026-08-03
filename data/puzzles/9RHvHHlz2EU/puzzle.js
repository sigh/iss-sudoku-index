// Title: Sum Foggy Quads
// Author: thoughtbyte
// Video: https://www.youtube.com/watch?v=9RHvHHlz2EU
// Source: https://app.crackingthecryptic.com/sudoku/dh722BmNdM
//
// Standard 9x9 sudoku, no givens. Fog is a solving-UI reveal aid (correct
// digits clear nearby fog) and is not a final-grid rule, so it is not
// encoded. Six blue region sum lines: equal sum within each box a line
// passes through, encoded directly by RegionSumLine per drawn segment (cell
// order matches the drawn waypoints). Seven quadruple clues: each lists four
// digits that must appear once among its surrounding 2x2 cells, encoded with
// Quad(topLeftCell, ...values); the clue's printed ascending digit order is
// a display convention only and carries no extra constraint.

const regionSumLines = [
  ['R2C2', 'R3C1', 'R4C2', 'R5C1'],
  ['R7C2', 'R8C3', 'R7C4', 'R8C4', 'R7C5'],
  ['R5C4', 'R6C4', 'R7C3', 'R8C2'],
  ['R2C4', 'R1C5', 'R2C6', 'R1C7', 'R2C7'],
  ['R2C8', 'R3C7', 'R4C6', 'R5C6'],
  ['R4C7', 'R5C8', 'R6C7', 'R7C8', 'R8C8'],
].map(cells => new RegionSumLine(...cells));

// Quadruple clue: [top-left cell of the 2x2 vertex, four required digits].
const quads = [
  ['R1C1', 1, 2, 3, 4],
  ['R8C8', 1, 2, 3, 4],
  ['R5C4', 1, 3, 5, 8],
  ['R4C5', 2, 5, 7, 9],
  ['R8C1', 1, 2, 3, 7],
  ['R1C8', 1, 2, 3, 7],
  ['R8C7', 2, 3, 5, 8],
].map(([topLeft, ...values]) => new Quad(topLeft, ...values));

return [
  new Shape('9x9'),
  ...regionSumLines,
  ...quads,
];
