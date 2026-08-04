// Title: For Granted
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=gkwd_Hr3uvc
// Source: https://tinyurl.com/2894ke9t

// Normal sudoku rules apply (rows, columns, and boxes all-different --
// standard for a plain 9x9 Shape). Little Killer: each off-grid diagonal
// badge sums the digits along the indicated diagonal (LittleKiller's default
// semantics -- values may repeat; the rules state no distinctness).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Little killer diagonals: (entry cell, dRow, dCol, sum), each entry cell and
// direction taken from the littlekillersum payload's own (cell, direction)
// pair, walked out to the far border with graph.ray -- which reproduces the
// payload's own ordered `cells` list for every one of these entries. Eight
// run edge-to-edge; the last is the full corner-to-corner main diagonal.
const littleKillers = [
  ['R7C9', 1, -1, 18],
  ['R9C3', -1, -1, 18],
  ['R1C7', 1, 1, 12],
  ['R3C1', -1, 1, 12],
  ['R4C1', -1, 1, 16],
  ['R6C9', 1, -1, 24],
  ['R1C6', 1, 1, 17],
  ['R9C4', -1, -1, 19],
  ['R1C1', 1, 1, 32],
];

return [
  new Shape('9x9'),

  // Givens (payload `grid` cells with a value).
  new Given('R2C2', 7),
  new Given('R2C3', 8),
  new Given('R2C7', 4),
  new Given('R2C8', 6),
  new Given('R3C2', 4),
  new Given('R3C8', 7),
  new Given('R4C5', 6),
  new Given('R5C4', 8),
  new Given('R5C6', 3),
  new Given('R6C5', 9),
  new Given('R7C2', 1),
  new Given('R7C8', 3),
  new Given('R8C2', 3),
  new Given('R8C3', 6),
  new Given('R8C7', 5),
  new Given('R8C8', 4),

  ...littleKillers.map(([cell, dRow, dCol, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(cell, dRow, dCol), geometry)),
];
