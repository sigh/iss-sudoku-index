// Title: Battleaxe
// Author: Scott Williams
// Video: https://www.youtube.com/watch?v=m3oLHY0zkF4
// Source: https://sudokupad.app/ofafbe2382

// Normal sudoku. Blue lines are region sum lines. Quad circles list digits that
// must appear in the surrounding 2x2 cells.

const regionSumLines = [
  ['R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'],
  [
    'R4C5', 'R5C6', 'R5C7', 'R5C8', 'R4C8', 'R3C8',
    'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R3C5',
  ],
  [
    'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R7C5',
    'R6C5', 'R5C4', 'R5C3', 'R5C2', 'R6C2',
  ],
];

const quads = [
  ['R5C2', 2, 3, 4, 7],
  ['R7C2', 2, 3, 4, 5],
  ['R7C4', 1, 2, 6, 9],
  ['R2C5', 3, 4, 6, 9],
  ['R2C7', 2, 4, 5, 7],
  ['R4C7', 2, 3, 5, 6],
  ['R3C3', 6, 7, 8],
  ['R8C5', 7],
  ['R5C8', 9],
];

return [
  new Shape('9x9'),
  new Given('R4C6', 2),
  new Given('R6C4', 5),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...quads.map(([topLeftCell, ...values]) => new Quad(topLeftCell, ...values)),
];
