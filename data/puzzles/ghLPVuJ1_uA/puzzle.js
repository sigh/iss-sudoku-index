// Title: SC3
// Author: kuraban
// Video: https://www.youtube.com/watch?v=ghLPVuJ1_uA
// Source: https://app.crackingthecryptic.com/sudoku/dH7LbLfBRQ
//
// Standard killer sudoku: rows, columns, and the nine 3x3 boxes each hold
// 1-9 once. Cages sum to the printed small clue in the top-left cell, and
// digits cannot repeat within any cage. Three cages (9 cells each) are
// drawn without a printed total; per the rules ("if given"), a cage with no
// total is still a real cage, so it keeps the no-repeat constraint but no
// sum -- encoded with AllDifferent instead of Cage.

// Cages with a printed total: [sum, cells...]. Coordinates transcribed
// from the drawn cage outlines.
const sumCages = [
  [14, ['R1C1', 'R1C2', 'R2C1']],
  [6, ['R1C3', 'R2C3']],
  [15, ['R3C1', 'R3C2']],
  [11, ['R1C6', 'R2C6']],
  [18, ['R1C8', 'R1C9', 'R2C9']],
  [10, ['R4C1', 'R4C2']],
  [5, ['R6C1', 'R6C2']],
  [11, ['R8C1', 'R9C1']],
  [6, ['R8C4', 'R9C4']],
  [14, ['R8C6', 'R9C5', 'R9C6']],
  [14, ['R8C7', 'R9C7']],
  [5, ['R7C8', 'R7C9']],
  [14, ['R8C8', 'R8C9', 'R9C8']],
  [10, ['R4C8', 'R4C9']],
  [9, ['R4C6', 'R5C6']],
];

// Cages drawn without a printed total: no-repeat only, no sum.
const noTotalCages = [
  ['R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R1C7', 'R2C7', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C7', 'R5C7'],
  ['R5C3', 'R6C3', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C3', 'R9C3'],
];

return [
  new Shape('9x9'),
  ...sumCages.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...noTotalCages.map(cells => new AllDifferent(...cells)),
];
