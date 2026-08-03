// Title: April 28, 2023: Fortress
// Author: clover!
// Video: https://www.youtube.com/watch?v=xVCTL0Bc52o
// Source: https://tinyurl.com/5duywcy3

// Normal sudoku. Fortress: every gray cell must be greater than each of its
// orthogonally adjacent white (non-gray) cells; the rules' own worked
// example ("the digits in r3c6 and r4c7 must be less than 4", both white
// neighbours of the gray-given R3C7=4) confirms gray-gray adjacencies are
// excluded. Gray cells, per the "maximum" cell list, four 2x2 blocks plus
// two singletons:

const grayCells = [
  'R2C2', 'R2C3', 'R3C2', 'R3C3',
  'R2C7', 'R2C8', 'R3C7', 'R3C8',
  'R7C2', 'R7C3', 'R8C2', 'R8C3',
  'R7C7', 'R7C8', 'R8C7', 'R8C8',
  'R4C6',
  'R6C4',
];
const graySet = new Set(grayCells);

const graph = cellGraph('9x9');

// Derive the fortress boundary from the cell list above rather than
// hand-listing pairs: every orthogonal neighbour of a gray cell that is
// itself not gray must be smaller than it. Each 2x2 block's internal
// gray-gray edges are skipped by the graySet filter, per the rule text.
const fortressBoundary = grayCells.flatMap(cell =>
  graph.neighbours(cell)
    .filter(n => !graySet.has(n))
    .map(n => new GreaterThan(cell, n)));

return [
  new Shape('9x9'),
  new Given('R1C1', 5), new Given('R1C9', 3),
  new Given('R2C2', 4), new Given('R2C8', 5),
  new Given('R3C3', 2), new Given('R3C7', 4),
  new Given('R5C4', 8), new Given('R5C5', 1), new Given('R5C6', 4),
  new Given('R7C3', 4), new Given('R7C7', 3),
  new Given('R8C2', 3), new Given('R8C8', 4),
  new Given('R9C1', 7), new Given('R9C9', 6),
  ...fortressBoundary,
];
