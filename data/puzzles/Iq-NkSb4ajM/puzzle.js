// Title: Disjoint Killer Sudoku
// Author: Jon Landers
// Video: https://www.youtube.com/watch?v=Iq-NkSb4ajM
// Source: https://app.crackingthecryptic.com/sudoku/6fGBF3dt8D

// Normal sudoku rules apply (standard 3x3 boxes; default row/column/box
// all-different -- the payload's `regions` are exactly the nine ordinary
// boxes, so no Jigsaw is needed).
//
// "Each digit must occupy each possible position in a 3x3 box" is ISS's
// DisjointSets rule: no digit repeats in the same within-box position across
// the nine boxes.
//
// "Cages show their sums" -> a Cage per drawn cage (killer convention:
// distinct digits summing to the printed total).
//
// "X joins two cells that sum to 10. Not all possible X's are given" -> an
// X() constraint per drawn marker (adjacent-pair sum-to-10). Because the
// rule says explicitly that not all X's are drawn, unmarked adjacent pairs
// carry no constraint -- no StrictXV.

return [
  new Shape('9x9'),

  new Given('R2C2', 1),
  new Given('R2C5', 2),
  new Given('R2C8', 3),
  new Given('R5C2', 4),
  new Given('R5C5', 5),
  new Given('R5C8', 6),
  new Given('R8C2', 7),
  new Given('R8C5', 8),
  new Given('R8C8', 9),

  new DisjointSets(),

  // Cages, from `cages` (cells, total).
  new Cage(9, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(27, 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Cage(13, 'R8C1', 'R8C2', 'R8C3'),
  new Cage(27, 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
  new Cage(24, 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Cage(14, 'R2C7', 'R2C8', 'R2C9'),
  new Cage(21, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Cage(18, 'R7C8', 'R8C8', 'R9C8'),

  // X markers, from `overlays` (adjacent cell pairs summing to 10).
  new X('R6C2', 'R7C2'),
  new X('R5C4', 'R6C4'),
  new X('R4C4', 'R4C5'),
  new X('R4C6', 'R5C6'),
  new X('R6C5', 'R6C6'),
  new X('R6C5', 'R7C5'),
  new X('R2C6', 'R2C7'),
  new X('R6C8', 'R7C8'),
  new X('R8C6', 'R8C7'),
];
