// Title: Sweet Seventeen
// Author: Ryzen
// Video: https://www.youtube.com/watch?v=-vLBf2Mbf9U
// Source: https://tinyurl.com/5h4yr2nx

// Normal sudoku rules apply. Digits cannot repeat on the marked diagonal
// (the main diagonal, R1C1-R9C9). Cages sum to the printed total and forbid
// repeats within the cage. Little Killer clues give the sum along the
// indicated diagonal; digits may repeat there unless the main-diagonal rule
// also applies to those cells. Black dots are 1:2 ratio, white dots are
// consecutive; not all dots are drawn, so only the drawn pairs are
// constrained (no negative/exhaustive inference).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  new Diagonal(-1),

  // Killer cages: cells and totals from the drawn `killercage` array.
  new Cage(17, 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R4C2'),
  new Cage(17, 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'),
  new Cage(17, 'R6C8', 'R7C7', 'R7C8', 'R8C6', 'R8C7'),
  new Cage(17, 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
  new Cage(17, 'R4C6', 'R5C5', 'R5C6', 'R6C4', 'R6C5'),
  new Cage(17, 'R2C1', 'R3C1'),
  new Cage(17, 'R1C5', 'R1C6'),
  new Cage(17, 'R7C9', 'R8C9'),
  new Cage(17, 'R9C4', 'R9C5'),

  // Little Killer diagonal sums, from the drawn `littlekillersum` array.
  LittleKiller.fromCells(17, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R7C9', 1, -1), geometry),

  // Black dots (1:2 ratio), from the drawn `ratio` array (default value).
  new BlackDot('R3C2', 'R4C2'),
  new BlackDot('R7C1', 'R8C1'),
  new BlackDot('R9C1', 'R9C2'),
  new BlackDot('R6C8', 'R7C8'),
  new BlackDot('R5C5', 'R6C5'),

  // White dot (consecutive), from the drawn `difference` array (default value).
  new WhiteDot('R4C5', 'R4C6'),
];
