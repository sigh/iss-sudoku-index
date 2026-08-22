// Title: Four Lockout Lines
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=YXQXQB4gdLc
// Source: https://app.crackingthecryptic.com/sudoku/FLqFBMpTJB

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Thermo: increasing from the bulb. Arrow: arm digits sum to
// the bulb digit. The outside "42" clue sums the full indicated diagonal,
// repeats allowed there. The blue main diagonal is additionally no-repeat.
// Each purple line is a Lockout line: diamond endpoints differ by >= 4, and
// every other digit on the line lies strictly outside the endpoints' range.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside diagonal-sum badge sits near R9C1 with its arrowhead drawn
// pointing up-right into the grid, so the ray runs from R9C1 to R1C9.
// LittleKiller's canonical start cell for that same diagonal is the other
// end, R1C9, walking down-left -- fromCells derives it from the ray.
const outsideDiagonalSum = LittleKiller.fromCells(
  42, graph.ray('R9C1', -1, 1), geometry);

// Sum arrow, bulb R5C5, bent shaft through R5C4, R4C5, R5C6.
const sumArrow = new Arrow('R5C5', 'R5C4', 'R4C5', 'R5C6');

// Thermometers, bulb cell first. Transcribed from the grey circle-marked
// thermometer lines.
const thermos = [
  ['R2C3', 'R3C3', 'R2C2', 'R3C2'],
  ['R3C8', 'R3C7', 'R2C8', 'R2C7'],
  ['R5C3', 'R5C2'],
  ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ['R7C8', 'R8C8', 'R7C7', 'R8C7'],
].map(cells => new Thermo(...cells));

// Lockout lines, diamond-marked endpoints first and last. Transcribed from
// the purple lines and their diamond endpoint glyphs.
const lockoutLines = [
  ['R1C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9', 'R4C9'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R9C6'],
  ['R9C4', 'R9C3', 'R9C2', 'R8C1', 'R7C1', 'R6C1'],
].map(cells => new Lockout(4, ...cells));

return [
  new Shape('9x9'),

  // direction -1 selects the r=c diagonal (R1C1..R9C9), matching the drawn
  // blue line; direction 1 would be the anti-diagonal (sudoku_builder.js).
  new Diagonal(-1),

  outsideDiagonalSum,
  sumArrow,
  ...thermos,
  ...lockoutLines,
];
