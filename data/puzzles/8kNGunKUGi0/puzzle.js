// Title: Encaged 9
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=8kNGunKUGi0
// Source: https://app.crackingthecryptic.com/sudoku/GnLJnPh9RJ

// Standard 9x9 sudoku (rows/columns/3x3 boxes).
// Cages: distinct digits summing to the printed total -> Cage.
// Arrows: arm cells sum to the circle digit (bulb cell listed first) -> Arrow.
// One given: R5C5 = 9.

// Cages (top-left cell, total, cells), from the payload's cage array.
const cages = [
  [16, 'R2C4', 'R2C5', 'R2C6'],
  [20, 'R3C6', 'R4C6', 'R4C7'],
  [10, 'R4C8', 'R5C8', 'R6C8'],
  [18, 'R6C7', 'R6C6', 'R7C6'],
  [14, 'R8C4', 'R8C5', 'R8C6'],
  [16, 'R7C4', 'R6C4', 'R6C3'],
  [10, 'R6C2', 'R5C2', 'R4C2'],
  [18, 'R4C3', 'R4C4', 'R3C4'],
];

// Arrows (bulb cell first, then arm cells), from the payload's arrow paths;
// bulb identified as the cell under each circle overlay, which matches the
// first cell of every decoded arrow path.
const arrows = [
  ['R2C1', 'R1C2', 'R2C3', 'R3C2'],
  ['R3C3', 'R4C4'],
  ['R9C2', 'R8C1', 'R7C2', 'R8C3'],
  ['R7C3', 'R6C4'],
  ['R7C7', 'R6C6'],
  ['R3C7', 'R4C6'],
  ['R1C8', 'R2C9', 'R3C8', 'R2C7'],
  ['R8C9', 'R9C8', 'R8C7', 'R7C8'],
];

return [
  new Shape('9x9'),

  new Given('R5C5', 9),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  ...arrows.map(([bulb, ...arm]) => new Arrow(bulb, ...arm)),
];
