// Title: Endeavour
// Author: BremSter
// Video: https://www.youtube.com/watch?v=4wTcQB8Oopw
// Source: https://sudokupad.app/endeavor-bremster

// Normal sudoku (default row/column/box all-different from Shape('9x9')).
// Cages: digits sum to the printed total, if any, and never repeat within a
// cage; a cage with no printed total is all-different only.
// Quadruple circles: each listed digit must appear at least once in the
// touching 2x2; a drawn '?' is an unconstrained slot, not a required digit,
// so it contributes no value to the Quad call below.
// Fog is a solving aid (progressively reveals the grid) with no final-grid
// rule, and is not encoded.

// Cages, from the drawn cage geometry: [sum or null, ...cells].
const cages = [
  [null, 'R1C5', 'R2C5', 'R3C4', 'R3C5', 'R4C4', 'R5C4', 'R6C4'],
  [19, 'R2C1', 'R2C2', 'R3C1', 'R4C1'],
  [7, 'R7C7', 'R7C8'],
  [9, 'R8C8', 'R9C8', 'R9C9'],
  [9, 'R8C6', 'R9C6', 'R9C7'],
  [21, 'R5C5', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'],
  [17, 'R4C7', 'R4C8', 'R5C7'],
  [21, 'R2C8', 'R3C8', 'R3C9', 'R4C9'],
  [37, 'R1C6', 'R1C7', 'R2C7', 'R3C6', 'R3C7', 'R4C6', 'R5C6'],
  [15, 'R6C2', 'R7C1', 'R7C2'],
];
const cageRules = cages.map(([sum, ...cells]) =>
  sum === null ? new AllDifferent(...cells) : new Cage(sum, ...cells));

// Quadruple circles, named by the top-left cell of the touching 2x2, with the
// required digits read off the drawn text (wildcard '?' slots dropped).
const quads = [
  ['R7C6', [2, 3]],
  ['R6C5', [3]],
  ['R5C7', [5, 6, 7]],
  ['R3C8', [7, 3]],
  ['R7C3', [7, 3]],
  ['R7C8', [1, 2]],
  ['R4C1', [6, 8]],
  ['R2C4', [6, 9]],
];
const quadRules = quads.map(([topLeft, values]) => new Quad(topLeft, ...values));

return [
  new Shape('9x9'),
  ...cageRules,
  ...quadRules,
];
