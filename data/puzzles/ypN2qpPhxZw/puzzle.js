// Title: Rippleflux
// Author: Aeon
// Video: https://www.youtube.com/watch?v=ypN2qpPhxZw
// Source: https://sudokupad.app/5qa0a0nbpi

// Normal Sudoku. Each lime line is a region-sum line and an index line.
// Reading from its circle, if position N contains P, position P contains N.

const lines = [
  [
    'R6C1', 'R6C2', 'R6C3', 'R7C4', 'R8C5',
    'R7C6', 'R6C7', 'R6C8', 'R5C8',
  ],
  ['R4C8', 'R5C9', 'R6C9', 'R7C8', 'R8C7', 'R8C8', 'R9C9'],
  ['R5C5', 'R5C4', 'R5C3', 'R4C2', 'R3C2', 'R2C1'],
  ['R4C3', 'R3C4', 'R2C4', 'R1C3', 'R1C2'],
  ['R2C5', 'R1C5', 'R1C6', 'R2C6', 'R1C7', 'R1C8', 'R2C9', 'R1C9'],
];

// For each one-based position N, choose the position P named by that cell and
// require the cell at P to contain N. The alternatives also restrict P to a
// position that exists on this particular line.
const indexConstraints = lines.flatMap(cells => cells.map((cell, n) =>
  new Or(cells.map((target, p) => new And([
    new Given(cell, p + 1),
    new Given(target, n + 1),
  ])))
));

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
  ...indexConstraints,
];
