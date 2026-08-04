// Title: High Ground
// Author: Agent
// Video: https://www.youtube.com/watch?v=bZ2ypJc5VKU
// Source: https://app.crackingthecryptic.com/sudoku/MFhNMdnqJ8

// Rules: normal sudoku (default row/column/box all-different). Digits along
// an arrow sum to the digit in that arrow's circle -- the circle sits on the
// arrow's own first path cell, so Arrow's built-in "bulb cell equals sum of
// the arm" semantics apply directly. All low digits (1-5) must be orthogonally
// connected with each other -- one ConnectedValues over the whole main grid
// (empty group prefix). Each 2x2 group of cells contains at least one high
// digit (6-9) -- every overlapping 2x2 window of the grid, not just
// box-aligned ones, per the rule's plain wording.

const arrows = [
  ['R1C3', 'R1C2', 'R2C2'],
  ['R4C1', 'R3C2', 'R3C3', 'R2C3'],
  ['R8C1', 'R8C2', 'R7C2'],
  ['R8C6', 'R9C5', 'R9C4'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R4C5', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C3', 'R6C3'],
  ['R7C8', 'R6C7', 'R6C6'],
  ['R6C9', 'R5C9', 'R4C8'],
];

const LOW = [1, 2, 3, 4, 5];

// Every 2x2 window of the 9x9 grid, top-left at each of rows/cols 1-8
// (overlapping, 64 windows total) -- "each 2x2 group of cells", not just the
// 9 box-aligned ones.
const graph = cellGraph('9x9');
const windows = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    windows.push(graph.block(makeCellId(r, c), 2, 2));
  }
}
// Existence check over each window's 4 cells: at least one digit from {6,7,8,9}
// appears, in any position -- order from graph.block doesn't matter here.
const highWindows = windows.map(
  cells => new Regex('[1-9]*[6789][1-9]*', ...cells));

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  new ConnectedValues('', LOW),
  ...highWindows,
];
