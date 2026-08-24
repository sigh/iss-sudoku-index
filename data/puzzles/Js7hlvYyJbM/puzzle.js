// Title: Self-Titled Sudoku
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=Js7hlvYyJbM
// Source: https://app.crackingthecryptic.com/sudoku/GQjmDB9rLj
//
// Standard sudoku (default 3x3 boxes, matching the payload's own regions).
// Both drawn diagonals are marked: 1-9 once each -> Diagonal(1), Diagonal(-1).
// Five killer cages: distinct digits summing to the printed corner clue.
// A sixth cage (R8C8, R9C9, box 9) has no printed corner clue; its total (10)
// comes from the separate "blue cells in box 9 sum to 10" sentence, so it is
// encoded as Sum, not Cage -- distinctness there is inert anyway since both
// cells already share box 9.
// The grey line is a palindrome (23 cells).
// The three grey-square cells must hold an even digit -> multi-value Given.
// The three outside badges are diagonal sum clues with repeats allowed ->
// native LittleKiller, built via LittleKiller.fromCells from each diagonal's
// ray so the corner/cell list is derived, not hand re-typed.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  [36, 'R3C3', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C7', 'R3C8'],
  [16, 'R4C8', 'R5C8', 'R6C8'],
  [44, 'R7C7', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C3', 'R7C2'],
  [13, 'R6C2', 'R5C2', 'R4C2', 'R3C2'],
  [31, 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R7C5', 'R7C6'],
];

const palindrome = [
  'R7C7', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C3', 'R7C2',
  'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4', 'R2C5',
  'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8',
];

return [
  new Shape('9x9'),

  new Diagonal(1),
  new Diagonal(-1),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new Sum(10, 'R8C8', 'R9C9'),

  new Palindrome(...palindrome),

  new Given('R7C8', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
  new Given('R9C9', 2, 4, 6, 8),

  LittleKiller.fromCells(16, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(38, graph.ray('R1C8', 1, -1), geometry),
  LittleKiller.fromCells(8, graph.ray('R3C9', -1, -1), geometry),
];
