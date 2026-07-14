// Title: Power Four
// Author: Braden Weber
// Video: https://www.youtube.com/watch?v=q6KqCrSnB-s
// Source: https://sudokupad.app/l7ymh0s7kf

// Place 1-9 once each in every row, column, and irregular region.
// Arrow arms sum to their circles. White Kropki dots are consecutive;
// black dots are 1:2, with no negative Kropki rule. Every three cells on
// a mint line form a complete residue system modulo 3. The gray square is even.

const regions = [
  ['R2C1', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C4', 'R4C4', 'R4C5', 'R4C6'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C8'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C9'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R7C2', 'R7C3', 'R8C2', 'R8C3', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R3C2', 'R4C2', 'R5C2', 'R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R8C5'],
  ['R4C3', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R6C6', 'R7C5', 'R7C6'],
  ['R4C7', 'R5C7', 'R5C8', 'R6C7', 'R6C8', 'R7C7', 'R7C8', 'R8C6', 'R8C7'],
];

const arrows = [
  ['R7C3', 'R6C3', 'R6C2'],
  ['R6C4', 'R5C4', 'R5C3'],
  ['R9C7', 'R9C8', 'R8C8'],
  ['R8C6', 'R8C7', 'R7C7'],
  ['R5C5', 'R4C5', 'R4C4'],
];

const whiteDots = [
  ['R1C3', 'R1C4'],
  ['R2C9', 'R3C9'],
  ['R3C3', 'R3C4'],
  ['R7C1', 'R8C1'],
  ['R9C3', 'R9C4'],
  ['R5C6', 'R5C7'],
];

const blackDots = [
  ['R1C5', 'R2C5'],
  ['R3C6', 'R4C6'],
];

const modularLines = [
  ['R5C1', 'R6C1', 'R7C1'],
  ['R5C9', 'R6C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),

  new Given('R5C5', 4),
  new Given('R7C8', 2, 4, 6, 8),

  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...modularLines.map(cells => new Modular(3, ...cells)),
];
