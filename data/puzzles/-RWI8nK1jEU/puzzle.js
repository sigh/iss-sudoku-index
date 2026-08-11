// Title: Time Constraints
// Author: Sundance
// Video: https://www.youtube.com/watch?v=-RWI8nK1jEU
// Source: https://app.crackingthecryptic.com/sudoku/mJ292rr7ht

// Normal sudoku rules (default 9x9 with default 3x3 boxes; no repeats in a
// row, column, or box). Cages show their sums (a killer cage: distinct
// digits, sum to the total). A black dot sits on the edge between two
// horizontally-adjacent cells; the digit to its left, followed by the two
// digits to its right, read as H:MM (dot = ':') and must form a valid
// electric-clock time. The single hour digit is unrestricted -- any grid
// digit 1-9 is a valid leading hour digit under either a 12h or 24h
// convention. A valid MM requires the tens-of-minutes digit in 0-5; since
// grid digits are 1-9 (no 0), that cell is restricted to 1-5. The units
// digit of minutes is unrestricted (any of 0-9 is a valid minutes-units
// digit, so every grid digit 1-9 already qualifies).

const givens = [
  ['R1C1', 1], ['R2C2', 9], ['R2C5', 6], ['R2C8', 3], ['R3C1', 4],
  ['R5C2', 8], ['R5C5', 5], ['R5C8', 2], ['R7C4', 1], ['R8C2', 7],
  ['R8C5', 4], ['R8C8', 1], ['R9C9', 5],
];

// Cage cells and totals, transcribed from the drawn `cages` array.
const cages = [
  [12, 'R1C2', 'R1C3', 'R2C3'],
  [12, 'R1C5', 'R1C6'],
  [12, 'R1C9', 'R2C9', 'R3C9'],
  [12, 'R4C8', 'R5C8', 'R5C7'],
  [12, 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  [12, 'R6C3', 'R5C3', 'R6C2'],
  [12, 'R7C2', 'R8C2', 'R8C3'],
  [12, 'R8C4', 'R8C5', 'R9C5'],
  [12, 'R8C8', 'R9C8', 'R9C7'],
];

// Black time-dots, transcribed from the drawn `overlays` edge marks. Each
// entry is [hour cell, minutes-tens cell, minutes-units cell]: the hour cell
// is the one immediately left of the dot's edge; the two minutes cells
// continue rightward from there, per the rules' "left of the dot" / "two to
// the right of the dot" wording.
const dots = [
  ['R1C2', 'R1C3', 'R1C4'],
  ['R2C3', 'R2C4', 'R2C5'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R4C6', 'R4C7', 'R4C8'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C1', 'R9C2', 'R9C3'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C4', 'R5C5', 'R5C6'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  // Restrict each dot's minutes-tens cell to 1-5 (0 is not a grid digit).
  ...dots.map(([, minutesTens]) => new Given(minutesTens, 1, 2, 3, 4, 5)),
];
