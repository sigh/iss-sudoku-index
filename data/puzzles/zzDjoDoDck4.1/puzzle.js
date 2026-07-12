// Title: 3 Exes and a Nightmare
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=zzDjoDoDck4
// Source: https://sudokupad.app/1aqyjbwx38

// 6x6 irregular sudoku: place 1-6 once each in every row, column, and
// jigsaw region. Exes: each outside clue gives the sum of the first X
// digits in its row or column, where X is the digit in the cell next to
// the clue (encoded as native XSum constraints).

const regions = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3', 'R4C3'],
  ['R2C1', 'R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1'],
  ['R4C2', 'R5C2', 'R6C2', 'R6C3', 'R6C4', 'R6C5'],
  ['R4C6', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C6'],
  ['R1C6', 'R2C6', 'R3C5', 'R3C6', 'R4C4', 'R4C5'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C4'],
];

const graph = cellGraph('6x6');
return [
  new Shape('6x6', '1-6'),
  new NoBoxes(),
  ...regions.map(region => new Jigsaw('6x6', ...region)),
  XSum.fromCells(15, graph.column(2), cellGeometry('6x6')),
  XSum.fromCells(15, graph.column(5), cellGeometry('6x6')),
  XSum.fromCells(12, graph.row(5), cellGeometry('6x6')),
];
