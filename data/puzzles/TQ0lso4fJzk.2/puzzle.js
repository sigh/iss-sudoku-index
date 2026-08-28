// Title: Tatooine Sunrise
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=TQ0lso4fJzk
// Source: https://cracking-the-cryptic.web.app/sudoku/Rmrqr7Dt84

// Normal sudoku rules apply (rows, columns, and boxes all-different --
// standard for a plain 9x9 Shape). No other rules or clues are drawn.

return [
  new Shape('9x9'),

  // Givens (from the payload's `cells` values; standard 3x3 box regions).
  new Given('R2C1', 1),
  new Given('R2C6', 2),
  new Given('R2C7', 3),
  new Given('R3C2', 4),
  new Given('R3C5', 5),
  new Given('R3C8', 6),
  new Given('R4C2', 6),
  new Given('R4C5', 7),
  new Given('R4C8', 1),
  new Given('R5C1', 2),
  new Given('R5C6', 3),
  new Given('R5C7', 8),
  new Given('R6C9', 7),
  new Given('R7C3', 9),
  new Given('R7C4', 5),
  new Given('R8C2', 5),
  new Given('R8C5', 6),
  new Given('R8C8', 7),
  new Given('R9C1', 3),
  new Given('R9C6', 8),
  new Given('R9C7', 2),
];
