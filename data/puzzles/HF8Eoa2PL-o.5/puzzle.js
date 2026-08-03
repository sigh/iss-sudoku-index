// Title: What's Next?
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=HF8Eoa2PL-o
// Source: https://tinyurl.com/59e2nxtd
//
// Normal sudoku rules apply. All 14 killer cages carry a printed total
// (Cage handles the no-repeat + sum semantics for each). Each of the 6
// thermometers uses the bulb as its first cell, matching Thermo's
// strictly-increase-away-from-the-bulb order. Several thermometers share
// cells with a killer cage; both constraints simply apply to those shared cells.
// No givens, no drawn regions -- standard 3x3 boxes apply.

const cages = [
  [6, 'R2C3', 'R3C2', 'R3C3'],
  [24, 'R2C7', 'R3C7', 'R3C8'],
  [23, 'R5C3', 'R6C2', 'R6C3'],
  [7, 'R5C7', 'R6C7', 'R6C8'],
  [9, 'R8C1', 'R8C2', 'R9C2'],
  [21, 'R8C8', 'R8C9', 'R9C8'],
  [15, 'R1C2', 'R1C3'],
  [10, 'R1C7', 'R1C8'],
  [11, 'R4C7', 'R4C8'],
  [11, 'R4C2', 'R4C3'],
  [13, 'R7C3', 'R7C4'],
  [10, 'R7C6', 'R7C7'],
  [14, 'R8C4', 'R9C4'],
  [5, 'R8C6', 'R9C6'],
];

const thermos = [
  ['R1C4', 'R2C3', 'R3C3'],
  ['R3C7', 'R2C7', 'R1C6'],
  ['R6C3', 'R5C3', 'R4C4'],
  ['R4C6', 'R5C7', 'R6C7'],
  ['R9C3', 'R9C2', 'R8C2', 'R8C1'],
  ['R8C9', 'R8C8', 'R9C8', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
];
