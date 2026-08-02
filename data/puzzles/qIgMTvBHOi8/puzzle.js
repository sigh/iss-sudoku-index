// Title: Middle Digit
// Author: Tulrak
// Video: https://www.youtube.com/watch?v=qIgMTvBHOi8
// Source: https://app.crackingthecryptic.com/sudoku/3fqDmTQ7MJ

// Normal Sudoku; anti-knight; all drawn killer cages; five circle-first arrows;
// and the labelled 40 diagonal from R2C1 down-right.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  new AntiKnight(),

  // Killer cages transcribed from the drawn outlined regions and their totals.
  new Cage(40, 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'),
  new Cage(35, 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'),
  new Cage(30, 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'),
  new Cage(20, 'R6C8', 'R6C9', 'R7C8', 'R7C9'),
  new Cage(10, 'R4C5', 'R4C6'),
  new Cage(15, 'R4C2', 'R4C3', 'R4C4'),
  new Cage(30, 'R4C1', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5'),
  new Cage(5, 'R1C1'),
  new Cage(10, 'R2C5', 'R3C5'),
  new Cage(30, 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C6'),
  new Cage(10, 'R3C8', 'R3C9'),

  // Grey circles and their arrow arms, in the order of each drawn path.
  new Arrow('R8C9', 'R8C8', 'R9C8'),
  new Arrow('R6C7', 'R5C8', 'R4C8'),
  new Arrow('R5C6', 'R5C5', 'R4C4'),
  new Arrow('R9C5', 'R8C4', 'R7C5'),
  new Arrow('R4C3', 'R5C3', 'R6C4'),

  LittleKiller.fromCells(40, graph.ray('R2C1', 1, 1), geometry),
];
