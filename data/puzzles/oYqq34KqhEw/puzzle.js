// Title: Boomerang
// Author: Aad van der Wetering
// Video: https://www.youtube.com/watch?v=oYqq34KqhEw
// Source: https://app.crackingthecryptic.com/sudoku/48m3j7PRtj

// Normal sudoku on the default 3x3 boxes. Three arrows: each has a circular
// bulb cell and a bent 3-cell shaft (Arrow's first argument is the bulb,
// the rest are the arm, per catalog convention); the shaft digits sum to the
// bulb digit. Anti-knight: cells a knight's move apart cannot repeat a digit
// (global, over the whole grid).

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R9C6', 7),

  new Arrow('R4C6', 'R3C5', 'R2C4', 'R1C5'),
  new Arrow('R4C4', 'R5C3', 'R6C2', 'R5C1'),
  new Arrow('R6C6', 'R5C7', 'R4C8', 'R5C9'),

  new AntiKnight(),
];
