// Title: Cygnus
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=BO-LNBbOuVI
// Source: https://app.crackingthecryptic.com/sudoku/8fJHgNJqmM

// Normal sudoku (default row/column/box all-different) plus two rule types:
//   - Arrow: digits along an arrow sum to its circle. Six circles carry nine
//     arrows total (three circles carry two arrows each); every arrow's own
//     arm sums independently to its circle.
//   - Outside diagonal sums: each badge outside the grid gives the total of
//     the diagonal running from the grid-edge cell nearest it inward, and the
//     rules explicitly allow repeats on that diagonal (no extra constraint
//     beyond the normal row/column/box all-different already in force).
// Arrow bulb/arm cells and outside-diagonal cell lists were read from the
// drawn arrow geometry; each outside badge's diagonal direction comes from
// its own drawn ray, not from guessing which of the two candidate diagonals
// a lane could mean.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const arrows = [
  new Arrow('R3C6', 'R3C7', 'R4C7', 'R5C7'),
  new Arrow('R3C6', 'R4C5'),
  new Arrow('R5C5', 'R4C4', 'R5C4', 'R6C4'),
  new Arrow('R4C3', 'R3C3', 'R3C4', 'R3C5'),
  new Arrow('R7C4', 'R6C5'),
  new Arrow('R7C4', 'R7C3', 'R6C3', 'R5C3'),
  new Arrow('R6C7', 'R5C6'),
  new Arrow('R6C7', 'R7C7', 'R7C6', 'R7C5'),
  new Arrow('R6C8', 'R5C8', 'R5C9'),
];

const littleKillers = [
  LittleKiller.fromCells(15, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(28, graph.ray('R5C9', 1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(34, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R9C8', -1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...littleKillers,
];
