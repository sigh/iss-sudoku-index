// Title: Scarecrow
// Author: NXTMaster
// Video: https://www.youtube.com/watch?v=A-agM23Njqk
// Source: https://app.crackingthecryptic.com/sudoku/Rr7p8BNH7R
//
// Normal sudoku rules apply. Three coloured extra regions (drawn as
// underlays, not cages) each contain the digits 1-9: AllDifferent per
// region. "Each digit occupies each possible position in a 3x3 box once"
// means no digit may repeat at the same relative position across the nine
// boxes -- exactly DisjointSets' documented semantics ("No digit may appear
// in the same position in any two boxes"), since the box rule already makes
// every box a permutation of 1-9, so "digit d's box-positions form a
// permutation of the 9 positions" and "position p's box-digits form a
// permutation of the 9 digits" are the same statement.

return [
  new Shape('9x9'),

  new Given('R2C1', 8),
  new Given('R2C7', 7),
  new Given('R3C2', 1),
  new Given('R5C5', 5),
  new Given('R6C3', 3),
  new Given('R6C6', 1),
  new Given('R6C9', 2),
  new Given('R8C8', 9),
  new Given('R9C3', 5),
  new Given('R9C9', 4),

  new DisjointSets(),

  // Coloured extra regions (drawn as coloured underlay cells), each 1-9.
  new AllDifferent('R2C1', 'R2C2', 'R2C3', 'R3C3', 'R4C3', 'R4C2', 'R5C2', 'R6C2', 'R7C3'),
  new AllDifferent('R2C4', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R4C5', 'R5C5', 'R6C5', 'R7C6'),
  new AllDifferent('R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R6C8', 'R7C9'),
];
