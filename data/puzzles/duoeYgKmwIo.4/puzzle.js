// Title: October 6, 2022: Gomoku
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=duoeYgKmwIo
// Source: https://tinyurl.com/3fyxr2b9

// Normal Sudoku. Each purple drawn path is a non-repeating consecutive set.

// Givens transcribed from the puzzle grid.
const givens = [
  ['R1C1', 1], ['R1C4', 3], ['R1C9', 8], ['R2C2', 9],
  ['R2C8', 1], ['R3C3', 8], ['R3C7', 2], ['R4C9', 4],
  ['R6C1', 7], ['R7C3', 1], ['R7C7', 9], ['R8C2', 2],
  ['R8C8', 8], ['R9C1', 9], ['R9C6', 8], ['R9C9', 2],
];

// Purple renban paths transcribed from the rendered line layer.
const renbanLines = [
  ['R4C2', 'R3C2', 'R2C2', 'R2C3', 'R2C4'],
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R4C8', 'R3C8', 'R2C8', 'R2C7', 'R2C6'],
  ['R3C6', 'R3C7', 'R4C7'],
  ['R6C7', 'R7C7', 'R7C6'],
  ['R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ['R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C3', 'R7C3', 'R7C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...renbanLines.map(cells => new Renban(...cells)),
];
