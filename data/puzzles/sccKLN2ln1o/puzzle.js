// Title: Aad's Roaring Four 'T's Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=sccKLN2ln1o
// Source: https://cracking-the-cryptic.web.app/sudoku/Qjn22369th
//
// Normal sudoku rules apply: rows, columns and the standard 3x3 boxes -- the
// payload's own regions are exactly the nine boxes, so no Jigsaw is needed.
//
// Twenty cells are drawn shaded light grey in four five-cell T-pentomino
// groups: R2C2-R2C4 with a stem down R3C3-R4C3; R2C8-R4C8 with a stem left
// R3C7-R3C6; R8C6-R8C8 with a stem up R7C7-R6C7; and R6C2-R8C2 with a stem
// right R7C3-R7C4. The puzzle carries no rules text at all, so what the
// shading requires of those digits is unknown; the T rule is omitted here and
// only the givens and the standard Sudoku rules are encoded.
//
// Givens transcribed from the grid's filled cells.

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
