// Title: Thermo Killer Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=lbgLAhRoBOA
// Source: https://app.crackingthecryptic.com/sudoku/qTdnQ2MjL8

// Normal sudoku rules apply. Cages show their sums; digits do not repeat
// within a cage (standard killer-cage semantics). Along thermometers, digits
// strictly ascend from the bulb. Each thermometer's bulb end is marked by a
// filled grey circle; some lines are drawn tip-first, so the bulb-to-tip
// direction below follows the circle's location, not the drawn stroke order.

const cages = [
  [8, 'R1C1', 'R2C1', 'R3C1'],
  [14, 'R4C1', 'R5C1', 'R6C1'],
  [6, 'R7C2', 'R8C2'],
  [11, 'R3C3', 'R4C3', 'R5C3'],
  [14, 'R1C4', 'R2C4', 'R3C4'],
  [7, 'R4C4', 'R5C4', 'R6C4'],
  [10, 'R7C5', 'R8C5', 'R9C5'],
  [12, 'R6C6', 'R7C6'],
  [17, 'R3C6', 'R4C6', 'R5C6'],
  [20, 'R1C7', 'R2C7', 'R3C7'],
  [13, 'R4C7', 'R5C7', 'R6C7'],
  [10, 'R6C8', 'R7C8'],
  [23, 'R3C9', 'R4C9', 'R5C9'],
];

const thermos = [
  ['R3C1', 'R2C1', 'R1C1'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R3C3', 'R4C3', 'R5C3'],
  ['R3C4', 'R2C4', 'R1C4'],
  ['R6C4', 'R5C4', 'R4C4'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R3C7', 'R2C7', 'R1C7'],
  ['R6C7', 'R5C7', 'R4C7'],
  ['R3C9', 'R4C9', 'R5C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
];
