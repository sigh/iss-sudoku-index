// Title: Small ... but Absolutely Beautiful
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=f072tEkYDXM
// Source: https://cracking-the-cryptic.web.app/sudoku/4BJQQgF82t

// Plain 6x6 classic sudoku. Standard row, column, and box (2x3) all-different
// constraints, plus the printed givens. No other rules or clues.

return [
  new Shape('6x6'),
  new Given('R1C4', 1),
  new Given('R2C3', 2),
  new Given('R2C6', 3),
  new Given('R3C1', 4),
  new Given('R3C4', 3),
  new Given('R4C3', 3),
  new Given('R4C6', 5),
  new Given('R5C1', 3),
  new Given('R5C4', 6),
  new Given('R6C3', 1),
];
