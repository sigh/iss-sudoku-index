// Title: Gary Ashby
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=FLATfYbBeug
// Source: https://tinyurl.com/323m669w

// Normal Sudoku rules apply. Each indicated diagonal has the displayed
// little-killer sum. Givens and diagonal paths are transcribed from the puzzle.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const givens = [
  ['R2C3', 1], ['R2C7', 2], ['R3C2', 8], ['R3C5', 2], ['R3C8', 9],
  ['R4C4', 3], ['R4C6', 4], ['R5C3', 5], ['R5C7', 9], ['R6C4', 2],
  ['R6C6', 9], ['R7C2', 1], ['R7C5', 6], ['R7C8', 4], ['R8C3', 6],
  ['R8C7', 3],
];

// Outside diagonal totals: start cell, row step, column step, and total
// transcribed from the indicated little-killer clues.
const littleKillers = [
  ['R1C8', 1, 1, 6], ['R2C1', -1, 1, 5], ['R9C2', -1, -1, 15],
  ['R8C9', 1, -1, 14], ['R1C6', 1, 1, 15], ['R4C1', -1, 1, 15],
  ['R9C4', -1, -1, 23], ['R6C9', 1, -1, 23],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...littleKillers.map(([cell, dRow, dCol, total]) =>
    LittleKiller.fromCells(total, graph.ray(cell, dRow, dCol), geometry)),
];
