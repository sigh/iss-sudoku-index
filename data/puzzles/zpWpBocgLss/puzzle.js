// Title: Unlikely friends
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=zpWpBocgLss
// Source: https://sudokupad.app/hewaby2tso

// Normal Sudoku rules are supplied by the 9x9 shape.
const thermometers = [
  ['R2C1', 'R3C2', 'R4C3', 'R3C4', 'R2C3'],
  ['R2C7', 'R3C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R4C6', 'R5C5', 'R4C4', 'R3C5', 'R2C5'],
  ['R4C2', 'R5C3'],
  ['R4C8', 'R5C7'],
  ['R8C6', 'R8C5'],
].map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  new Given('R6C4', 5),
  new AntiKnight(),
  ...thermometers,
];
