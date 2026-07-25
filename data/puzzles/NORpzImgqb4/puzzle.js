// Title: Not as Easy as 1,2,3
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=NORpzImgqb4
// Source: https://sudokupad.app/jtcnk3yx42

// Normal Sudoku, arrow, killer cage, and little killer rules apply. Only the
// positive-slope diagonal (bottom-left to top-right) is marked no-repeat --
// the payload's `diagonal+` flag, with no `diagonal-` -- matching the rules'
// singular "the diagonal". Anti-king (no repeat a king's move apart) is a
// separate global rule.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Diagonal(1),
  new AntiKing(),

  // Killer cages (killercage[]).
  new Cage(8, 'R9C6', 'R9C7'),
  new Cage(5, 'R3C9', 'R4C9'),

  // Little killer (littlekillersum[]: cell R4C0, direction UR, value 19,
  // cells R3C1/R2C2/R1C3). graph.ray walks the same diagonal from its
  // in-grid entry point (R3C1) up-right to the edge.
  LittleKiller.fromCells(19, graph.ray('R3C1', -1, 1), geometry),

  // Arrows (arrow[]): first cell is the circle, remaining cells are the arm.
  new Arrow('R3C5', 'R2C4', 'R1C5', 'R2C6', 'R3C7'),
  new Arrow('R5C7', 'R4C8', 'R5C9', 'R6C8', 'R7C7'),
  new Arrow('R7C5', 'R8C6', 'R9C5', 'R8C4', 'R7C3'),
  new Arrow('R5C3', 'R6C2', 'R5C1', 'R4C2', 'R3C3'),
];
