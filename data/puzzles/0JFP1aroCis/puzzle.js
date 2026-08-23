// Title: Long Long Arrow
// Author: Peter Guo
// Video: https://www.youtube.com/watch?v=0JFP1aroCis
// Source: https://app.crackingthecryptic.com/sudoku/hd6HrLnqQ3

// Standard sudoku (rows, columns, default 3x3 boxes). One outside diagonal
// clue: digits along the indicated diagonal sum to the printed total, repeats
// allowed. Thirteen arrows: digits along each arrow's arm sum to the digit in
// its circled bulb cell; repeats allowed. Bulb cell is first in each Arrow
// call, matching this puzzle's decoded bulb-then-arms order.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const arrows = [
  ['R1C7', 'R1C6', 'R1C5'],
  ['R1C9', 'R2C9', 'R2C8', 'R2C7'],
  ['R3C4', 'R2C5', 'R3C6', 'R2C7'],
  ['R3C3', 'R2C3', 'R1C3'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R5C9', 'R4C9', 'R3C9'],
  ['R6C7', 'R5C8', 'R4C7', 'R3C8'],
  ['R7C1', 'R6C1', 'R5C1'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R7C7', 'R7C6', 'R7C5', 'R7C4'],
  ['R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'],
  ['R7C3', 'R8C2', 'R9C1'],
];

return [
  new Shape('9x9'),

  // Outside diagonal clue "38" left of row 1, walking down-right from R2C1.
  LittleKiller.fromCells(38, graph.ray('R2C1', 1, 1), geometry),

  ...arrows.map(cells => new Arrow(...cells)),
];
