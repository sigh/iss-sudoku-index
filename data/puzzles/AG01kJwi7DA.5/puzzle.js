// Title: Apr 7, 2022: Odd/Even Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=AG01kJwi7DA
// Source: https://tinyurl.com/k8uh2c6h

// Normal sudoku rules apply (standard box regions, implicit row/column/box
// all-different). Digits in grey circles must be odd; digits in grey
// squares must be even. There is no `Odd`/`Even` class, so each marked cell
// is encoded as a multi-value Given restricting it to the parity's digits.

// Odd cells (grey circles), transcribed from the payload's `odd` array.
const oddCells = [
  'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R3C8', 'R2C8', 'R2C7',
];

// Even cells (grey squares), transcribed from the payload's `even` array.
const evenCells = [
  'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R7C4', 'R6C4', 'R6C3',
];

const givens = [
  new Given('R1C2', 1), new Given('R1C3', 2), new Given('R1C9', 3),
  new Given('R2C2', 3), new Given('R2C3', 4),
  new Given('R4C3', 9), new Given('R4C4', 7),
  new Given('R5C1', 1), new Given('R5C2', 5), new Given('R5C5', 8),
  new Given('R5C8', 6), new Given('R5C9', 4),
  new Given('R6C6', 9), new Given('R6C7', 5),
  new Given('R8C7', 2), new Given('R8C8', 3),
  new Given('R9C1', 2), new Given('R9C7', 4), new Given('R9C8', 5),
];

const oddGivens = oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9));
const evenGivens = evenCells.map((cell) => new Given(cell, 2, 4, 6, 8));

return [
  new Shape('9x9'),
  ...givens,
  ...oddGivens,
  ...evenGivens,
];
