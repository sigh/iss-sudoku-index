// Title: REDRUM
// Author: Gray Kanarek
// Video: https://www.youtube.com/watch?v=Dk8-VAkKh6A
// Source: https://app.crackingthecryptic.com/sudoku/9ThTbRRRt9

// Standard sudoku: digits 1-9 once each in every row, column and 3x3 box
// (the payload's own regions are the standard nine boxes).
//
// Nine little killer clues: each is drawn as a small arrow touching a grid
// corner cell from outside, pointing diagonally into the grid, with a number
// printed beside it -- the sum of every cell on that diagonal, run to the far
// edge. Total, start cell and direction below are read from each arrow's
// drawn bulb/ray and its nearest paired outside number.
//
// The source carries no rules text at all, and six additional grey lines are
// drawn on the grid whose rule is not stated anywhere recoverable from the
// payload; they are omitted.

const board = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// [total, start cell, dRow, dCol]
const littleKillers = [
  [39, 'R1C1', 1, 1],
  [10, 'R1C2', 1, -1],
  [10, 'R1C8', 1, 1],
  [42, 'R4C9', 1, -1],
  [15, 'R5C9', 1, -1],
  [21, 'R6C9', 1, -1],
  [17, 'R4C1', -1, 1],
  [32, 'R5C1', -1, 1],
  [47, 'R6C1', -1, 1],
];

return [
  new Shape('9x9'),
  ...littleKillers.map(([total, cell, dr, dc]) =>
    LittleKiller.fromCells(total, board.ray(cell, dr, dc), geometry)),
];
