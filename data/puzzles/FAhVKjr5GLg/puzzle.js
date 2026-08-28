// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FAhVKjr5GLg
// Source: https://cracking-the-cryptic.web.app/sudoku/9nm7dnqJr2

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Both marked long diagonals must contain the digits 1-9 (Diagonal(1) is the
// anti-diagonal R9C1-R1C9, Diagonal(-1) is the main diagonal R1C1-R9C9 --
// drawn as the two deepskyblue lines).
// Ten short diagonals, each parallel to one of the two long diagonals, carry
// an outside sum clue (arrow + adjacent number in the payload, paired by
// proximity): digits may repeat along these, encoded with LittleKiller.
// Cell paths transcribed from the payload's arrow waypoints (down-left/
// down-right/up-right/up-left rays from the noted start cell to the grid
// edge); each ray reproduced with graph.ray to avoid hand-duplicating it.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const littleKillers = [
  [17, 'R1C3', 1, -1],
  [20, 'R1C4', 1, -1],
  [32, 'R6C1', 1, 1],
  [16, 'R7C1', 1, 1],
  [10, 'R8C1', 1, 1],
  [21, 'R9C7', -1, 1],
  [28, 'R9C6', -1, 1],
  [11, 'R2C9', -1, -1],
  [17, 'R3C9', -1, -1],
  [30, 'R4C9', -1, -1],
].map(([total, start, dr, dc]) =>
  LittleKiller.fromCells(total, graph.ray(start, dr, dc), geometry));

return [
  new Diagonal(1),
  new Diagonal(-1),

  ...littleKillers,
];
