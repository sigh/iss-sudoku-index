// Title: August 25, 2021: Extra Regions
// Author: clover!
// Video: https://www.youtube.com/watch?v=7sWnbrADeWo
// Source: https://tinyurl.com/6jtrp8fv
//
// Normal sudoku rules apply. Also, each grey region contains the digits 1
// through 9 once each. Each grey region has exactly 9 cells, so
// AllDifferent over its cells is equivalent to a 1-9 placement.

const givens = [
  new Given('R1C6', 5),
  new Given('R1C7', 1),
  new Given('R1C9', 2),
  new Given('R3C5', 9),
  new Given('R3C9', 3),
  new Given('R4C4', 6),
  new Given('R4C9', 8),
  new Given('R5C2', 1),
  new Given('R5C7', 5),
  new Given('R6C1', 8),
  new Given('R6C4', 1),
  new Given('R6C6', 3),
  new Given('R7C2', 7),
  new Given('R8C1', 6),
  new Given('R8C2', 4),
  new Given('R8C3', 8),
  new Given('R8C5', 2),
  new Given('R9C2', 5),
  new Given('R9C4', 7),
];

// Four grey extra regions, from the payload's `extraregion` array.
const extraRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
].map(cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...extraRegions,
];
