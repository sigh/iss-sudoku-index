// Title: A Sudoku Of The Highest Quali-T
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=YE8CvrCqPKs
// Source: https://cracking-the-cryptic.web.app/sudoku/m3mg9FJm8B
//
// Normal sudoku rules apply (standard 3x3 boxes -- the payload's own regions
// are exactly the nine boxes, so no Jigsaw is needed).
//
// Ten cells are drawn shaded light grey, in two five-cell T-pentomino
// groups (a three-cell bar plus a three-cell stem meeting at the bar's
// middle cell). The archived payload carries no rules text at all, so what
// the shading requires of the digits is unknown and omitted here -- only
// the givens and standard Sudoku rules are encoded.

return [
  new Shape('9x9'),

  new Given('R1C6', 5),
  new Given('R1C8', 9),
  new Given('R1C9', 3),
  new Given('R2C2', 8),
  new Given('R2C8', 6),
  new Given('R3C6', 1),
  new Given('R3C9', 5),
  new Given('R5C7', 6),
  new Given('R5C9', 1),
  new Given('R6C5', 2),
  new Given('R6C9', 9),
  new Given('R8C1', 4),
  new Given('R8C2', 3),
  new Given('R8C9', 2),
];
