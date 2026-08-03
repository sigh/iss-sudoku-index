// Title: Qu'est-ce, que c'est?
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=fW1l8RKcrmM
// Source: https://tinyurl.com/2zys385y

// Normal sudoku rules apply (rows, columns, and boxes all-different --
// standard for a plain 9x9 Shape). Little Killer: each off-grid diagonal
// badge sums the digits along the indicated diagonal (LittleKiller's default
// semantics -- values may repeat; the rules state no distinctness).
//
// Four of the sixteen littlekillersum entries are single-cell diagonals
// (the ones anchored exactly at a grid corner: R1C1, R1C9, R9C9, R9C1) --
// for a length-1 diagonal the "sum" is just that cell's own value, so each
// is encoded as a Given rather than a LittleKiller (ISS's LittleKiller
// clue map only covers diagonals of length >= 2; a length-1 diagonal has no
// direction to disambiguate either).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Length >= 2 little killer diagonals: (entry cell, dRow, dCol, sum), each
// entry cell and direction taken from the littlekillersum payload's own
// (cell, direction) pair, walked out to the far border with graph.ray --
// which reproduces the payload's own ordered `cells` list for every one of
// these entries.
const littleKillers = [
  ['R2C1', -1, 1, 5],
  ['R3C1', -1, 1, 15],
  ['R4C1', -1, 1, 32],
  ['R1C8', 1, 1, 5],
  ['R1C7', 1, 1, 24],
  ['R1C6', 1, 1, 16],
  ['R8C9', 1, -1, 15],
  ['R7C9', 1, -1, 15],
  ['R6C9', 1, -1, 14],
  ['R9C2', -1, -1, 15],
  ['R9C3', -1, -1, 6],
  ['R9C4', -1, -1, 17],
];

return [
  new Shape('9x9'),

  // Givens (payload `grid` cells with a value).
  new Given('R1C5', 7),
  new Given('R4C4', 2),
  new Given('R5C1', 6),
  new Given('R5C5', 9),
  new Given('R5C9', 4),
  new Given('R6C6', 8),
  new Given('R9C5', 5),

  // Corner-anchored length-1 littlekillersum clues, encoded as Givens (see
  // note above): R1C1 sum=1, R1C9 sum=2, R9C9 sum=9, R9C1 sum=8.
  new Given('R1C1', 1),
  new Given('R1C9', 2),
  new Given('R9C9', 9),
  new Given('R9C1', 8),

  ...littleKillers.map(([cell, dRow, dCol, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(cell, dRow, dCol), geometry)),
];
