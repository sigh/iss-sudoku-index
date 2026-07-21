// Title: High Five
// Author: Dubax
// Video: https://www.youtube.com/watch?v=s2xzEzHxF8I
// Source: https://sudokupad.app/db59pt4nvp

// Standard Sudoku and sandwich clues. Each VH cell stores the digit immediately
// above the 5 in its column. For the one column whose 5 is in the top row, VH
// uses 5 as a sentinel; 5 cannot be a real predecessor in the same column.
// Requiring all nine VH cells to differ therefore implements the global rule.
const givens = [
  new Given('R8C5', 6),
  new Given('R9C2', 6),
  new Given('R9C3', 9),
];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const sandwiches = [
  Sandwich.fromCells(7, graph.column(2), geometry),
  Sandwich.fromCells(35, graph.column(3), geometry),
  Sandwich.fromCells(11, graph.column(6), geometry),
  Sandwich.fromCells(23, graph.column(7), geometry),
  Sandwich.fromCells(10, graph.column(8), geometry),
  Sandwich.fromCells(11, graph.column(9), geometry),
  Sandwich.fromCells(5, graph.row(1), geometry),
  Sandwich.fromCells(6, graph.row(2), geometry),
  Sandwich.fromCells(7, graph.row(3), geometry),
  Sandwich.fromCells(13, graph.row(4), geometry),
  Sandwich.fromCells(31, graph.row(5), geometry),
  Sandwich.fromCells(2, graph.row(6), geometry),
  Sandwich.fromCells(33, graph.row(8), geometry),
  Sandwich.fromCells(4, graph.row(9), geometry),
];

const highFiveVars = new Var('H', 'digits immediately above the 5s', 9);
const highFiveCells = highFiveVars.cells();
const highFiveColumns = highFiveCells.map((highFiveCell, colIndex) => {
  const col = colIndex + 1;
  const possibleFiveRows = Array.from({ length: 8 }, (_, index) => index + 2);
  const topRowCase = new And([
    new Given(makeCellId(1, col), 5),
    new Given(highFiveCell, 5),
  ]);
  const predecessorCases = possibleFiveRows.map(row => new And([
      new Given(makeCellId(row, col), 5),
      new SameValues(2, highFiveCell, makeCellId(row - 1, col)),
    ]));
  return new Or([topRowCase, ...predecessorCases]);
});

return [
  new Shape('9x9'),
  highFiveVars,
  ...givens,
  ...sandwiches,
  ...highFiveColumns,
  new AllDifferent(...highFiveCells),
];
