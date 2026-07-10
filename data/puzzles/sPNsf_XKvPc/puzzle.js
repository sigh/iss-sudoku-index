// Title: Breadcrumbs
// Author: WickedlyRested
// Video: https://www.youtube.com/watch?v=sPNsf_XKvPc
// Source: https://sudokupad.app/bzxfyaldby

// Normal sudoku. Killer cages sum to the given total with no repeated digits.
// Shaded regions are all-different. Black Kropki dots mark 1:2 ratios.

const givens = [
  ['R2C1', 6],
  ['R3C3', 9],
  ['R4C4', 1],
  ['R6C4', 7],
  ['R6C6', 9],
  ['R8C4', 9],
  ['R9C9', 9],
];

const cages = [
  [16, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [16, 'R1C4', 'R1C5', 'R1C6'],
  [19, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [16, 'R4C9', 'R5C9', 'R6C9'],
  [20, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [18, 'R9C4', 'R9C5', 'R9C6'],
  [15, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [14, 'R4C1', 'R5C1', 'R6C1'],
  [18, 'R2C5', 'R3C5', 'R4C5'],
  [12, 'R6C5', 'R7C5', 'R8C5'],
  [15, 'R5C4', 'R5C5', 'R5C6'],
  [14, 'R4C2', 'R4C3', 'R4C4'],
  [14, 'R6C6', 'R6C7', 'R6C8'],
];

const shadedRegions = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C3', 'R3C2', 'R4C2', 'R4C3', 'R4C4'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C8', 'R3C7', 'R3C6', 'R4C6', 'R4C7', 'R4C8'],
  ['R6C8', 'R6C7', 'R6C6', 'R7C6', 'R7C7', 'R7C8', 'R8C8', 'R8C7', 'R8C6'],
  ['R8C4', 'R8C3', 'R8C2', 'R7C2', 'R7C3', 'R7C4', 'R6C4', 'R6C3', 'R6C2'],
];

const blackDots = [
  ['R1C6', 'R2C6'],
  ['R4C6', 'R5C6'],
  ['R2C2', 'R2C3'],
  ['R2C2', 'R3C2'],
  ['R4C1', 'R5C1'],
  ['R7C3', 'R7C4'],
  ['R8C2', 'R9C2'],
  ['R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...shadedRegions.map(cells => new AllDifferent(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
