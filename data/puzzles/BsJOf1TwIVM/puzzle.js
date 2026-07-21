// Title: Sagitta Speakeasy
// Author: Katie Splendor
// Video: https://www.youtube.com/watch?v=BsJOf1TwIVM
// Source: https://sudokupad.app/wfdp6hfned

// Standard Sudoku. Green cells form an extra region. Hollow teal lines are
// modular lines; each consecutive triple contains all three residues modulo 3.
// Only the indicated XV and Kropki clues apply.

const extraRegion = [
  'R1C9', 'R2C2', 'R3C4', 'R4C3', 'R5C5',
  'R6C7', 'R7C6', 'R8C8', 'R9C1',
];

const modularLines = [
  ['R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7'],
  ['R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5'],
  [
    'R7C6', 'R8C6', 'R8C7', 'R8C8', 'R7C8',
    'R6C8', 'R6C7', 'R5C6', 'R6C5', 'R7C6', 'R8C6',
  ],
  [
    'R2C4', 'R3C4', 'R4C5', 'R5C4', 'R4C3',
    'R4C2', 'R3C2', 'R2C2', 'R2C3', 'R2C4', 'R3C4',
  ],
];

const xClues = [
  ['R2C2', 'R3C2'],
  ['R8C8', 'R8C9'],
  ['R2C6', 'R2C7'],
  ['R1C1', 'R1C2'],
];

const vClues = [
  ['R2C2', 'R2C3'],
  ['R8C7', 'R8C8'],
  ['R8C1', 'R9C1'],
  ['R1C9', 'R2C9'],
];

const blackDots = [
  ['R5C6', 'R5C7'],
  ['R5C3', 'R5C4'],
];

const whiteDots = [
  ['R3C5', 'R4C5'],
  ['R6C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  new AllDifferent(...extraRegion),
  ...modularLines.map(cells => new Modular(3, ...cells)),
  ...xClues.map(cells => new X(...cells)),
  ...vClues.map(cells => new V(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
