// Title: Quadrangularly Sparse
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=Qs3U0Z1BuCM
// Source: https://app.crackingthecryptic.com/fhr7gQfm9G

// Normal Sudoku rules apply. Killer cages have the displayed sum and no repeated
// digit; each arrow's arm sums to its circle; white-dot pairs are consecutive.
// Cage cells and totals are transcribed from the drawn killer cages.
const cages = [
  [12, 'R1C8', 'R2C8'],
  [7, 'R4C9', 'R5C9', 'R6C9'],
  [12, 'R8C8', 'R9C8'],
  [27, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [9, 'R3C3', 'R3C4', 'R4C3'],
  [9, 'R6C3', 'R7C3', 'R7C4'],
  [18, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [11, 'R8C6', 'R9C6'],
  [8, 'R1C6', 'R2C6'],
  [9, 'R8C4', 'R9C4'],
];

// The four drawn arrows share the circle at R5C3; each listed path is one shaft.
const arrows = [
  ['R5C3', 'R4C4', 'R4C5'],
  ['R5C3', 'R6C4', 'R6C5'],
  ['R5C3', 'R4C2', 'R4C1'],
  ['R5C3', 'R6C2', 'R6C1'],
];

// These are the two drawn white-dot dominoes.
const whiteDots = [
  ['R1C2', 'R1C3'],
  ['R9C2', 'R9C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
