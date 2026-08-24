// Title: Circle Inversion
// Author: Ri Sa
// Video: https://www.youtube.com/watch?v=_NUlaltMzYY
// Source: https://app.crackingthecryptic.com/sudoku/pNPn62jbDR

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). In cages, digits sum to the
// small clue in the cage's top-left corner and cannot repeat within the
// cage. Two cages carry no shown total (still real cages: digits distinct).
// One outside clue gives the sum of digits along its indicated diagonal;
// digits may repeat along that diagonal.

const geometry = cellGeometry(9);

// Killer cages with a shown total. Transcribed from the payload's `cages`
// array (cell lists + totals); each also forbids repeats per the rules.
const cages = [
  [18, ['R1C6', 'R2C6', 'R3C6']],
  [8, ['R2C7', 'R3C7', 'R3C8']],
  [19, ['R2C9', 'R3C9', 'R4C8', 'R4C9']],
  [13, ['R4C7', 'R4C6']],
  [13, ['R5C3', 'R6C3', 'R6C2', 'R6C4']],
  [13, ['R5C4', 'R5C5', 'R6C5']],
  [21, ['R7C5', 'R7C4', 'R7C3', 'R8C4']],
  [24, ['R8C5', 'R9C5', 'R9C4', 'R9C3']],
  [8, ['R7C2', 'R8C2', 'R8C3']],
  [19, ['R8C1', 'R9C1', 'R9C2']],
].map(([total, cells]) => new Cage(total, ...cells));

// Two cages in the payload carry an empty `value` (no printed total). They
// are still real cages: digits inside must not repeat.
const totallessCages = [
  ['R1C7', 'R1C8', 'R1C9', 'R2C8'],
  ['R7C1', 'R6C1', 'R5C1', 'R5C2'],
].map(cells => new AllDifferent(...cells));

// Outside diagonal-sum clue. The arrow's drawn shaft is a 45-degree ray
// entering the grid at R8C9 (row-col invariant -1, distinct from the true
// corner-to-corner diagonal's invariant 0) and running up-left to R1C2.
// cellGraph(...).ray walks that direction to the grid edge; fromCells then
// derives the canonical corner from the resulting cell list.
const littleKiller = LittleKiller.fromCells(
  14,
  cellGraph('9x9').ray('R8C9', -1, -1),
  geometry);

return [
  new Shape('9x9'),
  ...cages,
  ...totallessCages,
  littleKiller,
];
