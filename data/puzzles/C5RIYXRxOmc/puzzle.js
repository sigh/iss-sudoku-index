// Title: Staples
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=C5RIYXRxOmc
// Source: https://sudokupad.app/7cwlm6e7a7

// Normal sudoku, arrow sums, and teal modular lines. No rules are omitted.
// Paths transcribed from the eight drawn arrows, with each circled bulb first.
const arrows = [
  ['R4C1', 'R4C2', 'R4C3'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R5C8', 'R5C9', 'R6C9'],
  ['R5C8', 'R4C8', 'R4C7'],
  ['R3C4', 'R4C5', 'R5C5', 'R6C6'],
  ['R9C5', 'R8C5', 'R7C5'],
  ['R9C5', 'R8C6', 'R7C7'],
  ['R9C1', 'R8C2', 'R7C3'],
];
// Paths transcribed from the five teal strokes, including intermediate cells.
const modularLines = [
  ['R5C7', 'R4C6', 'R5C6', 'R6C7', 'R7C8', 'R7C9', 'R6C8'],
  ['R5C3', 'R4C4', 'R5C4', 'R6C3', 'R7C2', 'R7C1', 'R6C2'],
  ['R1C1', 'R2C1', 'R2C2', 'R1C3'],
  ['R2C9', 'R2C8', 'R1C7'],
  ['R2C5', 'R3C5', 'R3C6', 'R3C7'],
];
return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...modularLines.map(cells => new Modular(3, ...cells)),
];
