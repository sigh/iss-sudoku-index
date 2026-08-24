// Title: 42-43-44
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=Q9g6cZB3TKw
// Source: https://app.crackingthecryptic.com/sudoku/4DMg6BDj7q
//
// Normal sudoku rules apply (default rows/columns/3x3 boxes).
// 13 killer cages: digits sum to the small corner total, no repeats within a
// cage; the 6 cells R1C9/R2C9/R3C9/R8C4/R8C5/R8C6 belong to no cage.
// 8 outside clues give the sum of digits along the indicated diagonal ray;
// digits on a diagonal may repeat (LittleKiller's own semantics). Each ray is
// given as its on-grid start cell and direction; `graph.ray` derives the
// exact cell list instead of hand-listing it.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  // [total, cells...] -- as drawn on the board.
  [13, 'R1C1', 'R2C1', 'R3C1'],
  [45, 'R1C2', 'R2C2', 'R3C2', 'R2C3', 'R3C3', 'R4C2', 'R4C3', 'R5C3', 'R5C2'],
  [45, 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R8C2', 'R8C3'],
  [44, 'R6C2', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7'],
  [15, 'R9C4', 'R9C5', 'R9C3'],
  [45, 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8', 'R8C7', 'R9C7', 'R9C6'],
  [9, 'R8C9', 'R9C9'],
  [7, 'R6C9', 'R7C9'],
  [11, 'R4C9', 'R5C9'],
  [17, 'R1C8', 'R2C8', 'R3C8'],
  [45, 'R1C7', 'R2C7', 'R3C7', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R5C7', 'R5C6'],
  [42, 'R1C6', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R6C6'],
  [43, 'R1C3', 'R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R6C3'],
];

// Little killer diagonals: [sum, startCell, dRow, dCol] -- down-right =
// (1,1), down-left = (1,-1), up-right = (-1,1), up-left = (-1,-1), matching
// each clue's drawn arrow.
const littleKillers = [
  [37, 'R1C1', 1, 1],
  [19, 'R1C3', 1, -1],
  [19, 'R1C7', 1, 1],
  [54, 'R1C9', 1, -1],
  [22, 'R5C9', 1, -1],
  [11, 'R9C8', -1, 1],
  [7, 'R9C2', -1, -1],
  [22, 'R5C1', -1, 1],
];

return [
  new Shape('9x9'),

  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),

  ...littleKillers.map(([sum, start, dRow, dCol]) =>
    LittleKiller.fromCells(sum, graph.ray(start, dRow, dCol), geometry)),
];
