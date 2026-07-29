// Title: Full House
// Author: Michael Lefkowitz & Lulero
// Video: https://www.youtube.com/watch?v=LFw49i0hAiU
// Source: https://sudokupad.app/4pqenuxwmn?setting-nogrid=1

// Encodes the complete upper-left normal 9x9 Sudoku and the four Counting Cards
// suit sets. The second overlapping Sudoku's grid geometry is omitted: its
// cell-aligned rows, columns, and boxes cannot be recovered from the drawing.
const canvas = new Var('P', '14x13 source canvas', '14x13');
const cell = (row, col) => canvas.cell(row, col);
const upperLeftGraph = cellGraph('9x9');
const toCanvas = (gridCell) => {
  const { row, col } = parseCellId(gridCell);
  return cell(row, col);
};

// The black-outlined upper-left 9x9 board is the complete normal Sudoku grid.
const upperLeftSudoku = [
  ...Array.from({ length: 9 }, (_, row) =>
    new AllDifferent(...Array.from({ length: 9 }, (_, col) => cell(row + 1, col + 1)))),
  ...Array.from({ length: 9 }, (_, col) =>
    new AllDifferent(...Array.from({ length: 9 }, (_, row) => cell(row + 1, col + 1)))),
  ...upperLeftGraph.boxes().map(box => new AllDifferent(...box.map(toCanvas))),
];

// The printed suit symbols are the card sets named by the Counting Cards rule.
const diamonds = [
  [1, 4], [1, 2], [3, 1], [3, 3], [3, 4], [2, 3], [4, 1], [5, 2],
  [6, 3], [6, 5], [6, 6], [7, 7], [8, 5], [7, 2], [9, 1], [12, 2],
  [11, 2], [11, 4], [13, 5], [12, 6], [11, 7], [13, 8], [3, 8], [4, 7],
  [4, 8], [5, 8], [2, 9], [8, 8], [10, 8], [7, 11], [8, 11], [8, 12],
  [8, 13], [10, 13], [9, 11], [11, 10],
].map(([row, col]) => cell(row, col));
const hearts = [[12, 7], [14, 7], [14, 8]].map(([row, col]) => cell(row, col));
const clubs = [
  [7, 10], [10, 11], [10, 9], [11, 12], [10, 2], [5, 6], [5, 3], [4, 3],
  [4, 4], [1, 7],
].map(([row, col]) => cell(row, col));
const spades = [[10, 4], [10, 5], [14, 5], [14, 6], [9, 10], [8, 10], [6, 13]]
  .map(([row, col]) => cell(row, col));

return [
  new Shape('1x1', 9),
  canvas,
  ...upperLeftSudoku,
  new CountingCircles(...diamonds),
  new CountingCircles(...hearts),
  new CountingCircles(...clubs),
  new CountingCircles(...spades),
];
