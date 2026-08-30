// Title: Roaring Four T's
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=sccKLN2ln1o
// Source: https://cracking-the-cryptic.web.app/sudoku/Qjn22369th
//
// Normal sudoku rules apply (standard 3x3 boxes -- the payload's own regions
// are exactly the nine boxes, so no Jigsaw is needed).
//
// Twenty cells are drawn shaded light grey, in four five-cell T-pentomino
// groups (a three-cell bar plus a three-cell stem meeting at the bar's
// middle cell). The archived payload carries no rules text at all, so what
// the shading requires of the digits is unknown and omitted here -- only
// the givens and standard Sudoku rules are encoded.

return [
  new Shape('9x9'),

  new Given('R2C1', 2),
  new Given('R2C8', 6),
  new Given('R2C9', 8),
  new Given('R4C2', 5),
  new Given('R5C9', 1),
  new Given('R6C3', 7),
  new Given('R7C4', 3),
  new Given('R7C5', 8),
];
