// Title: August 31, 2022: Extra Regions
// Author: Shye
// Video: https://www.youtube.com/watch?v=DPZdSA5CCjk
// Source: https://tinyurl.com/yh77mxka

// Normal sudoku rules (rows, columns, boxes). Each of the four marked grey
// regions (9 cells each) must also contain the digits 1-9: AllDifferent over
// 9 cells in a 9-value grid forces exactly one of each digit.
const extraRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R5C2'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C5', 'R2C9', 'R3C9', 'R4C9'],
  ['R6C1', 'R7C1', 'R8C1', 'R8C5', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R5C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C2', 1), new Given('R2C3', 2), new Given('R2C4', 3),
  new Given('R2C6', 4), new Given('R2C7', 5), new Given('R2C8', 6),
  new Given('R3C2', 7), new Given('R3C8', 8),
  new Given('R4C2', 4), new Given('R4C8', 3),
  new Given('R6C2', 6), new Given('R6C8', 4),
  new Given('R7C2', 5), new Given('R7C8', 2),
  new Given('R8C2', 3), new Given('R8C3', 8), new Given('R8C4', 6),
  new Given('R8C6', 2), new Given('R8C7', 1), new Given('R8C8', 7),

  ...extraRegions.map(cells => new AllDifferent(...cells)),
];
