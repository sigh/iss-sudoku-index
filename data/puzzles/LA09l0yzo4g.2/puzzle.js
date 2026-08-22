// Title: Oct 18, 2021: Summometers
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=LA09l0yzo4g
// Source: https://app.crackingthecryptic.com/sudoku/LqqPpGpbnJ

// Normal sudoku rules apply (default 9x9 rows/cols/boxes).
// Digits along arrows must sum to the circled total, and each arrow is also
// a thermometer: digits strictly increase from the tip to the circle.
// Each line's cell order below is tip-first, circle-last, established from
// the drawn grey tip markers (underlays) and red circle markers (overlays)
// plus each arrowhead's drawn direction (pointing at the tip), all agreeing
// on the same endpoint for every line.
// Thermo enforces the tip-to-circle increase; Arrow takes the circle first
// and the remaining tip-first cells as the arm, so the circle's digit equals
// the sum of the other cells on the same line.

const lines = [
  ['R1C7', 'R2C8', 'R3C9'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4'],
  ['R4C9', 'R4C8', 'R4C7', 'R4C6'],
  ['R9C6', 'R8C6', 'R7C6', 'R6C6'],
  ['R9C3', 'R8C2', 'R7C1'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4'],
  ['R5C4', 'R4C3', 'R3C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C7', 1),
  new Given('R2C6', 5),
  new Given('R3C1', 3),
  new Given('R3C5', 8),
  new Given('R4C2', 7),
  new Given('R5C3', 9),
  new Given('R5C7', 7),
  new Given('R6C8', 8),
  new Given('R7C5', 9),
  new Given('R7C9', 4),
  new Given('R8C4', 6),
  new Given('R9C3', 2),

  ...lines.map(cells => new Thermo(...cells)),
  ...lines.map(cells => new Arrow(cells[cells.length - 1], ...cells.slice(0, -1))),
];
