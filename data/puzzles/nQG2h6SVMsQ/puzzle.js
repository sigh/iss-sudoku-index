// Title: Gridlocked
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=nQG2h6SVMsQ
// Source: https://app.crackingthecryptic.com/sudoku/6QMG8QMgbh

// Normal sudoku rules apply (default 9x9 grid, standard 3x3 boxes, digits
// 1-9). No other clue types are drawn in the payload -- a pure classic
// sudoku puzzle carried entirely by its 24 givens.

const givens = [
  ['R1C1', 7], ['R1C3', 6], ['R1C7', 1], ['R1C9', 9],
  ['R3C1', 3], ['R3C4', 1], ['R3C6', 4], ['R3C9', 7],
  ['R4C3', 3], ['R4C4', 2], ['R4C6', 5], ['R4C7', 6],
  ['R6C3', 9], ['R6C4', 8], ['R6C6', 7], ['R6C7', 4],
  ['R7C1', 2], ['R7C4', 7], ['R7C6', 8], ['R7C9', 4],
  ['R9C1', 6], ['R9C3', 8], ['R9C7', 9], ['R9C9', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
