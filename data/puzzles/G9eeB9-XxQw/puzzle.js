// Title: Hiding in Plain Sight
// Author: DiMono
// Video: https://www.youtube.com/watch?v=G9eeB9-XxQw
// Source: https://app.crackingthecryptic.com/webapp/9G8mNR8Rj3

// Standard sudoku (rows, columns, 3x3 boxes -- the payload's `regions` are the
// default boxes) plus:
// - AntiKnight: no repeated digit a knight's move apart.
// - Cage: killer cages, distinct digits summing to the printed total.
// - LittleKiller: four outside diagonal sum clues, digits may repeat along the
//   diagonal. Each outside position has two candidate diagonals (short, toward
//   the near corner, vs long, across the grid). The small arrow drawn beside
//   each badge points along the long one in all four cases, so each clue below
//   is built from that drawn ray rather than the badge's raw position.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new AntiKnight(),

  new Cage(20, 'R2C3', 'R2C4', 'R3C3'),
  new Cage(20, 'R2C6', 'R2C7', 'R3C7'),
  new Cage(6, 'R5C4', 'R5C5', 'R5C6'),
  new Cage(12, 'R6C3', 'R7C3', 'R7C4'),
  new Cage(17, 'R6C7', 'R7C6', 'R7C7'),
  new Cage(17, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(10, 'R8C9', 'R9C8', 'R9C9'),

  LittleKiller.fromCells(22, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(21, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(19, graph.ray('R9C4', -1, 1), geometry),
];
