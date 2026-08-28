// Title: Apr. 8, 2022: Secure Perimeter
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=wwwmflDjNxE
// Source: https://tinyurl.com/3ppuhk4p

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Eight
// outside clues give the sum of the digits along the diagonal they point
// into; digits may repeat on that diagonal since no other rule forbids it
// (Little Killer semantics). No other clue types appear in the payload.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside diagonal-sum clues (littlekillersum). Each entry's cell list in the
// payload runs from the on-grid cell nearest the badge to the far end of the
// diagonal; direction below is that same run expressed as (dRow, dCol) and
// matches the payload's own `direction` field (UL=-1,-1 UR=-1,+1 DR=+1,+1
// DL=+1,-1) for every clue, so no reading is in doubt.
const littleKillers = [
  LittleKiller.fromCells(6, graph.ray('R2C9', -1, -1), geometry),  // UL
  LittleKiller.fromCells(5, graph.ray('R9C8', -1, 1), geometry),   // UR
  LittleKiller.fromCells(6, graph.ray('R8C1', 1, 1), geometry),    // DR
  LittleKiller.fromCells(5, graph.ray('R1C2', 1, -1), geometry),   // DL
  LittleKiller.fromCells(15, graph.ray('R3C1', -1, 1), geometry),  // UR
  LittleKiller.fromCells(14, graph.ray('R1C7', 1, 1), geometry),   // DR
  LittleKiller.fromCells(15, graph.ray('R9C3', -1, -1), geometry), // UL
  LittleKiller.fromCells(14, graph.ray('R7C9', 1, -1), geometry),  // DL
];

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  ...littleKillers,

  new Given('R2C5', 5),
  new Given('R3C3', 1),
  new Given('R3C7', 2),
  new Given('R4C4', 8),
  new Given('R4C5', 2),
  new Given('R4C6', 5),
  new Given('R5C2', 8),
  new Given('R5C4', 1),
  new Given('R5C6', 3),
  new Given('R5C8', 6),
  new Given('R6C4', 7),
  new Given('R6C5', 4),
  new Given('R6C6', 6),
  new Given('R7C3', 4),
  new Given('R7C7', 3),
  new Given('R8C5', 7),
];
