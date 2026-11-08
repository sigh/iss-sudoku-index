// Title: Royalty
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=I96L2l9zJ2g
// Source: https://sudokupad.app/james-sinclair/royalty

// Normal Sudoku, standard arrows (repeats allowed), purple renbans, and even shaded squares.
// Paths transcribed from the purple strokes, including intervening cell centres.
const renbans = [
  ['R8C3', 'R7C4', 'R7C5', 'R7C6', 'R6C7', 'R5C7', 'R4C7', 'R3C8'],
  ['R9C4', 'R9C5'],
  ['R8C2', 'R8C1', 'R7C1'],
  ['R1C2', 'R2C2', 'R2C3'],
];
// Paths transcribed from arrow shafts with the connected white circle first.
const arrows = [
  ['R9C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R3C9', 'R4C8', 'R5C8', 'R6C8'],
  ['R5C5', 'R6C6', 'R7C7', 'R8C8'],
  ['R5C5', 'R4C4', 'R3C3', 'R3C2', 'R3C1'],
  ['R5C5', 'R4C6', 'R3C6'],
  ['R5C5', 'R6C4', 'R6C3'],
  ['R2C7', 'R1C6', 'R1C5'],
];
// The five shaded square centres.
const evens = ['R7C7', 'R6C6', 'R1C8', 'R4C2', 'R5C1'];
return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...evens.map(cell => new Given(cell, 2, 4, 6, 8)),
];
