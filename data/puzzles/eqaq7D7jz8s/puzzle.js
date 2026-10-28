// Title: Hodgepodge
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=eqaq7D7jz8s
// Source: https://sudokupad.app/james-sinclair/hodgepodge

// Standard Sudoku with arrows, purple renbans, X clues and quadruples.
// The following cell lists transcribe the five drawn arrows, bulb first.
const arrows = [
  ['R5C5', 'R6C6', 'R7C7'],
  ['R9C9', 'R8C8', 'R7C8', 'R6C8'],
  ['R1C1', 'R2C2', 'R2C3', 'R2C4'],
  ['R3C7', 'R4C6', 'R4C5'],
  ['R8C2', 'R9C2', 'R9C1', 'R8C1'],
];
// The two purple strokes, with each traversed cell included.
const renbans = [
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C4', 'R9C4'],
  ['R2C7', 'R2C8', 'R3C8'],
];
// The eight drawn X marks, one pair per mark.
const xs = [
  ['R5C1', 'R6C1'], ['R5C2', 'R6C2'], ['R5C3', 'R6C3'],
  ['R7C4', 'R7C5'], ['R8C4', 'R8C5'], ['R9C4', 'R9C5'],
  ['R1C8', 'R1C9'], ['R2C5', 'R2C6'],
];
return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...xs.map(cells => new X(...cells)),
  // Top-left cells and digits of the two drawn corner circles.
  new Quad('R4C1', 8),
  new Quad('R8C5', 8),
];
