// Title: Nonconsecutive X-Sums
// Author: Alexander Rappa
// Video: https://www.youtube.com/watch?v=TuXYfyE8pgg
// Source: https://app.crackingthecryptic.com/webapp/8FHb32G4pP

// Standard 9x9 sudoku (regular boxes), plus AntiConsecutive: no orthogonally
// adjacent pair of cells may hold consecutive digits. Seven outside clues are
// X-Sums, each read straight into the grid along its own row/column (never
// diagonally): the sum of the first X digits, where X is the first digit
// itself. Clue cell lists and directions transcribed from the drawn outside
// clue lanes.
const shape = new Shape('9x9');
const graph = cellGraph(shape);

const outsideClues = [
  [6, graph.column(5)],
  [35, graph.column(8)],
  [16, graph.column(9)],
  [29, graph.row(5)],
  [22, graph.row(6)],
  [18, graph.row(2).slice().reverse()],
  [8, graph.row(7).slice().reverse()],
];

return [
  shape,
  new AntiConsecutive(),
  ...outsideClues.map(([clue, cells]) => XSum.fromCells(clue, cells, cellGeometry(shape))),
];
