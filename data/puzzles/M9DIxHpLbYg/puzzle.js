// Title: X-Sums Little Killer
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=M9DIxHpLbYg
// Source: https://app.crackingthecryptic.com/bQFFrGTThG

// Standard Sudoku. Each outside clue is both an X-Sum along its row or column
// and a Little Killer diagonal sum. Lanes and diagonals are transcribed from
// the seven paired outside-clue arrows and labels.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const clues = [
  [14, graph.column(4), ['R1C3', 'R2C2', 'R3C1']],
  [28, graph.column(5), ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  [13, graph.row(6).reverse(), ['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5']],
  [10, graph.row(7).reverse(), ['R8C9', 'R9C8']],
  [5, graph.column(5).reverse(), ['R9C4', 'R8C3', 'R7C2', 'R6C1']],
  [14, graph.column(3).reverse(), ['R9C2', 'R8C1']],
  [36, graph.row(4), ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
];

return [
  new Shape('9x9'),
  ...clues.flatMap(([total, lane, diagonal]) => [
    XSum.fromCells(total, lane, geometry),
    LittleKiller.fromCells(total, diagonal, geometry),
  ]),
];
