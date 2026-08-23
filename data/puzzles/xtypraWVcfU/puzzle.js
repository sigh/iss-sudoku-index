// Title: The Spectre
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=xtypraWVcfU
// Source: https://app.crackingthecryptic.com/sudoku/8r6FPhhLbd
//
// Normal sudoku rules apply. A clue outside the grid shows the sum of the
// digits along the indicated diagonal (LittleKiller; digits may repeat since
// no diagonal coincides with a row/column/box). Grey circles are odd numbers
// (multi-value Given). The grey line is a palindrome, reading the same from
// both directions (Palindrome).
//
// Each LittleKiller starts at the on-grid cell the drawn arrowhead points at
// and rays away from it; the direction is unambiguous from the arrow's
// off-grid position, so no orientation choice was made.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  LittleKiller.fromCells(11, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(7, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(8, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(7, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(39, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(32, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(48, graph.ray('R2C1', 1, 1), geometry),
  LittleKiller.fromCells(34, graph.ray('R1C4', 1, -1), geometry),

  // Odd-digit circles (solid grey fill, underlays -- not arrow bulbs).
  new Given('R3C4', 1, 3, 5, 7, 9),
  new Given('R3C6', 1, 3, 5, 7, 9),

  new Palindrome(
    'R8C7', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C7', 'R1C6', 'R1C5',
    'R1C4', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C3', 'R7C4',
    'R8C5', 'R7C6'),
];
