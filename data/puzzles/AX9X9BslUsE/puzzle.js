// Title: Rhubarb and Custard
// Author: Qodec
// Video: https://www.youtube.com/watch?v=AX9X9BslUsE
// Source: https://sudokupad.app/3b5i89p48o

// Normal Sudoku, little killer, and odd rules apply. No regions are drawn,
// so default 3x3 boxes apply. The odd clue (grey circle) is encoded as a
// multi-value Given restricting the cell to an odd digit -- there is no
// dedicated Odd class.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  new Given('R7C7', 8),
  new Given('R8C4', 1, 3, 5, 7, 9),

  // Little killers (littlekillersum[]). graph.ray walks each diagonal from
  // its in-grid entry point to the grid edge in the arrow's own direction.
  LittleKiller.fromCells(71, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(3, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(3, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(10, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R9C4', -1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(30, graph.ray('R5C1', -1, 1), geometry),
];
