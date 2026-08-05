// Title: October 28, 2022: Frame
// Author: clover!
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/bdzadvp3

// Normal Sudoku rules apply. Each listed outside clue sums the first three cells read inward.
const graph = cellGraph('9x9');
const rows = (row) => graph.row(row);
const columns = (column) => graph.column(column);
const backward = (cells) => [...cells].reverse();
const firstThree = (cells) => cells.slice(0, 3);

// Givens transcribed from the grid.
const givens = [
  ['R2C4', 3], ['R3C7', 8], ['R4C2', 3], ['R4C8', 7], ['R5C5', 9],
  ['R6C2', 9], ['R6C8', 5], ['R7C3', 9], ['R8C6', 4],
];

// Outside clue totals transcribed from the twelve labels around the frame.
const frameSums = [
  [6, firstThree(rows(1))],
  [20, firstThree(backward(rows(1)))],
  [20, firstThree(columns(1))],
  [11, firstThree(columns(4))],
  [8, firstThree(columns(9))],
  [10, firstThree(rows(4))],
  [10, firstThree(backward(rows(6)))],
  [20, firstThree(rows(9))],
  [7, firstThree(backward(rows(9)))],
  [8, firstThree(backward(columns(1)))],
  [11, firstThree(backward(columns(6)))],
  [20, firstThree(backward(columns(9)))],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...frameSums.map(([total, cells]) => new Sum(total, ...cells)),
];
