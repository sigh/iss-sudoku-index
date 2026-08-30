// Title: Valentine's Day Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Lykt7NyMC4c
// Source: https://cracking-the-cryptic.web.app/sudoku/323th6tLDF

// Normal sudoku rules apply (standard 3x3 boxes). The payload carries no
// rules text at all -- ten givens and one no-total cage (R6C4-R6C6,
// standard killer convention: all-different only, no sum) are the only
// clue geometry drawn. A 36-cell two-colour underlay also traces a heart
// silhouette across the grid; no rules text or legend gives either colour
// digit semantics, so it is decoration only and is omitted.

const givens = [
  new Given('R2C1', 1),
  new Given('R5C4', 6),
  new Given('R5C6', 4),
  new Given('R7C2', 9),
  new Given('R8C7', 4),
  new Given('R8C9', 7),
  new Given('R9C3', 3),
  new Given('R9C4', 9),
  new Given('R9C6', 8),
  new Given('R9C7', 6),
];

const cage = new Cage(0, 'R6C4', 'R6C5', 'R6C6');

return [
  new Shape('9x9'),
  ...givens,
  cage,
];
