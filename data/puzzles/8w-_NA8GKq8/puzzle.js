// Title: Projectile Perturbation
// Author: DadJokes
// Video: https://www.youtube.com/watch?v=8w-_NA8GKq8
// Source: https://app.crackingthecryptic.com/sudoku/JJF89PJpgF

// Normal sudoku rules apply (default row/column/box all-different).
// Arrow: the circled cell (first argument) equals the sum of the arm cells;
// digits may repeat on an arm. Eight arrows, each drawn as a bent line from
// its circle through 2-4 arm cells.
// GlobalEntropy: every 2x2 box contains a low (1-3), a middle (4-6), and a
// high (7-9) digit -- native constraint, exact match for the 9x9 grid.

return [
  new Shape('9x9'),

  new Arrow('R1C2', 'R2C2', 'R2C3'),
  new Arrow('R3C7', 'R2C6', 'R2C5'),
  new Arrow('R4C9', 'R4C8', 'R3C8'),
  new Arrow('R5C2', 'R4C1', 'R3C1'),
  new Arrow('R6C3', 'R6C4', 'R5C4', 'R4C4', 'R4C3'),
  new Arrow('R7C7', 'R7C6', 'R6C6', 'R5C6', 'R5C7'),
  new Arrow('R7C5', 'R7C4', 'R8C3'),
  new Arrow('R9C8', 'R9C7', 'R9C6'),

  new GlobalEntropy(),
];
