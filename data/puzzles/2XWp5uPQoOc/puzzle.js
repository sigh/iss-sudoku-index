// Title: Barbed Wire
// Author: Jobo
// Video: https://www.youtube.com/watch?v=2XWp5uPQoOc
// Source: https://app.crackingthecryptic.com/sudoku/RD6TD6R2jj

// Normal Sudoku rules, both marked diagonals, and each drawn arrow: its arm
// digits sum to its circled cell. The arrays below are the sixteen separate
// arrow entries in the source geometry; a shared arm endpoint does not merge them.
const arrows = [
  ['R5C5', 'R4C5', 'R4C4'], ['R5C5', 'R5C6', 'R4C6'],
  ['R5C5', 'R6C5', 'R6C6'], ['R5C5', 'R5C4', 'R6C4'],
  ['R7C3', 'R6C3', 'R6C4'], ['R7C3', 'R7C2', 'R8C2'],
  ['R9C1', 'R8C1', 'R8C2'], ['R7C7', 'R6C7', 'R6C6'],
  ['R7C7', 'R7C8', 'R8C8'], ['R9C9', 'R8C9', 'R8C8'],
  ['R3C3', 'R4C3', 'R4C4'], ['R3C3', 'R2C3', 'R2C2'],
  ['R1C1', 'R1C2', 'R2C2'], ['R1C9', 'R1C8', 'R2C8'],
  ['R3C7', 'R4C7', 'R4C6'], ['R3C7', 'R2C7', 'R2C8'],
];

return [
  new Shape('9x9'),
  new Given('R5C2', 2), new Given('R5C3', 7),
  new Given('R5C7', 8), new Given('R5C8', 3),
  new Diagonal(-1), new Diagonal(1),
  ...arrows.map(cells => new Arrow(...cells)),
];
