// Title: Quantum Electrodynamics
// Author: Blobz
// Video: https://www.youtube.com/watch?v=XUru-t7MVEw
// Source: https://sudokupad.app/blobz/quantum-electrodynamics

// Standard Sudoku, nonconsecutive orthogonal neighbours, black ratio dots,
// and counting circles. Unmarked edges have no black-dot restriction.
// Cell-centred outlined circles drawn on the grid.
const circles = [
  'R1C4', 'R1C7', 'R2C4', 'R2C6', 'R2C8', 'R3C3', 'R3C4',
  'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R7C2',
  'R7C5', 'R7C6', 'R8C5', 'R8C6', 'R9C4', 'R9C7', 'R9C8',
];
// Black edge marks drawn between these pairs.
const dots = [
  ['R1C2', 'R1C3'], ['R1C8', 'R1C9'], ['R2C2', 'R2C3'],
  ['R2C9', 'R3C9'], ['R6C7', 'R6C8'], ['R7C8', 'R8C8'],
  ['R8C1', 'R8C2'],
];
return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...dots.map(cells => new BlackDot(...cells)),
  new CountingCircles(...circles),
];
