// Title: One Hundred Five
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=-UUbQOPadu4
// Source: https://app.crackingthecryptic.com/sudoku/Qb9r66GRLb

// Standard 6x6 sudoku: 1-6 in every row, column, and 2x3 box (the default
// box tiling for a plain 6x6 Shape). Digits cannot repeat along the two
// drawn diagonals (length 6 == the value range, so all-different is exact).
// Each digit outside the grid is the sum of the digits on the diagonal its
// arrow points along.

// Little Killer clues below are (entry cell, direction, sum): each arrow (a
// short off-grid stroke) is paired with the nearest text overlay by
// on-canvas distance (every arrow/overlay pair sits exactly 0.424 grid
// units apart, and no other overlay is nearly as close), and each resulting
// entry cell/direction is verified to walk a genuine border-to-border
// diagonal of the grid.
const littleKillers = [
  ['R6C2', -1, -1, 5],
  ['R6C4', -1, -1, 17],
  ['R4C6', -1, -1, 11],
  ['R4C1', -1, 1, 9],
  ['R1C5', 1, 1, 6],
  ['R3C6', 1, -1, 15],
  ['R4C6', 1, -1, 7],
];

const shape = new Shape('6x6');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

return [
  shape,
  // '/'-oriented diagonal R1C6-R2C5-R3C4-R4C3-R5C2-R6C1.
  new Diagonal(1),
  // '\'-oriented diagonal R1C1-R2C2-R3C3-R4C4-R5C5-R6C6.
  new Diagonal(-1),
  ...littleKillers.map(([cell, dRow, dCol, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(cell, dRow, dCol), geometry)),
];
