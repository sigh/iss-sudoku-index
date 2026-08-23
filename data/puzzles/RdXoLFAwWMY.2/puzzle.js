// Title: September 13, 2021: Sandwich
// Author: clover!
// Video: https://www.youtube.com/watch?v=RdXoLFAwWMY
// Source: https://tinyurl.com/273e5pwa

// Normal sudoku rules apply. Each outside clue gives the sum of the digits
// sandwiched between the 1 and the 9 in its row or column. Row/column
// coordinates below are transcribed from the payload's sandwichsum array
// (R#C0 = row #, R0C# = column #); givens are transcribed from the grid.
const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);

const rowClues = [
  { row: 1, total: 5 },
  { row: 2, total: 5 },
  { row: 4, total: 10 },
  { row: 6, total: 10 },
  { row: 8, total: 6 },
  { row: 9, total: 6 },
];
const colClues = [
  { col: 1, total: 9 },
  { col: 3, total: 2 },
  { col: 4, total: 9 },
  { col: 6, total: 10 },
  { col: 7, total: 4 },
  { col: 9, total: 8 },
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R3C3', 9),
  new Given('R4C4', 1),
  new Given('R6C6', 9),
  new Given('R7C7', 1),
  new Given('R9C9', 9),
  ...rowClues.map(({ row, total }) =>
    Sandwich.fromCells(total, graph.row(row), geometry)),
  ...colClues.map(({ col, total }) =>
    Sandwich.fromCells(total, graph.column(col), geometry)),
];
