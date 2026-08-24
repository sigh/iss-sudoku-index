// Title: Renban ModE
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=HVt_VnkFW0Q
// Source: https://app.crackingthecryptic.com/sudoku/HhQT427HGN

// Normal sudoku rules apply. Each grey line is a Renban line: consecutive,
// non-repeating digits in any order. Clues outside the grid give the sum of
// the digits along the diagonal they point into (Little Killer semantics);
// digits may repeat on that diagonal unless another rule (e.g. an overlapping
// Renban line) forbids it, so no extra constraint is added for that clause.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Renban (grey) lines: cell paths from the drawn `lines` array.
  new Renban('R8C1', 'R9C2'),
  new Renban('R6C1', 'R5C1', 'R4C1'),
  new Renban('R3C1', 'R2C2'),
  new Renban('R3C2', 'R2C3', 'R1C4'),
  new Renban('R1C5', 'R2C5', 'R3C5'),
  new Renban('R1C6', 'R2C7', 'R3C8'),
  new Renban('R4C2', 'R4C3', 'R4C4'),
  new Renban('R4C6', 'R4C7', 'R4C8'),
  new Renban('R4C9', 'R5C9', 'R6C9'),
  new Renban('R6C8', 'R7C7', 'R8C6'),
  new Renban('R9C4', 'R9C5', 'R9C6'),
  new Renban('R9C8', 'R8C9'),
  new Renban('R8C4', 'R7C3', 'R6C2'),
  new Renban('R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'),

  // Outside diagonal-sum clues. Direction of each diagonal is read from the
  // drawn arrow stroke's entry corner and travel direction, paired to its
  // outside-clue number by nearest on-canvas distance.
  LittleKiller.fromCells(23, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(27, graph.ray('R9C5', -1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C5', -1, -1), geometry),
  LittleKiller.fromCells(25, graph.ray('R4C1', -1, 1), geometry),
];
