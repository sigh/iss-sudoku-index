// Title: Quorum Rings
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=XVLO5AXcnq8
// Source: https://app.crackingthecryptic.com/sudoku/H8JHPgbjtj

// Normal sudoku (rows/cols/boxes) plus: both main diagonals forbid repeats
// (Diagonal); each cage sums to its top-left total with no repeat within the
// cage (Cage); and an outside badge gives the sum of the digits on a broken
// (non-corner) down-right diagonal, where digits may repeat (LittleKiller).
// That diagonal's cells are the ISS canonical LittleKiller ray from R1C4
// travelling (row+1, col+1) until it runs off the grid at R6C9 -- the
// direction and start cell the drawn arrow fixes.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Diagonal(-1), // main diagonal R1C1-R9C9, no repeats
  new Diagonal(1),  // anti-diagonal R1C9-R9C1, no repeats

  // Cages: top-left total, no repeat within cage.
  new Cage(10, 'R3C3', 'R4C3', 'R3C4', 'R3C5'),
  new Cage(11, 'R3C6', 'R3C7', 'R4C7', 'R5C7'),
  new Cage(22, 'R6C7', 'R7C7', 'R7C6', 'R7C5'),
  new Cage(11, 'R5C3', 'R6C3', 'R7C3', 'R7C4'),
  new Cage(12, 'R4C2', 'R5C2', 'R6C2'),
  new Cage(22, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(12, 'R4C8', 'R5C8', 'R6C8'),
  new Cage(11, 'R8C4', 'R8C5', 'R8C6'),

  // Outside "29" badge, drawn above the top edge near C4 with an arrow
  // pointing down-right into the grid: sum of the broken diagonal
  // R1C4-R2C5-R3C6-R4C7-R5C8-R6C9. Repeats allowed on this diagonal.
  LittleKiller.fromCells(29, graph.ray('R1C4', 1, 1), geometry),
];
